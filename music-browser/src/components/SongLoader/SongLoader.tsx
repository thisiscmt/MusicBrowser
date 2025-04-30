import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import { tss } from 'tss-react/mui';

const useStyles = tss.create(() => ({
    mainContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    loaderContainer: {
        display: 'flex',
        gap: '12px'
    },

    releaseDateLoader: {
        marginTop: '-8px'
    },

    tabSelector: {
        marginBottom: '6px'
    }
}));

const SongLoader: FC = () => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height='24px' />
            <Skeleton variant='rectangular' height='20px' />

            <Box className={cx(classes.loaderContainer)}>
                {
                    [1, 2, 3, 4].map((item: number) => {
                        return (
                            <Skeleton key={item} variant='rectangular' height='24px' width='60px' />
                        )
                    })
                }
            </Box>

            <Skeleton variant='rectangular' height='20px' />
            <Skeleton variant='rectangular' height='20px' className={cx(classes.releaseDateLoader)} />

            <Box>
                <Skeleton variant='rectangular' height='34px' width='80px' className={cx(classes.tabSelector)} />
                <Skeleton variant='rectangular' height='120px' />
            </Box>
        </Box>
    );
}

export default SongLoader;
