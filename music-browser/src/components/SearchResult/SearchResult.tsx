import React, { FC } from 'react';
import { Box, Typography, Card, CardContent} from '@mui/material';
import { tss } from 'tss-react/mui';

import { SearchResultEntity } from '../../models/models.ts';
import { Colors } from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    card: {
        marginBottom: '2px',

        '&:last-child': {
            marginBottom: 0,
        }
    },

    cardContent: {
        display: 'flex',
        gap: '16px',
        padding: '10px',

        '&:last-child': {
            paddingBottom: '10px',
        }
    },

    thumbnail: {
        height: '100px',
        width: '100px'
    },

    tagContainer: {
        display: 'flex',
        flexWrap: 'wrap'
    },

    tag: {
        backgroundColor: Colors.chipBackgroundColor,
        borderRadius: '4px',
        color: Colors.white,
        fontSize: '14px',
        marginRight: '6px',
        marginTop: '6px',
        padding: '3px 5px'
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
                <img src={image} alt='Search result image' className={cx(classes.thumbnail)}/>

                <Box>
                    <Typography variant='body1'>{entity.name}</Typography>

                    {
                        entity.tags && entity.tags.length > 0 &&
                        <Box className={cx(classes.tagContainer)}>
                            {
                                entity.tags.slice(0, 5).map((item: string, index: number) => {
                                    return (
                                        <Box key={index} className={cx(classes.tag)}>{item}</Box>
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
