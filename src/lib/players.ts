export interface PlayerProps {
    title: string;
    source: string;
    recommended?: boolean;
    fast?: boolean;
    ads?: boolean;
    resumable?: boolean;
}

export const getMoviePlayers = (id: string | number): PlayerProps[] => {
    return [
        {
            title: "Vidking",
            source: `https://www.vidking.net/embed/movie/${id}?color=0a84ff&autoPlay=true`,
            recommended: true,
            fast: true,
            ads: false,
        },
        {
            title: "VidSrc v3",
            source: `https://vidsrc-embed.ru/embed/movie/${id}?autoPlay=true`,
            fast: true,
        },
    ];
};

export const getTvShowPlayers = (
    id: string | number,
    season: number,
    episode: number
): PlayerProps[] => {
    return [
        {
            title: "Vidking",
            source: `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=0a84ff&autoPlay=true&nextEpisode=true&episodeSelector=true`,
            recommended: true,
            fast: true,
            ads: false,
        },
        {
            title: "VidSrc v3",
            source: `https://vidsrc-embed.ru/embed/tv/${id}/${season}/${episode}?autoPlay=true`,
            fast: true,
        },
    ];
};
