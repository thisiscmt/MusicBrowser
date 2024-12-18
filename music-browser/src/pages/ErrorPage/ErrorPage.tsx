import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router';
import { tss } from 'tss-react';

const useStyles = tss.create({
    header: {
        fontSize: '18px'
    },

    content: {
        fontSize: '16px'
    }
});

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
        <Box>
            <p className={cx(classes.header)}>*record scratch*</p>

            <p className={cx(classes.content)}>It seems you are dancing with tears in your eyes, because the thing you are looking for can't be
                found. Maybe <a href='#' onClick={handleGoBack}>go back</a>?
            </p>
        </Box>
    )
};

export default ErrorPage;
