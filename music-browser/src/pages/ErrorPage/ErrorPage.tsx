import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { tss } from 'tss-react/mui';

const useStyles = tss.create(({ theme }) => ({
    mainContainer: {
        '& p': {
            marginBottom: '16px',
            marginTop: '16px'
        },

        [theme.breakpoints.down(600)]: {
            '& p': {
                paddingLeft: '16px',
                paddingRight: '16px'
            }
        }
    },

    header: {
        fontSize: '16px'
    },

    content: {
        fontSize: '14px'
    }
}));

const ErrorPage = () => {
    const { classes, cx } = useStyles();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Not Found - Music Browser';
    });

    const handleGoBack = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        navigate(-1);
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            <p className={cx(classes.header)}>*record scratch*</p>

            <p className={cx(classes.content)}>It seems you are dancing with tears in your eyes, because the thing you are looking for can't be
                found.
            </p>

            <p className={cx(classes.content)}>
                Maybe <a href='#' onClick={handleGoBack}>go back</a>?
            </p>
        </Box>
    )
};

export default ErrorPage;
