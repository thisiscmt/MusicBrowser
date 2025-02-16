import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import { tss } from 'tss-react/mui';

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
        gap: '10px'
    }
}));

interface EntityLoaderProps {
    smallImage?: boolean;
}

const EntityDetailsLoader: FC<EntityLoaderProps> = (props: EntityLoaderProps) => {
    const { classes, cx } = useStyles();

    const dimension = props.smallImage ? '50px' : '100px';

    return (
        <Box className={cx(classes.mainContainer)}>
            <Skeleton variant='rectangular' height={dimension} width={dimension} />

            <Box className={cx(classes.infoLoader)}>
                <Skeleton variant='rectangular' height='20px' width='50%' />
                <Skeleton variant='rectangular' height='20px' width='50%' />
            </Box>
        </Box>
    );
}

export default EntityDetailsLoader;
