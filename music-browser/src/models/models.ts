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

export interface LifeSpan {
    begin: string;
    end: string;
    ended: boolean;
}

export interface Member {
    name: string;
    lifeSpan: LifeSpan;
}

export interface Image {
    url: string;
}

export interface Area {
    name: string;
}

export interface LinkEntry {
    type: string;
    target: string;
}

export interface AlbumEntity {
    id: string;
    name: string;
}

export interface ArtistEntity {
    id: string;
    name: string;
    description: string;
    lifeSpan: LifeSpan;
    area: Area;
    beginArea: Area;
    tags: string[];
    images: Image[];
    albums: AlbumEntity[];
    members: Member[];
    links: LinkEntry[];
}
