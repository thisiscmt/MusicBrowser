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
    rows: SearchResult[];
    count: number;
}

export interface SearchResult {
    id: string;
    name: string;
    artist: string;
    artistId: string;
    score: number;
    tags: Tag[];
    entityType: EntityType;
}

export interface LifeSpan {
    begin: string;
    end: string;
    ended: boolean;
}

export interface Member {
    id: string;
    name: string;
    lifeSpan: LifeSpan;
}

export interface Image {
    url: string;
}

export interface Area {
    name: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface LinkEntry {
    label: string;
    target: string;
}

export interface Track {
    id: string;
    name: string;
    duration: string;
    artist: string;
}

export interface TrackList {
    tracks: Track[]
    totalDuration: string;
    position: number;
    format: string;
}

export interface Album {
    id: string;
    name: string;
    albumType: string;
    description: string;
    comment: string;
    releaseDate: string;
    artist: string;
    artistId: string;
    tags: Tag[];
    genres: Tag[];
    images: Image[];
    links: LinkEntry[];
    trackList: TrackList[];
}

export interface Artist {
    id: string;
    name: string;
    artistType: string;
    description: string;
    comment: string;
    annotation: string;
    lifeSpan: LifeSpan;
    area: Area;
    beginArea: Area;
    endArea: Area;
    tags: Tag[];
    genres: Tag[];
    images: Image[];
    albums: Album[];
    totalAlbums: number;
    members: Member[];
    links: LinkEntry[];
}

export interface Song {
    id: string;
    name: string;
    annotation: string;
    appearsOn: Album[];
    writers: Artist[];
    images: Image[];
}

export interface DiscographyResults {
    rows: Album[];
    count: number;
}

export interface EntityDescription {
    hasFullDesc: boolean;
    short: string;
    full: string;
}

