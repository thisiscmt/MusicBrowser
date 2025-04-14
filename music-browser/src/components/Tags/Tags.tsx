import React, { FC } from 'react';
import { Box, Link } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Tag } from '../../models/models.ts';
import { Colors } from '../../services/themeService.ts';
import * as Constants from '../../constants/constants.ts';

interface TagCollectionProps {
    items: Tag[];
    compact?: boolean;
}

const Tags: FC<TagCollectionProps> = (props: TagCollectionProps) => {
    const useStyles = tss.create(() => ({
        tagContainer: {
            columnGap: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            marginBottom: props.compact ? '9px' : '12px',
            rowGap: '6px'
        },

        link: {
            textDecoration: 'none'
        },

        tag: {
            backgroundColor: Colors.chipBackgroundColor,
            borderRadius: '4px',
            color: Colors.white,
            fontSize: '14px',
            padding: '3px 5px',

            '&:hover': {
                backgroundColor: Colors.secondaryLinkColor
            }
        }
    }));

    const { classes, cx } = useStyles();

    return (
        <>
            {
                props.items.length > 0 &&
                <Box className={cx(classes.tagContainer)}>
                    {
                        props.items.map((item: Tag, index: number) => {
                            let url: string;

                            if (item.id) {
                                url = `${Constants.MUSIC_BRAINZ_BASE_URL}/genre/${item.id}`;
                            } else {
                                url = `${Constants.MUSIC_BRAINZ_BASE_URL}/tag/${item.name}`;
                            }

                            return (
                                <Link key={index} href={`${url}`} target='_blank' className={cx(classes.link)}>
                                    <Box className={cx(classes.tag)}>{item.name}</Box>
                                </Link>
                            );
                        })
                    }
                </Box>
            }
        </>
    );
}

export default Tags;
