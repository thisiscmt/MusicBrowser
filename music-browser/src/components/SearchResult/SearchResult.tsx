import React, { FC } from 'react';
import { Box, Typography, Chip, Card, CardContent} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import * as SharedService from '../../services/sharedService';
import { SearchResultEntity } from '../../models/models.ts';

const useStyles = makeStyles()((theme) => ({
    cardContent: {
        display: 'flex',

        [theme.breakpoints.down(500)]: {
            flexDirection: 'column'
        },
    },

    thumbnail: {
        alignItems: 'start',
        display: 'flex',
        // minWidth: `${PHOTO_THUMBNAIL_SIZE}px`,
        // width: `${PHOTO_THUMBNAIL_SIZE}px`
    },

    details: {
        marginLeft: '40px',

        '& .MuiChip-root': {
            marginRight: '8px',
            marginTop: '6px'
        },

        '& .MuiChip-root:last-child': {
            marginRight: 0
        },

        // [theme.breakpoints.down(HOME_PAGE_FIRST_BREAKPOINT)]: {
        //     marginLeft: '20px',
        // },

        [theme.breakpoints.down(500)]: {
            marginLeft: 0,
            marginTop: '8px',
        },
    },

    hikers: {
        marginBottom: '5px',
        marginTop: '5px'
    },

    chip: {
        height: 'auto',

        '& .MuiChip-label': {
            paddingBottom: '9px',
            paddingTop: '9px',
            display: 'block',
            whiteSpace: 'normal'
        }
     },

    description: {
        fontSize: '14px',
        marginTop: '12px',
        display: '-webkit-box',
        '-webkitLineClamp': '4',
        '-webkitBoxOrient': 'vertical',
        overflow: 'hidden',
        whiteSpace: 'pre-wrap'
    }
}));

interface SearchResultProps {
    entity: SearchResultEntity;
}

const SearchResult: FC<SearchResultProps> = ({ entity }) => {
    const { classes, cx } = useStyles();
    // const thumbnailSrc = SharedService.getThumbnailSrc(hike.filePath || '');
    // const hikers = hike.fullNames ? hike.fullNames.split(',') : [];
    //
    // const getHikeDateValue = () => {
    //     let dateValue = SharedService.formatDateValue(hike.dateOfHike);
    //
    //     if (hike.endDateOfHike) {
    //         dateValue += ` - ${SharedService.formatDateValue(hike.endDateOfHike)}`;
    //     }
    //
    //     return dateValue;
    // };

    return (
        <Card>
            <CardContent className={cx(classes.cardContent)}>
                {/*<Box className={cx(classes.thumbnail)}>*/}
                {/*    <img alt='Hike pic' src={thumbnailSrc} aria-label='Hike pic' />*/}
                {/*</Box>*/}

                {/*<Box className={cx(classes.details)}>*/}
                {/*    <Typography variant='body2'>{hike.trail}</Typography>*/}
                {/*    <Typography variant='body2'>{getHikeDateValue()}</Typography>*/}

                {/*    {*/}
                {/*        hikers && hikers.length > 0 &&*/}
                {/*        <Box className={cx(classes.hikers)}>*/}
                {/*            {*/}
                {/*                hikers.map((hiker: string, index: number) => {*/}
                {/*                    return (*/}
                {/*                        <Chip key={index} label={hiker.trim()} variant='outlined' color='primary' className={cx(classes.chip)} />*/}
                {/*                    );*/}
                {/*                })*/}
                {/*            }*/}
                {/*        </Box>*/}
                {/*    }*/}

                {/*    <Box className={cx(classes.description)}>{hike.description}</Box>*/}
                {/*</Box>*/}
            </CardContent>
        </Card>
    )
};

export default SearchResult;
