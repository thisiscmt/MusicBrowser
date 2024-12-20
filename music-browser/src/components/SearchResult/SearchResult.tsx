import React, { FC } from 'react';
import { Box, Typography, Card, CardContent} from '@mui/material';
import { tss } from 'tss-react/mui';

import * as SharedService from '../../services/sharedService';
import { SearchResultEntity } from '../../models/models.ts';

const useStyles = tss.create(({ theme }) => ({
    cardContent: {
        display: 'flex',
        gap: '8px',

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

    tag: {
//        height: 'auto',
        padding: '2px',
//        display: 'block',
        whiteSpace: 'normal'
     }
}));

interface SearchResultProps {
    entity: SearchResultEntity;
    image: string;
}

const SearchResult: FC<SearchResultProps> = ({ entity, image }) => {
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
        <Card variant='outlined'>
            <CardContent className={cx(classes.cardContent)}>
                <Box><img src={`/assets/images/${image}`} alt='Search result image'/></Box>

                <Box>
                    <Typography variant='body2'>{entity.name}</Typography>

                    {
                        entity.tags.length > 0 &&
                        <Box>
                            {
                                entity.tags.map((item: string) => {
                                    return (
                                        <span className={cx(classes.tag)}>{item}</span>
                                    )
                                })

                            }
                        </Box>
                    }
                </Box>


            </CardContent>
        </Card>
    )
};

export default SearchResult;
