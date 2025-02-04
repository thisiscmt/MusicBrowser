import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import { tss } from 'tss-react/mui';

import { EntityType } from '../../enums/enums.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        border: '1px solid #E0E0E0',
        borderRadius: '6px',
        display: 'flex',
        gap: '16px',
        padding: '10px'
    },

    infoLoader: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 2,
        gap: '8px'
    },

    tagLoader: {
        display: 'flex',
        gap: '12px'
    }
}));

interface SearchResultLoaderProps {
    entityType: EntityType;
}

const SearchResultLoader: FC<SearchResultLoaderProps> = (props: SearchResultLoaderProps) => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height='100px' width='100px' />


            <Box className={cx(classes.infoLoader)}>
                <Skeleton variant='rectangular' height='20px' width='50%' />

                {
                    props.entityType === EntityType.Album &&
                    <Skeleton variant='rectangular' height='16px' width='50%' />
                }

                <Box className={cx(classes.tagLoader)}>
                    {
                        [1, 2, 3, 4].map((item: number) => {
                            return (
                                <Skeleton key={item} variant='rectangular' height='24px' width='60px' />
                            )
                        })
                    }
                </Box>

                <Skeleton variant='rectangular' height='16px' width='20%' />
            </Box>
        </Box>
    );
}

export default SearchResultLoader;
