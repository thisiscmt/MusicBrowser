import React from 'react';
import {Box, Link} from '@mui/material';
import { useNavigate } from 'react-router';
import { tss } from 'tss-react/mui';

import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import {BlueAnchorStyles} from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        padding: '16px',

        '& p': {
            marginBottom: '16px',
            marginTop: 0
        }
    },

    header: {
        fontSize: '24px',
        textAlign: 'center'
    },

    content: {
        fontSize: '14px'
    },

    link: {
        ...BlueAnchorStyles
    },
}));

const ErrorPage = () => {
    const { classes, cx } = useStyles();
    const navigate = useNavigate();

    useDocumentTitle('Error - Music Browser');

    const handleGoBack = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        navigate(-1);
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            <p className={cx(classes.header)}>*record scratch*</p>

            <p className={cx(classes.content)}>It seems you are <Link href='/album/56271b4c-ca60-3500-9a6e-56f92bf6fa24?artistId=7e786a4c-c743-4713-9340-a6f12d8515d4' className='app-link'>dancing with tears in your eyes</Link> because the thing you are looking for can't be found.</p>

            <p className={cx(classes.content)}>
                Maybe <a href='#' className={cx(classes.link)} onClick={handleGoBack}>go back</a>?
            </p>
        </Box>
    )
};

export default ErrorPage;
