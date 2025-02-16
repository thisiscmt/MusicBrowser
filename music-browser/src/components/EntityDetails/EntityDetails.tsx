import React, { FC } from 'react';
import { Link } from 'react-router';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Image } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { Colors } from '../../services/themeService.ts';
import * as SharedService from '../../services/sharedService';

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
        height: '50px',
        width: '50px'
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
            color: theme.palette.text.primary,
            textDecoration: 'none',

            '&:hover': {
                color: Colors.secondaryTextColor
            }
        }
    },

    dateValue: {
        marginTop: '4px'
    }
}));

interface EntityDetailsProps {
    id: string;
    name: string;
    entityType: EntityType;
    dateValue?: string;
    image?: Image;
}

const EntityDetails: FC<EntityDetailsProps> = (props: EntityDetailsProps) => {
    const { classes, cx } = useStyles();

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
                        <Link to={`/${props.entityType.toString()}/${props.id}`}>{props.name}</Link>
                    </Typography>

                    {
                        props.dateValue &&
                        <Typography variant='body2' className={cx(classes.dateValue)}>{SharedService.formatDateValue(props.dateValue)}</Typography>
                    }
                </Box>
            </CardContent>
        </Card>
    );
}

export default EntityDetails;
