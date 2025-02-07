import { RefObject } from 'react';
import { ReactImageGalleryItem } from 'react-image-gallery';

import {AlbumEntity, ArtistEntity} from '../models/models.ts';

export const formatDateValue = (dateStr: string) => {
    let formattedDate = dateStr;

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
                month: 'long'
            }).format(date);
        }
    } catch (error) {
        // Log this somewhere
        console.log(error);
    }

    return formattedDate;
};

export const getEntityImageList = (entity: ArtistEntity | AlbumEntity): ReactImageGalleryItem[] => {
    return entity.images.slice(0, 10).map((item) => {
        return {
            original: item.url
        };
    });
};

export const getEmptyArtist = (): ArtistEntity => {
    return {
        id: '',
        name: '',
        artistType: '',
        description: '',
        comment: '',
        lifeSpan: { begin: '', end: '', ended: false },
        area: { name: '' },
        beginArea: { name: '' },
        endArea: { name: '' },
        tags: [],
        images: [],
        albums: [],
        members: [],
        links: []
    }
}

export const scrollToTop = (ref: RefObject<HTMLElement>) => {
    if (ref && ref.current) {
        ref.current.scrollIntoView();
    }
}
