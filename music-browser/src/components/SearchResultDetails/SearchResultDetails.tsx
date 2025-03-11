import React, { FC } from 'react';
import { Link } from 'react-router';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import TagCollection from '../TagCollection/TagCollection.tsx';
import { SearchResult } from '../../models/models.ts';
import { GrayAnchorStyles, Colors } from '../../services/themeService.ts';
import { EntityType } from '../../enums/enums.ts';

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

    mainTitle: {
        fontWeight: 'bold'
    },

    link: {
        lineHeight: 1,
        marginBottom: '9px',

        '& a': {
            ...GrayAnchorStyles
        }
    },

    tagContainer: {
        columnGap: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '9px',
        rowGap: '6px'
    },

    tag: {
        backgroundColor: Colors.chipBackgroundColor,
        borderRadius: '4px',
        color: Colors.white,
        fontSize: '14px',
        padding: '3px 5px'
     },

    score: {
        lineHeight: 1
    }
}));

interface SearchResultDetailsProps {
    entity: SearchResult;
    image: string;
}

const SearchResultDetails: FC<SearchResultDetailsProps> = (props: SearchResultDetailsProps) => {
    const { classes, cx } = useStyles();

    return (
        <Card variant='outlined'>
            <CardContent className={cx(classes.cardContent)}>
                <img src={props.image} alt='Search result image' className={cx(classes.thumbnail)}/>

                <Box>
                    <Typography variant='body1' className={cx(classes.mainTitle, classes.link)}>
                        <Link to={`/${props.entity.entityType.toString()}/${props.entity.id}`}>{props.entity.name}</Link>
                    </Typography>

                    {
                        props.entity.entityType !== EntityType.Artist &&
                        <Typography variant='body2' className={cx(classes.link)}>
                            <Link to={`/artist/${props.entity.artistId}`}>{props.entity.artist}</Link>
                        </Typography>
                    }

                    <TagCollection items={(props.entity.tags || []).slice(0, 5)} compact={true} />

                    {
                        props.entity.score !== undefined &&
                        <Typography variant='body2' className={cx(classes.score)}>Score: {props.entity.score}</Typography>
                    }
                </Box>
            </CardContent>
        </Card>
    )
};

export default SearchResultDetails;
