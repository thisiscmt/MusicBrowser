import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import { tss } from 'tss-react/mui';

const useStyles = tss.create(({ theme }) => ({
    mainContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    imageLoader: {
        alignSelf: 'center',
        width: '380px',

        [theme.breakpoints.down(600)]: {
            width: '100%'
        }
    },

    loaderContainer: {
        display: 'flex',
        gap: '12px'
    },

    trackLoaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: '8px'
    },

    trackLoader: {
        display: 'flex',
        columnGap: '8px'
    }
}));

const AlbumLoader: FC = () => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height='200px' className={cx(classes.imageLoader)} />
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

            <Skeleton variant='rectangular' height='20px' width='220px' />
            <Skeleton variant='rectangular' height='120px' />

            <Box className={cx(classes.loaderContainer)}>
                <Skeleton variant='rectangular' height='30px' width='100px' />
                <Skeleton variant='rectangular' height='30px' width='100px' />
                <Skeleton variant='rectangular' height='30px' width='100px' />
            </Box>

            <Box className={cx(classes.trackLoaderContainer)}>
                {
                    [1, 2, 3, 4, 5].map((item: number) => {
                        return (
                            <Box key={item} className={cx(classes.trackLoader)}>
                                <Skeleton variant='rectangular' height='20px' width='240px' />
                                <Skeleton variant='rectangular' height='20px' width='40px' />
                            </Box>
                        );
                    })
                }
            </Box>
        </Box>
    );
}

export default AlbumLoader;
