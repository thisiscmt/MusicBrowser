import React, { FC, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { ArtistEntity, LinkEntry } from '../../models/models.ts';
import { MainContext, AlertSeverity } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';
import * as Constants from '../../constants/constants.ts';

const useStyles = tss.create(({ theme }) => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px'
    },

    imageContainer: {
        marginBottom: '12px',

        '& .image-gallery-left-nav .image-gallery-svg, .image-gallery-right-nav .image-gallery-svg': {
            height: '40px',
            width: '20px'
        },

        '& .image-gallery-slide .image-gallery-image': {
            width: '400px'
        }
    },

    image: {
        minWidth: '250px',
        width: '250px',
        alignSelf: 'center'
    },

    entityName: {
        marginBottom: '8px'
    },

    tagContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '12px',
    },

    tag: {
        backgroundColor: Colors.chipBackgroundColor,
        borderRadius: '4px',
        color: Colors.white,
        fontSize: '14px',
        marginRight: '8px',
        marginTop: '6px',
        padding: '3px 5px'
    },

    entityDesc: {
        marginBottom: '12px',
        whiteSpace: 'pre-wrap'
    }

}));

const Artist: FC = () => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<ArtistEntity>(SharedService.getEmptyArtist());
    const [ currentTab, setCurrentTab] = useState<number>(0);
    const [ loading, setLoading ] = useState<boolean>(true);
    const { artistId } = useParams() as { artistId: string };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');

                const artist = await DataService.getArtist(artistId);
                setEntity(artist);
            } catch (error: any) {
                setBanner(error.message, 'error');
            } finally {
                setLoading(false);
            }
        }

        document.title = 'Artist -  - Music Browser';

        if (entity.name === '') {
            fetchData();
        }
    });

    const images = entity.images.map((item) => {
        return {
            original: item.url
        };
    })

    // We normalize the line breaks in the description then double each one so we get nice spacing between blocks of text
    const desc = entity.description.replace(/\n\n/g, '\n').replace(/\n/g, '\n\n');

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading &&
                <>
                </>
            }

            {
                !loading &&
                <>
                    {
                        images.length > 0 &&
                        // <Box className={cx(classes.imageContainer)}>
                            <ImageGallery items={images} showPlayButton={false} additionalClass={cx(classes.imageContainer)} showFullscreenButton={false} />
                        // </Box>
                    }

                    <Typography variant='h5' className={cx(classes.entityName)}>{entity.name}</Typography>

                    {
                        entity.tags.length > 0 &&
                        <Box className={cx(classes.tagContainer)}>
                            {
                                entity.tags.map((item: string, index: number) => {
                                    return (
                                        <Box key={index} className={cx(classes.tag)}>{item}</Box>
                                    )
                                })

                            }
                        </Box>
                    }

                    <Typography variant='body2'>Formed:</Typography>

                    <Typography variant='body2'>Dissolved:</Typography>

                    {
                        entity.description &&
                        <Typography variant='body2' className={cx(classes.entityDesc)}>{desc}</Typography>
                    }

                    {
                        entity.links.length > 0 &&
                        <Box>
                            {
                                entity.links.map((item: LinkEntry, index: number) => {
                                    return (
                                        <Box key={index}>
                                            <Button
                                                component={Link}
                                                to={item.target}
                                                target='_blank'
                                                disableRipple={true}
                                            >
                                                {item.label}
                                            </Button>
                                        </Box>
                                    )
                                })
                            }
                        </Box>
                    }

                    <Tabs value={currentTab}>
                        <Tab label='Discography' />
                        <Tab label='Members' />
                    </Tabs>
                </>
            }
        </Box>
    )
};

export default Artist;
