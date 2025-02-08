import React from 'react';
import {Box, Button, Typography} from '@mui/material';
import {Link, useLocation, useParams } from 'react-router';
import { tss } from 'tss-react/mui';
import ImageGallery, {ReactImageGalleryItem} from 'react-image-gallery';

import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import { Colors, ImageContainerStyles } from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
    },

    imageContainer: {...ImageContainerStyles, marginBottom: '16px'},

    entityDesc: {
        whiteSpace: 'pre-wrap'
    },

    noContent: {
        textAlign: 'center',

        '& p': {
            marginTop: '8px'
        }
    },

    buttonContainer: {
        marginTop: '12px',
        textAlign: 'center',

        '& .MuiButton-root': {
            textTransform: 'none'
        }
    }
}));

const EntityDescription = () => {
    const { classes, cx } = useStyles();
    const location = useLocation();
    const params = useParams();
    let images: ReactImageGalleryItem[] = [];
    let desc = '';
    let entityName = '';

    if (location.state) {
        images = location.state.images;
        desc = location.state.desc;
        entityName = location.state.entityName;

        sessionStorage.setItem(params.id || '', JSON.stringify(location.state));
    } else {
        const entityDescInfoStr = sessionStorage.getItem(params.id || '');

        if (entityDescInfoStr) {
            try {
                const entityDesc = JSON.parse(entityDescInfoStr);

                images = entityDesc.images;
                desc = entityDesc.desc;
                entityName = entityDesc.entityName;
            } catch (error) {
                // If a parsing error occurrs we just ignore it, and display a link back to the given entity page to properly load the data
            }
        }
    }

    const pathParts = location.pathname.replace(/^\/|\/$/g, '').split('/');
    const returnLink = `/${pathParts[0]}/${params.id}`;

    useDocumentTitle(`${entityName} Description - Music Browser`);

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                images.length === 0 && !desc
                    ?
                        <Box className={cx(classes.noContent)}>
                            <Typography variant='body1'>We couldn't find the description for the given entity.</Typography>
                            <Typography variant='body1'>Try going to their main <Link to={returnLink}>page</Link>.</Typography>
                        </Box>
                    :
                        <>
                            {
                                images.length > 0 &&
                                <ImageGallery items={images} showPlayButton={false} additionalClass={cx(classes.imageContainer)} showFullscreenButton={false} />
                            }

                            <Typography variant='body2' className={cx(classes.entityDesc)}>{desc}</Typography>

                            <Box className={cx(classes.buttonContainer)}>
                                <Button component={Link} to={returnLink} disableRipple={true}>
                                    Go Back
                                </Button>
                            </Box>
                        </>
            }
        </Box>
    )
};

export default EntityDescription;
