import React, { useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Box } from '@mui/material';
import { tss } from 'tss-react/mui';

import Header from './components/Header/Header.tsx';
import Home from './pages/Home/Home.tsx';
import Preferences from './pages/Preferences/Preferences.tsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx';
import ArtistDetails from './pages/ArtistDetails/ArtistDetails.tsx';
import AlbumDetails from './pages/AlbumDetails/AlbumDetails.tsx';
import { Colors } from './services/themeService.ts';

const useStyles = tss.create(({ theme }) => ({
    siteContainer: {
        backgroundColor: Colors.white,
        height: '100vh',
        width: '50%',

        [theme.breakpoints.down(1024)]: {
            width: '70%'
        },

        [theme.breakpoints.down(600)]: {
            width: '100%'
        }
    },
}));

function App() {
    const { classes, cx } = useStyles();

    // This ref is used by child components to scroll to the top of the page, if needed
    const topOfPageRef = useRef<HTMLElement>(null);

    return (
        <BrowserRouter>
            <Box className={cx(classes.siteContainer)} ref={topOfPageRef}>
                <Header />

                <Routes>
                    <Route path='/' element={<Home topOfPageRef={topOfPageRef} />} />
                    <Route path='/artist/:id' element={<ArtistDetails topOfPageRef={topOfPageRef} />} />
                    <Route path='/album/:id' element={<AlbumDetails topOfPageRef={topOfPageRef} />} />
                    <Route path='/preferences' element={<Preferences />} />
                    <Route path='*' element={<ErrorPage />} />
                </Routes>
            </Box>
        </BrowserRouter>
    );
}

export default App
