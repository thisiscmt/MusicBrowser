import React, { FC } from 'react';
import { Link } from 'react-router';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Image } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { GrayAnchorStyles } from '../../services/themeService.ts';
import * as SharedService from '../../services/sharedService';

const useStyles = tss.create(() => ({
    cardContent: {
        display: 'flex',
        gap: '16px',
        padding: '10px',

        '&:last-child': {
            paddingBottom: '10px'
        }
    },

    thumbnail: {
        height: '52px',
        width: '52px'
    },

    mainTitle: {
        fontWeight: 'bold'
    },

    content: {
        alignContent: 'space-evenly'
    },

    link: {
        lineHeight: 1,

        '& a': {
            ...GrayAnchorStyles
        }
    },

    secondaryDataValue: {
        lineHeight: 1,
        marginTop: '4px'
    }
}));

interface EntityDetailsProps {
    id: string;
    name: string;
    entityType: EntityType;
    entityIds: string[];
    discogType?: string;
    dateValue?: string;
    image?: Image;
    secondaryId?: string;
}

const EntityDetails: FC<EntityDetailsProps> = (props: EntityDetailsProps) => {
    const { classes, cx } = useStyles();
    let url = `/${props.entityType.toString()}/${props.id}`;
    let state;

    if (props.entityType === EntityType.Album) {
        state = { entityIds: props.entityIds };

        if (props.secondaryId) {
            url += `?artistId=${props.secondaryId}`;
        }
    }

    return (
        <Card variant='outlined'>
            <CardContent className={cx(classes.cardContent)}>
                {
                    props.image
                        ?
                            <img src={props.image?.url} alt='Related image' className={cx(classes.thumbnail)}/>
                        :
                            <img src={SharedService.getStockImageUrl(props.entityType)} alt='Related image' className={cx(classes.thumbnail)}/>
                }

                <Box className={cx(classes.content)}>
                    <Typography variant='body1' className={cx(classes.mainTitle, classes.link)}>
                        <Link to={url} reloadDocument={props.entityType === EntityType.Artist} state={state}>{props.name}</Link>
                    </Typography>

                    {
                        props.discogType &&
                        <Typography variant='body2' className={cx(classes.secondaryDataValue)}>{props.discogType}</Typography>
                    }

                    {
                        props.dateValue &&
                        <Typography variant='body2' className={cx(classes.secondaryDataValue)}>{SharedService.formatDateValue(props.dateValue)}</Typography>
                    }
                </Box>
            </CardContent>
        </Card>
    );
}

export default EntityDetails;
