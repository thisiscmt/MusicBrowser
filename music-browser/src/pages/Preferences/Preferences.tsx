import React, { useEffect } from 'react';
import { Box } from '@mui/material';

const Preferences = () => {
    useEffect(() => {
        document.title = 'Preferences - Music Browser';
    });

    return (
        <Box>
            Preferences
        </Box>
    )
};

export default Preferences;
