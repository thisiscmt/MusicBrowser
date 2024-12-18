import { FC } from 'react';
import { Box } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Colors } from '../../services/themeService.ts';

const useStyles = tss.create({
    header: {
        backgroundColor: Colors.black,
        color: Colors.white,
        padding: '16px'
    }
});

const Header: FC = () => {
    const { classes, cx } = useStyles();

    return (
        <Box className={cx(classes.header)}>
            Music Browser
        </Box>
    );
}

export default Header;
