import { RefObject } from 'react';

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

export const scrollToTop = (ref: RefObject<HTMLElement>) => {
    if (ref && ref.current) {
        ref.current.scrollIntoView();
    }
}
