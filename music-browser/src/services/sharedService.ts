import { RefObject } from 'react';
import {AlbumEntity, ArtistEntity, Member} from '../models/models.ts';

// export const formatDateValue = (date: string) => {
//     const dateParts = date.split('-');
//     return `${Number(dateParts[1])}/${Number(dateParts[2])}/${dateParts[0]}`;
// };
//
// export const formatEpochValue = (epochValue: number, format?: Intl.DateTimeFormatOptions) => {
//     const parsedDate = DateTime.fromMillis(epochValue);
//
//     return parsedDate.toLocaleString(format ? format : DateTime.DATETIME_FULL);
// };
//
// export const formatISODateValue = (date: Date | string | undefined, format?: Intl.DateTimeFormatOptions) => {
//     let formattedDate = '';
//
//     if (date) {
//         const parsedDate = DateTime.fromISO(date.toString());
//         formattedDate = parsedDate.toLocaleString(format ? format : DateTime.DATETIME_FULL);
//     }
//
//     return formattedDate;
// }

export const getEmptyArtist = (): ArtistEntity => {
    return {
        id: '',
        name: '',
        description: '',
        lifeSpan: { begin: '', end: '', ended: false },
        area: { name: '' },
        beginArea: { name: '' },
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
