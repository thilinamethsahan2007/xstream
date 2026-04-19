import { NextRequest, NextResponse } from 'next/server';
import { scrapeVidsrc } from '@definisi/vidsrc-scraper';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('id');
    const type = searchParams.get('type') || 'movie';
    const season = searchParams.get('s');
    const episode = searchParams.get('e');

    if (!tmdbId) {
        return NextResponse.json({ error: 'Missing TMDB ID' }, { status: 400 });
    }

    try {
        let result;
        if (type === 'tv' && season && episode) {
            result = await scrapeVidsrc(tmdbId, 'tv', season, episode, { timeout: 15000 });
        } else {
            result = await scrapeVidsrc(tmdbId, 'movie', null, null, { timeout: 15000 });
        }

        if (result && result.success && result.hlsUrl) {
            return NextResponse.json({
                success: true,
                streamUrl: result.hlsUrl,
                subtitles: result.subtitles || [],
            });
        }

        return NextResponse.json({ error: 'Failed to extract stream URL. The provider may be down or the token has changed.' }, { status: 404 });
    } catch (error: any) {
        console.error('Extractor error:', error);
        return NextResponse.json({ error: error.message || 'Internal extractor error' }, { status: 500 });
    }
}
