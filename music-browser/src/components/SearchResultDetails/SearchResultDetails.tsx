import React, { FC } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { SearchResult } from '../../models/models.ts';
import { Colors } from '../../services/themeService.ts';
import { EntityType } from '../../enums/enums.ts';
import { Link } from 'react-router';

const useStyles = tss.create(({ theme }) => ({
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

    mainTitle: {
        fontWeight: 'bold'
    },

    link: {
        lineHeight: 1,
        marginBottom: '8px',

        '& a': {
            color: theme.palette.text.primary,
            textDecoration: 'none',

            '&:hover': {
                color: Colors.secondaryTextColor
            }
        }
    },

    secondaryLink: {
        marginBottom: '5px'
    },

    tagContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '9px'
    },

    tag: {
        backgroundColor: Colors.chipBackgroundColor,
        borderRadius: '4px',
        color: Colors.white,
        fontSize: '14px',
        marginRight: '8px',
        marginTop: '6px',
        padding: '3px 5px'
     }
}));

interface SearchResultDetailsProps {
    entity: SearchResult;
    image: string;
}

const SearchResultDetails: FC<SearchResultDetailsProps> = ({ entity, image }) => {
    const { classes, cx } = useStyles();

    return (
        <Card variant='outlined'>
            <CardContent className={cx(classes.cardContent)}>
                <img src={image} alt='Search result image' className={cx(classes.thumbnail)}/>

                <Box>
                    <Typography variant='body1' className={cx(classes.mainTitle, classes.link)}>
                        <Link to={`/${entity.entityType.toString()}/${entity.id}`}>{entity.name}</Link>
                    </Typography>

                    {
                        entity.entityType !== EntityType.Artist &&
                        <Typography variant='body2' className={cx(classes.link, classes.secondaryLink)}>
                            <Link to={`/artist/${entity.artistId}`}>{entity.artist}</Link>
                        </Typography>
                    }

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

                    {
                        entity.score !== undefined &&
                        <Typography variant='body2'>Score: {entity.score}</Typography>
                    }
                </Box>
            </CardContent>
        </Card>
    )
};

export default SearchResultDetails;
