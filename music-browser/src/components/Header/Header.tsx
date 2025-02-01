import React, { FC, useContext, useState } from 'react';
import { Link } from 'react-router';
import {Alert, Fade, IconButton, SwipeableDrawer, Typography} from '@mui/material';
import { MenuOutlined, SettingsOutlined } from '@mui/icons-material';
import { tss } from 'tss-react/mui';

import MobileMenu from '../MobileMenu/MobileMenu.tsx';
import { Colors } from '../../services/themeService.ts';
import { MainContext } from '../../contexts/MainContext.tsx';

const useStyles = tss.create(({ theme }) => ({
    headerContainer: {
        alignItems: 'center',
        backgroundColor: Colors.black,
        color: Colors.white,
        display: 'flex',
        padding: '16px'
    },

    headerText: {
        color: Colors.white,
        lineHeight: 1,
        textDecoration: 'none'
    },

    prefsButton: {
        marginLeft: 'auto',
        padding: 0,

        '& svg': {
            fill: Colors.white
        },

        [theme.breakpoints.down(600)]: {
            display: 'none'
        }
    },

    mobileMenuButton: {
        color: Colors.white,
        display: 'none',
        padding: '4px',

        [theme.breakpoints.down(600)]: {
            display: 'inline-flex',
            marginRight: '10px'
        }
    }
}));

const Header: FC = () => {
    const { classes, cx } = useStyles();
    const [ mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const { bannerMessage, bannerSeverity } = useContext(MainContext);

    const handleMobileMenuClick = (value: boolean) => {
        setMobileMenuOpen(value);
    };

    return (
        <>
            <header className={cx(classes.headerContainer)}>
                <IconButton
                    aria-label="mobile menu"
                    className={cx(classes.mobileMenuButton)}
                    onClick={() => handleMobileMenuClick(!mobileMenuOpen)}
                >
                    <MenuOutlined />
                </IconButton>

                <SwipeableDrawer
                    anchor='left'
                    open={mobileMenuOpen}
                    onClose={() => handleMobileMenuClick(false)}
                    onOpen={() => handleMobileMenuClick(true)}
                >
                    <MobileMenu onClose={() => handleMobileMenuClick(false)} />
                </SwipeableDrawer>

                <Typography variant='h5' component={Link} to='/' className={cx(classes.headerText)}>Music Browser</Typography>
                <IconButton aria-label='go to preferences' title='Go to preferences' className={cx(classes.prefsButton)} component={Link} to='/preferences'>
                    <SettingsOutlined />
                </IconButton>
            </header>

            {
                bannerMessage &&
                <Fade in={!!bannerMessage}>
                    <Alert severity={bannerSeverity}>{bannerMessage}</Alert>
                </Fade>
            }
        </>
    );
}

export default Header;
