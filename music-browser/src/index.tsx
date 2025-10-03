import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/400-italic.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './index.css';

import App from './App.tsx';
import { MainProvider } from './providers/MainProvider.tsx';
import * as ThemeService from './services/themeService';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={ThemeService.buildTheme()}>
            <MainProvider>
                <App />
            </MainProvider>
        </ThemeProvider>
    </StrictMode>,
);
