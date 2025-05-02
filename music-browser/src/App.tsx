import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Box } from '@mui/material';
import { tss } from 'tss-react/mui';

import Header from './components/Header/Header.tsx';
import Home from './pages/Home/Home.tsx';
import Preferences from './pages/Preferences/Preferences.tsx';
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx';
import ArtistDetails from './pages/ArtistDetails/ArtistDetails.tsx';
import AlbumDetails from './pages/AlbumDetails/AlbumDetails.tsx';
import SongDetails from './pages/SongDetails/SongDetails.tsx';
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

    return (
        <BrowserRouter>
            <Box className={cx(classes.siteContainer)}>
                <Header />

                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/artist/:id' element={<ArtistDetails  />} />
                    <Route path='/album/:id' element={<AlbumDetails />} />
                    <Route path='/song/:id' element={<SongDetails />} />
                    <Route path='/preferences' element={<Preferences />} />
                    <Route path='*' element={<ErrorPage />} />
                </Routes>
            </Box>
        </BrowserRouter>
    );
}

export default App
