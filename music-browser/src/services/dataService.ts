import Axios, { AxiosRequestConfig } from 'axios';

import {Album, Artist, SearchParams, SearchResults} from '../models/models.ts';
import {DiscographyType, EntityType} from '../enums/enums.ts';

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

export const getArtist = async (id: string): Promise<Artist> => {
    const response = await Axios.get<Artist>(`${import.meta.env.VITE_API_URL}/lookup/artist/${id}`, getRequestConfig());
    return response.data;
};

export const getArtistDiscography = async (id: string, discogType: DiscographyType, offset?: number): Promise<Album[]> => {
    let url = `${import.meta.env.VITE_API_URL}/lookup/artist/${id}/discography?discogType=${discogType}`;

    if (offset !== undefined) {
        url += `&offset=${offset}`;
    }

    const response = await Axios.get<Album[]>(url, getRequestConfig());
    return response.data;
};

const getRequestConfig = (): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {};

    config.headers = {
        'Content-Type': 'application/json'
    };

    return config;
};
