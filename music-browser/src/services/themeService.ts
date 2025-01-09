import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const Colors = {
    primaryTextColor: grey[800],
    secondaryTextColor: grey[600],
    backgroundGray: '#F3F3F3',
    chipBackgroundColor: '#4678B2',
    white: '#FFFFFF',
    black: '#000000'
};

export const buildTheme = () => {
    return createTheme({
        typography: {
            allVariants: {
                color: Colors.primaryTextColor,
                fontFamily:  "-apple-system, BlinkMacSystemFont, Roboto, 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', Helvetica, Arial, sans-serif"
            }
        },
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '6px'
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: '6px'
                    }
                }
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        '&:last-child': {
                            paddingBottom: '16px'
                        }
                    }
                }
            }
        },
        palette: {
            text: {
                primary: Colors.primaryTextColor
            }
        },
    });
};
