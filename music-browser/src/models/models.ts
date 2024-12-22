export interface Image {
    url: string;
}

export interface SearchParams {
    page?: number;
    pageSize?: number;
    query: string;
}

export interface SearchResults {
    rows: SearchResultEntity[];
    count: number;
}

export interface SearchResultEntity {
    id: string;
    name: string;
    artist: string;
    score: number;
    tags: string[];
}
