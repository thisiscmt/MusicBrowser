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

    tabSelector: {
        marginBottom: '6px'
    }
}));

const ArtistLoader: FC = () => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height='200px' className={cx(classes.imageLoader)} />
            <Skeleton variant='rectangular' height='24px' />

            <Box className={cx(classes.loaderContainer)}>
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

            <Box className={cx(classes.loaderContainer)}>
                <Skeleton variant='rectangular' height='30px' width='100px' />
                <Skeleton variant='rectangular' height='30px' width='100px' />
                <Skeleton variant='rectangular' height='30px' width='100px' />
            </Box>

            <Box>
                <Skeleton variant='rectangular' height='34px' width='80px' className={cx(classes.tabSelector)} />
                <Skeleton variant='rectangular' height='120px' />
            </Box>
        </Box>
    );
}

export default ArtistLoader;
