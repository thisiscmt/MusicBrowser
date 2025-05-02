import React, { FC, useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { ArrowCircleUpOutlined } from '@mui/icons-material';
import { tss } from 'tss-react/mui';

const useStyles = tss.create(() => ({
    button: {
        bottom: '16px',
        opacity: 0.4,
        padding: 0,
        position: 'fixed',
        right: '16px',
        zIndex: 100,

        '& svg': {
            height: '56px',
            width: '56px'
        }
    }
}));

interface GoToTopProps {
    showAtPosition: number;
}

const GoToTop:FC<GoToTopProps> = (props: GoToTopProps) => {
    const { classes, cx } = useStyles();
    const [ showButton, setShowButton ] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > props.showAtPosition) {
                if (!showButton) {
                    setShowButton(true);
                }
            } else {
                if (showButton) {
                    setShowButton(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    });

    const handleGoToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth'});
    };

    return (
        <>
            {
                showButton &&
                <IconButton className={cx(classes.button)} aria-label='go to top of page' title='Go to top' disableRipple={true} onClick={handleGoToTop}>
                    <ArrowCircleUpOutlined color='primary' />
                </IconButton>
            }
        </>
    )
};

export default GoToTop;
