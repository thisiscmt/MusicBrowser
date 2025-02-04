import Axios, { AxiosRequestConfig } from 'axios';

import { ArtistEntity, SearchParams, SearchResults } from '../models/models.ts';
import { EntityType } from '../enums/enums.ts';

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
export const getArtist = async (id: string): Promise<ArtistEntity> => {
    const response = await Axios.get<ArtistEntity>(`${import.meta.env.VITE_API_URL}/lookup/artist/${id}`, getRequestConfig());
    return response.data;
};


const getRequestConfig = (): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {};

    config.headers = {
        'Content-Type': 'application/json'
    };

    return config;
};


