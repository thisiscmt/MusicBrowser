import Axios, { AxiosRequestConfig } from 'axios';

import {SearchParams, SearchResultEntity} from '../models/models.ts';
import {ENTITY_TYPE} from '../enums/enums.ts';

export const searchArtists = async (searchParams: SearchParams): Promise<{ rows: SearchResultEntity[]; count: number }> => {
    return search(ENTITY_TYPE.Artist, searchParams);
};

export const searchAlbums = async (searchParams: SearchParams): Promise<{ rows: SearchResultEntity[]; count: number }> => {
    return search(ENTITY_TYPE.Album, searchParams);
};

const search = async (entityType: ENTITY_TYPE, searchParams: SearchParams): Promise<{ rows: SearchResultEntity[]; count: number }> => {
    const config = getRequestConfig();
    config.params = { ...searchParams };

    const response = await Axios.get(`${import.meta.env.VITE_API_URL}/search/${entityType}`, config);
    return response.data;
};

const getRequestConfig = (): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {};

    config.headers = {
        'Content-Type': 'application/json'
    };

    return config;
};


