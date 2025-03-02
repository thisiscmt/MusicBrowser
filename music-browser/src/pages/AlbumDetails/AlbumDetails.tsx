import React, {useState} from 'react';
import { Box } from '@mui/material';
import { tss } from 'tss-react/mui';

import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import { Album } from '../../models/models.ts';
import * as SharedService from '../../services/sharedService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        padding: '16px',

        '& p': {
            marginBottom: '16px',
            marginTop: '16px'
        }
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
    const [ entity, setEntity ] = useState<Album>(SharedService.getEmptyAlbum());
    const [ showFullDesc, setShowFullDesc ] = useState<boolean>(false);

    useDocumentTitle(entity.name === '' ? 'Album - Music Browser' : `Album - ${entity.name} - Music Browser`);


    return (
        <Box className={cx(classes.mainContainer)}>









        </Box>
    )
};

export default AlbumDetails;
