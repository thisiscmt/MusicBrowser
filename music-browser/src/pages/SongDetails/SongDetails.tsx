import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, Tab, Typography, Link } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { tss } from 'tss-react/mui';
import DOMPurify from 'dompurify';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import ArtistLoader from '../../components/ArtistLoader/ArtistLoader.tsx';
import LifeSpan from '../../components/LifeSpan/LifeSpan.tsx';
import Discography from '../../components/Discography/Discography.tsx';
import GroupMembers from '../../components/GroupMembers/GroupMembers.tsx';
import TagCollection from '../../components/TagCollection/TagCollection.tsx';
import LinkCollection from '../../components/LinkCollection/LinkCollection.tsx';
import { Album, Artist } from '../../models/models.ts';
import { ChildAnchorBlueStyles, Colors } from '../../services/themeService.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';

const useStyles = tss.create(() => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
    },

    imageContainer: {
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
    },

    entityName: {
        marginBottom: '12px'
    },

    comment: {
        marginBottom: '12px'
    },

    lifeSpanSection: {
        marginBottom: '10px'
    },

    annotation: {
        fontSize: '14px',
        marginBottom: '10px',
        ...ChildAnchorBlueStyles,

        '& pre': {
            whiteSpace: 'pre-line'
        }
    },

    entityDesc: {
        marginBottom: '12px',
        whiteSpace: 'pre-wrap'
    },

    linkContainer: {
        '& div': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0
            }
        }
    },

    tabPanel: {
        padding: '12px 0 0 0'
    }
}));

interface SongDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const SongDetails: FC<SongDetailsProps> = (props: SongDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Artist>(SharedService.getEmptyArtist());
    const [ showFullDesc, setShowFullDesc ] = useState<boolean>(false);
    const [ albums, setAlbums] = useState<Album[]>([]);
    const [ currentTab, setCurrentTab] = useState<string>('discography');
    const [ loading, setLoading ] = useState<boolean>(true);
    const { id: songId } = useParams() as { id: string };

    useDocumentTitle(entity.name === '' ? 'Song - Music Browser' : `Song - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');

                // const artist = await DataService.getArtist(songId);
                //
                // setEntity(artist);
                // setAlbums(artist.albums);
            } catch (error) {
                setBanner((error as Error).message, 'error');
            } finally {
                setLoading(false);
            }
        }

        if (entity.name === '') {
            fetchData();
            SharedService.scrollToTop(props.topOfPageRef);
        }
    });

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading
                    ?
                        <ArtistLoader />
                    :
                        <>
                        </>
            }
        </Box>
    )
};

export default SongDetails;
