import React, { FC } from 'react';
import { Link } from 'react-router';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { CloseOutlined, HomeOutlined, SettingsOutlined } from '@mui/icons-material';
import { tss } from 'tss-react/mui';

import { Colors } from '../../services/themeService';

const useStyles = tss.create(() => ({
    mainContainer: {
        height: '100%',
        width: '180px'
    },

    closeButton: {
        float: 'right',
        margin: '2px',
        zIndex: 1000
    },

    menu: {
        '& .MuiListItem-root': {
            borderTop: `2px solid ${Colors.backgroundGray}`
        },

        '& .MuiListItem-root:last-child': {
            borderBottom: `2px solid ${Colors.backgroundGray}`
        },

        '& .MuiListItemIcon-root': {
            minWidth: '36px'
        }
    }
}));

interface MobileMenuProps {
    onClose: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ onClose }) => {
    const { classes, cx } = useStyles();

    const handleMenuClose = () => {
        onClose();
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            <IconButton
                aria-label='close the menu'
                className={cx(classes.closeButton)}
                onClick={handleMenuClose}
                size='medium'
            >
                <CloseOutlined />
            </IconButton>

            <List className={cx(classes.menu)}>
                <ListItem disablePadding={true}>
                    <ListItemButton to='/' component={Link} onClick={handleMenuClose}>
                        <ListItemIcon><HomeOutlined /></ListItemIcon>
                        <ListItemText primary='Home' />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding={true}>
                    <ListItemButton to='/preferences' component={Link} onClick={handleMenuClose}>
                        <ListItemIcon><SettingsOutlined /></ListItemIcon>
                        <ListItemText primary='Preferences' />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
}

export default MobileMenu;
