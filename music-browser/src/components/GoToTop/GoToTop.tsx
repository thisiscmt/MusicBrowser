import React, {FC, RefObject} from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowCircleUpOutlined } from '@mui/icons-material';
import { tss } from 'tss-react/mui';

import * as SharedService from '../../services/sharedService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        position: 'relative',
        textAlign: 'right'
    },

    button: {
        marginTop: '4px',
        opacity: 0.5,
        padding: 0,

        '& svg': {
            height: '56px',
            width: '56px'
        }
    }
}));

interface GoToTopProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const GoToTop: FC<GoToTopProps> = (props: GoToTopProps) => {
    const { classes, cx } = useStyles();

    const handleGoToTop = () => {
        SharedService.scrollToTop(props.topOfPageRef)
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            <IconButton className={cx(classes.button)} aria-label='go to top of page' title='Go to top' disableRipple={true} onClick={handleGoToTop}>
                <ArrowCircleUpOutlined color='primary' />
            </IconButton>
        </Box>
    )
};

export default GoToTop;
