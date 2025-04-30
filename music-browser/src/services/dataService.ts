import Axios, { AxiosRequestConfig } from 'axios';

import { Album, Artist, Song, DiscographyResults, SearchParams, SearchResults } from '../models/models.ts';
import { DiscographyType, EntityType } from '../enums/enums.ts';

const search = async (entityType: EntityType, searchParams: SearchParams): Promise<SearchResults> => {
    const config = getRequestConfig();
    config.params = { ...searchParams };

    const response = await Axios.get<SearchResults>(`${import.meta.env.VITE_API_URL}/search/${entityType}`, config);
    return response.data;
};

export const searchArtists = async (searchParams: SearchParams): Promise<SearchResults> => {
    return search(EntityType.Artist, searchParams);
};

export const searchAlbums = async (searchParams: SearchParams): Promise<SearchResults> => {
    return search(EntityType.Album, searchParams);
};

export const searchSongs = async (searchParams: SearchParams): Promise<SearchResults> => {
    return search(EntityType.Song, searchParams);
};

export const getArtist = async (id: string, pageSize: number | undefined): Promise<Artist> => {
    const queryString = pageSize !== undefined ? `?pageSize=${pageSize}` : '';
    const response = await Axios.get<Artist>(`${import.meta.env.VITE_API_URL}/lookup/artist/${id}${queryString}`, getRequestConfig());

    return response.data;
};

export const getAlbum = async (id: string, artistId: string | undefined | null): Promise<Album> => {
    const queryString = artistId ? `?artistId=${artistId}` : '';
    const response = await Axios.get<Album>(`${import.meta.env.VITE_API_URL}/lookup/album/${id}${queryString}`, getRequestConfig());

    return response.data;
};

export const getSong = async (id: string): Promise<Song> => {
    const response = await Axios.get<Song>(`${import.meta.env.VITE_API_URL}/lookup/song/${id}`, getRequestConfig());

    return response.data;
};

export const getDiscography = async (entityId: string, discogType: DiscographyType, entityType: EntityType, page?: number, pageSize?: number): Promise<DiscographyResults> => {
    let url = `${import.meta.env.VITE_API_URL}/lookup/discography/${entityType}/${entityId}?discogType=${discogType}`;
    const pageParam = page ? page : 1;
    const pageSizeParam = pageSize ? pageSize : 10;

    url += `&page=${pageParam}&pageSize=${pageSizeParam}`;

    const response = await Axios.get<DiscographyResults>(url, getRequestConfig());
    return response.data;
};

const getRequestConfig = (): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {};

    config.headers = {
        'Content-Type': 'application/json'
    };

    return config;
};
