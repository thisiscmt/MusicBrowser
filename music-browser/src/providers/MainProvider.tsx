import React, {useState} from 'react';
import Axios from 'axios';

import { MainContext, AlertSeverity, MessageMap } from '../contexts/MainContext.tsx';

interface MainProviderProps{
    children: React.ReactNode
}

export const MainProvider = ({ children }: MainProviderProps) => {
    const [ bannerMessage, setBannerMessage ] = useState<string>('');
    const [ bannerSeverity, setBannerSeverity ] = useState<AlertSeverity>('info');

    const setBanner = (message: string, severity?: AlertSeverity) => {
        setBannerMessage(message);
        setBannerSeverity(severity || 'info');
    };

    const handleException = (error: unknown, msg?: string, msgMap?: MessageMap) => {
        const defaultMsg = 'An error occurred during the request';
        let errorMsg: string;
        let severity: AlertSeverity = 'error';

        if (Axios.isAxiosError(error)) {
            if (msgMap) {
                if (error.code && error.code === 'ERR_CANCELED') {
                    errorMsg = msgMap[error.code].message;
                    severity = msgMap[error.code].severity;
                } else {
                    errorMsg = error.response?.status ? msgMap[error.response?.status.toString()].message : defaultMsg;
                    severity = error.response?.status ? msgMap[error.response?.status.toString()].severity : 'error';
                }
            } else {
                errorMsg = error.response?.data ? error.response?.data : (msg ? msg : defaultMsg);
            }
        } else if (error instanceof Error) {
            errorMsg = msg ? msg : error.message;
        } else {
            errorMsg = msg ? msg : defaultMsg;
        }

        setBanner(errorMsg, severity);
    };

    return (
        <MainContext.Provider value={{
            bannerMessage,
            bannerSeverity,
            handleException,
            setBanner}}
        >
            {children}
        </MainContext.Provider>
    );
};
