import { RefObject } from 'react';
import Resizer from 'react-image-file-resizer';
import { DateTime } from 'luxon';

import { HikeSearchParams } from '../models/models';

export const dateFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
};

export const getSearchRequestParams = (searchParams: URLSearchParams) => {
    const searchRequestParams: HikeSearchParams = {};
    const searchText = searchParams.get('searchText');

    if (searchText) {
        if (searchText.toLowerCase().startsWith('date:')) {
            const index = searchText.indexOf('-');

            if (index > -1) {
                searchRequestParams.startDate = searchText.slice(5, index).trim();
                searchRequestParams.endDate = searchText.slice(index + 1).trim();
            } else {
                searchRequestParams.startDate = searchText.slice(5).trim();
            }
        } else {
            searchRequestParams.searchText = searchText
        }
    }

    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 10;
    searchRequestParams.page = page ? Number(page) : 1;
    searchRequestParams.pageSize = pageSize ? Number(pageSize) : 10;

    return searchRequestParams;
};

export const getThumbnailSrc = (filePath: string) => {
    let thumbnailSrc = '/images/no_hike_images.png';

    if (filePath) {
        const photoExt = filePath.split('.').pop() || '';
        thumbnailSrc = `${process.env.REACT_APP_API_URL}/images/` + filePath.replace(`.${photoExt}`, `_thumbnail.${photoExt}`);
    }

    return thumbnailSrc;
};

export const getThumbnailDataSrc = (file: File, maxSize: number) => new Promise<string>(resolve => {
    Resizer.imageFileResizer(file, maxSize, maxSize, 'JPEG', 100, 0,
        uri => {
            resolve(uri as string);
        }, 'base64' );
});

export const formatDateValue = (date: string) => {
    const dateParts = date.split('-');
    return `${Number(dateParts[1])}/${Number(dateParts[2])}/${dateParts[0]}`;
};

export const formatEpochValue = (epochValue: number, format?: Intl.DateTimeFormatOptions) => {
    const parsedDate = DateTime.fromMillis(epochValue);

    return parsedDate.toLocaleString(format ? format : DateTime.DATETIME_FULL);
};

export const formatISODateValue = (date: Date | string | undefined, format?: Intl.DateTimeFormatOptions) => {
    let formattedDate = '';

    if (date) {
        const parsedDate = DateTime.fromISO(date.toString());
        formattedDate = parsedDate.toLocaleString(format ? format : DateTime.DATETIME_FULL);
    }

    return formattedDate;
}

export const scrollToTop = (ref: RefObject<HTMLElement>) => {
    if (ref && ref.current) {
        ref.current.scrollIntoView();
    }
}
