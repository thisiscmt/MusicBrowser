import Axios, {AxiosHeaders, AxiosRequestConfig} from 'axios';

import { ArtistEntity, SearchParams, SearchResults } from '../models/models.ts';
import { EntityType } from '../enums/enums.ts';
import * as Constants from '../constants/constants.ts';

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
    const response = await Axios.get<ArtistEntity>(`${import.meta.env.VITE_API_URL}/lookup/artist/${id}`, getRequestConfig(Constants.ARTIST_LOOKUP_CACHE_MAX_AGE));
    return response.data;
};

const getRequestConfig = (maxAge?: number): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {};
    const headers = new AxiosHeaders({
        'Content-Type': 'application/json'
    });

    if (maxAge !== undefined) {
        headers.set('Cache-Control', `max-age=${maxAge}`);
    }

    config.headers = headers;

    return config;
};


