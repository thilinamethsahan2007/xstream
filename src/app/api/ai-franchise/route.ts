import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { tmdb } from '@/lib/tmdb';
import { supabase } from '@/lib/supabase';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
        You are a movie expert. Curate an EXHAUSTIVE and COMPLETE chronological timeline of movies and TV shows for the franchise: "${query}".
        You MUST include EVERY SINGLE movie, TV series, special, and spin-off that is part of this franchise.
        Do not miss any installments, even minor ones.
        
        CRITICAL: Order them chronologically based on the IN-UNIVERSE timeline (not release date).
        Use IMDb lists or official franchise timelines as your source of truth for the correct chronological order.
        
        Return ONLY a valid JSON array of strings, where each string is the exact title of the movie or TV show.
        Example: ["Star Wars: Episode I - The Phantom Menace", "Star Wars: Episode II - Attack of the Clones", ...]
        Do not include any other text or markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response to ensure valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let titles: string[] = [];
        try {
            titles = JSON.parse(cleanedText);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({ error: 'Failed to curate franchise' }, { status: 500 });
        }

        // Search TMDB for each title to get metadata
        const contentPromises = titles.map(async (title) => {
            try {
                // Search for movie first
                const movieSearch = await tmdb.search.movies({ query: title });
                if (movieSearch.results.length > 0) {
                    const m = movieSearch.results[0];
                    return {
                        id: m.id,
                        title: m.title,
                        poster_path: m.poster_path,
                        backdrop_path: m.backdrop_path,
                        release_date: m.release_date,
                        media_type: 'movie',
                        overview: m.overview
                    };
                }

                // If not found, search for TV show
                const tvSearch = await tmdb.search.tvShows({ query: title });
                if (tvSearch.results.length > 0) {
                    const t = tvSearch.results[0];

                    // Fetch details to get season/episode counts
                    let details: any = {};
                    try {
                        details = await tmdb.tvShows.details(t.id);
                    } catch (err) {
                        console.error(`Failed to fetch TV details for ${t.name}`, err);
                    }

                    return {
                        id: t.id,
                        title: t.name,
                        poster_path: t.poster_path,
                        backdrop_path: t.backdrop_path,
                        release_date: t.first_air_date,
                        media_type: 'tv',
                        overview: t.overview,
                        number_of_seasons: details.number_of_seasons,
                        number_of_episodes: details.number_of_episodes
                    };
                }

                return null;
            } catch (e) {
                console.error(`Failed to fetch metadata for "${title}":`, e);
                return null;
            }
        });

        const rawContent = (await Promise.all(contentPromises)).filter((item) => item !== null);

        // Deduplicate by ID
        const content = Array.from(new Map(rawContent.map(item => [item.id, item])).values());

        // Save to Supabase
        if (content.length > 0) {
            const franchiseId = `ai-${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            const { error: dbError } = await supabase
                .from('franchises')
                .upsert({
                    id: franchiseId,
                    name: query,
                    description: `AI Curated timeline for ${query}`,
                    backdrop_path: content[0].backdrop_path || content[0].poster_path,
                    type: 'keyword',
                    value: 0,
                    is_custom: true,
                    updated_at: new Date().toISOString(),
                    content: content
                }, { onConflict: 'id' })
                .select()
                .single();

            if (dbError) {
                // Ignore duplicate key error, just return content
                if (dbError.code !== '23505') {
                    console.error('Supabase Insert Error:', dbError);
                }
            }
        }

        return NextResponse.json({ content });

    } catch (error) {
        console.error('AI Franchise Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
