import React from 'react';
import { Box } from '@mui/material';
import { tss } from 'tss-react/mui';

import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';

const useStyles = tss.create(() => ({
    mainContainer: {
        padding: '16px',

        '& p': {
            marginBottom: '16px',
            marginTop: '16px'
        },

        // [theme.breakpoints.down(600)]: {
        //     '& p': {
        //         paddingLeft: '16px',
        //         paddingRight: '16px'
        //     }
        // }
    },

    header: {
        fontSize: '16px'
    },

    content: {
        fontSize: '14px'
    }
}));

const AlbumDetails = () => {
    const { classes, cx } = useStyles();

    useDocumentTitle('Album - Music Browser');


    return (
        <Box className={cx(classes.mainContainer)}>
        </Box>
    )
};

export default AlbumDetails;
