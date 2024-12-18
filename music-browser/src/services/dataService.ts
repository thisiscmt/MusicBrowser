import Axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

import { Hike, Hiker, HikeSearchParams, LoginResponse, Photo, Session, User } from '../models/models';
import * as Constants from '../constants/constants';

Axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (Axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem(Constants.STORAGE_FULL_NAME);
        localStorage.removeItem(Constants.STORAGE_ROLE);
        localStorage.removeItem(Constants.STORAGE_LAST_LOGIN);

        const returnUrl = window.location.search ? `${window.location.pathname}${window.location.search}` : window.location.pathname;

        window.location.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
        return Promise.reject(error);
    }
});

export const getHikes = async (searchParams?: HikeSearchParams): Promise<{ rows: Hike[]; count: number }> => {
    const config = getRequestConfig();

    if (searchParams) {
        config.params = { ...searchParams };
    }

    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/hike`, config);
    return response.data;
};

export const getHike = async (hikeId: string): Promise<Hike> => {
    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/hike/${hikeId}`, getRequestConfig());
    return response.data;
};

export const createHike = async (hike: Hike, signal: AbortSignal, onUploadProgress?: (axiosProgressEvent: AxiosProgressEvent) => void): Promise<Hike> => {
    const formData = getFormData(hike);
    const config = getRequestConfig(true);
    config.signal = signal;
    config.headers!['x-diht-trail'] = hike.trail;
    config.headers!['x-diht-date-of-hike'] = hike.dateOfHike;

    if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
    }

    const response = await Axios.post(`${process.env.REACT_APP_API_URL}/hike`, formData, config);
    return response.data;
};

export const updateHike = async (hike: Hike, signal?: AbortSignal, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<Hike> => {
    const formData = getFormData(hike);
    const config = getRequestConfig(true);
    config.signal = signal;
    config.headers!['x-diht-trail'] = hike.trail;
    config.headers!['x-diht-date-of-hike'] = hike.dateOfHike;

    if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
    }

    const response = await Axios.put(`${process.env.REACT_APP_API_URL}/hike/${hike.id}`, formData, config);
    return response.data;
};

export const deleteHike = (hikeId: string) => {
    return Axios.delete(`${process.env.REACT_APP_API_URL}/hike/${hikeId}`, getRequestConfig());
};

export const getHikers = async (): Promise<string[]> => {
    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/hiker`, getRequestConfig());
    return response.data;
};

export const getUsers = async (): Promise<User[]> => {
    const config = getRequestConfig();
    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/admin/user`, config);

    return response.data.rows;
};

export const getUser = async (userId: string): Promise<User> => {
    const config = getRequestConfig();
    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/admin/user/${userId}`, config);

    return response.data;
};

export const createUser = async (user: User): Promise<void> => {
    const config = getRequestConfig();

    return await Axios.post(`${process.env.REACT_APP_API_URL}/admin/user`, user, config);
};

export const updateUser = async (user: User): Promise<void> => {
    const config = getRequestConfig();

    return await Axios.put(`${process.env.REACT_APP_API_URL}/admin/user/${user.id}`, user, config);
};

export const deleteUser = (userId: string) => {
    return Axios.delete(`${process.env.REACT_APP_API_URL}/admin/user/${userId}`, getRequestConfig());
};

export const getSessions = async (): Promise<Session[]> => {
    const config = getRequestConfig();
    const response = await Axios.get(`${process.env.REACT_APP_API_URL}/admin/session`, config);

    return response.data.rows;
};

export const deleteSession = (sid: string) => {
    return Axios.delete(`${process.env.REACT_APP_API_URL}/admin/session/${sid}`, getRequestConfig());
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await Axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password }, getRequestConfig());

    return response.data;
};

export const logout = async () => {
    return await Axios.delete(`${process.env.REACT_APP_API_URL}/auth`, getRequestConfig());
};

export const logError = (errorData: any) => {
    Axios.post(`${process.env.REACT_APP_API_URL}/error`, { errorData }, getRequestConfig()).catch((error) => {
        console.log('Something went wrong while logging error information: %o', error.message);
    });
};

const getRequestConfig = (multipartRequest: boolean = false): AxiosRequestConfig => {
    const config: AxiosRequestConfig = {
        withCredentials: true
    };
    let contentType = 'application/json';

    if (multipartRequest) {
        contentType = 'multipart/form-data'
    }

    config.headers = {
        'Content-Type': contentType
    };

    return config;
};

const getFormData = (hike: Hike) => {
    const formData = new FormData();

    formData.append('trail', hike.trail);
    formData.append('dateOfHike', hike.dateOfHike);
    formData.append('endDateOfHike', hike.endDateOfHike || '');

    if (hike.conditions) {
        formData.append('conditions', hike.conditions);
    }

    if (hike.crowds) {
        formData.append('crowds', hike.crowds);
    }

    if (hike.description) {
        formData.append('description', hike.description);
    }

    if (hike.hikers && hike.hikers.length > 0) {
        formData.append('hikers', hike.hikers.map((hiker: Hiker) => hiker.fullName).join(','));
    }

    if (hike.tags) {
        formData.append('tags', hike.tags);
    }

    if (hike.link) {
        formData.append('link', hike.link);
    }

    if (hike.linkLabel) {
        formData.append('linkLabel', hike.linkLabel);
    }

    if (hike.photos) {
        hike.photos.forEach((photo: Photo) => {
            if (photo.file) {
                formData.append('files', photo.file);
            }
        });

        const photoMetadata = hike.photos.map((photo: Photo) => {
            if (photo.action) {
                return {
                    id: photo.id,
                    fileName: photo.fileName,
                    caption: photo.caption,
                    ordinal: photo.ordinal,
                    action: photo.action
                };
            } else {
                return undefined;
            }
        }).filter((metadata: any) => metadata);

        if (photoMetadata.length > 0) {
            formData.append('photos', JSON.stringify(photoMetadata));
        }
    }

    return formData;
};
