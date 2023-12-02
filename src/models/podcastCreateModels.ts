export type Podcast = {
    id: string;
    name: string;
    episodes: Episode[];
};

export type Episode = {
    id: string;
    title: string;
    chapters: Array<PodcastChapter>;
};

export type PodcastChapter = {
    id: string;
    title: string;
    start: number;
    url: string;
    img: string;
    };
