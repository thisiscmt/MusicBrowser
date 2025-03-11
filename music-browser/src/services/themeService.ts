import type {} from '@mui/lab/themeAugmentation';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const Colors = {
    primaryTextColor: grey[800],
    secondaryTextColor: grey[600],
    backgroundGray: '#F3F3F3',
    chipBackgroundColor: '#4678B2',
    primaryLinkColor: '#1976d2',
    secondaryLinkColor: 'rgba(25, 118, 210, 0.60)',
    white: '#FFFFFF',
    black: '#000000'
};

export const GrayAnchorStyles = {
    color: Colors.primaryTextColor,
    textDecoration: 'none',

    '&:hover': {
        color: Colors.secondaryTextColor
    }
};

export const BlueAnchorStyles = {
    color: Colors.primaryLinkColor,
    textDecoration: 'none',

    '&:hover': {
        color: Colors.secondaryLinkColor
    }
};

export const ImageViewerStyles = {
    marginBottom: '12px',

        '& .image-gallery-left-nav': {
        paddingLeft: 0
    },

    '& .image-gallery-right-nav': {
        paddingRight: 0
    },

    '& .image-gallery-left-nav .image-gallery-svg, .image-gallery-right-nav .image-gallery-svg': {
        height: '40px',
            width: '20px'
    },

    '& .image-gallery-slide .image-gallery-image': {
        maxWidth: '400px'
    }
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
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none'
                    }
                },
                defaultProps: {
                    disableRipple: true
                }
            },
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
            },
            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        borderRadius: '3px'
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none'
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
