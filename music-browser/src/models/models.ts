export interface Image {
    url: string;
    height?: number;
    width?: number;
}

export interface SearchResultEntity {
    id: string;
    name: string;
    artist: string;
    score: number;
    tags: string[];
}
