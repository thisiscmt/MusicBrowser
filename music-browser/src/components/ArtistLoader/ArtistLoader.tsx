import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import { tss } from 'tss-react/mui';

const useStyles = tss.create(() => ({
    mainContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    tagLoader: {
        display: 'flex',
        gap: '12px'
    },

    tabSelector: {
        marginBottom: '4px'
    }
}));

const ArtistLoader: FC = () => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height='200px' />
            <Skeleton variant='rectangular' height='24px' />

            <Box className={cx(classes.tagLoader)}>
                {
                    [1, 2, 3, 4].map((item: number) => {
                        return (
                            <Skeleton key={item} variant='rectangular' height='24px' width='60px' />
                        )
                    })
                }
            </Box>

            <Skeleton variant='rectangular' height='50px' />
            <Skeleton variant='rectangular' height='120px' />
            <Skeleton variant='rectangular' height='20px' width='20%' />
            <Skeleton variant='rectangular' height='20px' width='20%' />

            <Box>
                <Skeleton variant='rectangular' height='30px' width='80px' className={cx(classes.tabSelector)} />
                <Skeleton variant='rectangular' height='120px' />
            </Box>
        </Box>
    );
}

export default ArtistLoader;
