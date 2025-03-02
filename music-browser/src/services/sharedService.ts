import { RefObject } from 'react';
import { ReactImageGalleryItem } from 'react-image-gallery';
import InstaView from '../lib/InstaView/instaview';

import { Album, Artist } from '../models/models.ts';
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

export const getEntityImageList = (entity: Artist | Album): ReactImageGalleryItem[] => {
    return entity.images.slice(0, 10).map((item) => {
        return {
            original: item.url
        };
    });
};

export const convertWikiTextToHTML = (text: string) =>{
    let result = '';

    if (text) {
        try {
            result = InstaView.convert(text);
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
        releaseDate: '',
        artist: '',
        images: [],
        tags: [],
        links: []
    }
}

export const scrollToTop = (ref: RefObject<HTMLElement>) => {
    if (ref && ref.current) {
        ref.current.scrollIntoView();
    }
}
