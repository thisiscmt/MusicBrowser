import React from 'react';

interface MainContextProps {
    bannerMessage: string;
    bannerSeverity: 'error' | 'info' | 'success' | 'warning';
    handleException: (error: unknown, msg?: string, msgMap?: MessageMap) => void;
    setBanner: (message: string, severity?: AlertSeverity) => void;
}

export const MainContext = React.createContext<MainContextProps>({
    bannerMessage: '',
    bannerSeverity: 'info',
    handleException: () => {},
    setBanner: () => {}
});

export type AlertSeverity = 'error' | 'info' | 'success' | 'warning';

export type MessageMap = Record<string, { message: string, severity: AlertSeverity }>;
