import { EntityType } from '../enums/enums.ts';

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
    artistId: string;
    score: number;
    tags: string[];
    entityType: EntityType;
}
