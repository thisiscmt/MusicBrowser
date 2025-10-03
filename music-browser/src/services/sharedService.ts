import { ReactImageGalleryItem } from 'react-image-gallery';
import InstaView from '../lib/InstaView/instaview';

import {Album, Artist, Song, EntityDescription, TrackList } from '../models/models.ts';
import { EntityType } from '../enums/enums.ts';
import * as Constants from '../constants/constants.ts';

export const formatDateValue = (dateStr: string) => {
    let formattedDate = dateStr;

    if (dateStr) {
        try {
            const dateParts = dateStr.split('-');
            let date: Date;

            if (dateParts.length === 3) {
                date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));

                formattedDate = new Intl.DateTimeFormat('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(date);
            } else if (dateParts.length === 2) {
                date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1);

                formattedDate = new Intl.DateTimeFormat('en-us', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(date);
            }
        } catch (error) {
            // Log this somewhere
            console.log(error);
        }
    }

    return formattedDate;
};

export const getDefaultPageSize = () => {
    const pageSizeStr = localStorage.getItem(Constants.STORAGE_DEFAULT_PAGE_SIZE);
    const defaultPageSize = 10;
    let pageSize = defaultPageSize;

    if (pageSizeStr) {
        pageSize = Number(pageSizeStr);

        if (isNaN(pageSize)) {
            pageSize = defaultPageSize;
        }
    }

    return pageSize;
};

export const getStockImageUrl = (entityType: EntityType) => {
    return entityType === EntityType.Artist ? Constants.STOCK_ARTIST_IMAGE :
        (entityType === EntityType.Album ? Constants.STOCK_ALBUM_IMAGE : Constants.STOCK_SONG_IMAGE);
};

export const getEntityImageList = (entity: Artist | Album, size?: number): ReactImageGalleryItem[] => {
    const sizeOfList = size === undefined ? 10 : size;

    return entity.images.slice(0, sizeOfList).map((item) => {
        return {
            original: item.url
        };
    });
};

export const getEntityDescription = (desc: string): EntityDescription => {
    const entityDesc: EntityDescription = {
        hasFullDesc: false,
        short: '',
        full: ''
    }

    if (desc) {
        // We normalize line breaks and do general cleanup so we get a nice presentation of the description text
        const newDesc = desc.replace(/(\[\[)\n(\]\])/g, '\n').trim().replace(/\n\n/g, '\n');

        const descParts = newDesc.split('\n');

        if (descParts.length > 0) {
            entityDesc.short = descParts[0];

            if (descParts.length > 1) {
                entityDesc.hasFullDesc = true;
                entityDesc.full = descParts.slice(1).join().replace(/\n/g, '\n\n');
            }
        }
    }

    return entityDesc;
};

export const convertWikiTextToHTML = (text: string) =>{
    let result = '';

    if (text) {
        try {
            result = InstaView.convert(text);

            // Content in <pre> tags doesn't look great next to regular text, so we just put it in paragraphs.
            result = result.replace(/<pre>/g, '<p>');
            result = result.replace(/<\/pre>/g, '</p>');
        } catch (error) {
            // TODO: Log this somewhere
            console.log(error);
        }
    }

    return result;
};

export const getEmptyArtist = (): Artist => {
    return {
        id: '',
        name: '',
        artistType: '',
        description: '',
        comment: '',
        annotation: '',
        lifeSpan: { begin: '', end: '', ended: false },
        area: { name: '' },
        beginArea: { name: '' },
        endArea: { name: '' },
        tags: [],
        genres: [],
        images: [],
        albums: [],
        totalAlbums: 0,
        members: [],
        links: []
    }
}

export const getEmptyAlbum = (): Album => {
    return {
        id: '',
        name: '',
        albumType: '',
        description: '',
        comment: '',
        releaseDate: '',
        label: '',
        catalogNumber: '',
        artist: '',
        artistId: '',
        ordinal: 1,
        images: [],
        tags: [],
        genres: [],
        links: [],
        trackList: []
    }
}

export const getEmptyTrackList = (): TrackList => {
    return {
        tracks: [],
        totalDuration: '',
        position: 0,
        format: ''
    }
}

export const getEmptySong = (): Song => {
    return {
        id: '',
        name: '',
        artist: '',
        artistId: '',
        comment: '',
        duration: '',
        releaseDate: '',
        annotation: '',
        appearsOn: [],
        tags: [],
        links: [],
    }
}
