import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams, useSearchParams } from 'react-router';
import {Box, IconButton, SvgIcon, Typography} from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import AlbumLoader from '../../components/AlbumLoader/AlbumLoader.tsx';
import EntityDescription from '../../components/EntityDescription/EntityDescription.tsx';
import TagCollection from '../../components/TagCollection/TagCollection.tsx';
import LinkCollection from '../../components/LinkCollection/LinkCollection.tsx';
import Tracks from '../../components/Tracks/Tracks.tsx';
import { Album, TrackList } from '../../models/models.ts';
import { Colors, GrayAnchorStyles, ImageViewerStyles } from '../../services/themeService.ts';
import * as SharedService from '../../services/sharedService.ts';
import * as DataService from '../../services/dataService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
    },

    imageContainer: {
        ...ImageViewerStyles
    },

    artistName: {
        fontSize: '18px',
        marginBottom: '12px',
        marginTop: '4px',

        '& a': {
            ...GrayAnchorStyles
        }
    },

    comment: {
        marginBottom: '10px'
    },

    releaseDateSection: {
        display: 'flex',
        marginBottom: '8px'
    },

    linkContainer: {
        marginBottom: '10px'
    },

    trackListContainer: {
        alignItems: 'center',
        display: 'flex',
        gap: '20px',
        marginBottom: '4px',
        marginTop: '-8px'
    },

    trackListNavContainer: {
        display: 'flex',
        gap: '6px',

        '& .MuiIconButton-root': {
            color: Colors.primaryLinkColor,
            padding: '6px'
        }
    },

    prevTrackList: {
        transform: 'scaleX(-1)'
    }

}));

interface AlbumDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const AlbumDetails: FC<AlbumDetailsProps> = (props: AlbumDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Album>(SharedService.getEmptyAlbum());
    const [ currentTrackList, setCurrentTrackList ] = useState<TrackList>(SharedService.getEmptyTrackList());
    const [ loading, setLoading ] = useState<boolean>(true);
    const { id: albumId } = useParams() as { id: string };
    const [ searchParams, ] = useSearchParams();

    useDocumentTitle(entity.name === '' ? 'Album - Music Browser' : `Album - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');

                const album = await DataService.getAlbum(albumId, searchParams.get('artistId'));
                setEntity(album);

                if (album.trackList && album.trackList.length > 0) {
                    setCurrentTrackList(album.trackList[0]);
                }
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
    }, [albumId, entity.name, props.topOfPageRef, searchParams, setBanner]);

    const handleShowPreviousMedia = () => {
        setCurrentTrackList(entity.trackList[currentTrackList.position - 2])
    };

    const handleShowNextMedia = () => {
        setCurrentTrackList(entity.trackList[currentTrackList.position])
    };

    const images = SharedService.getEntityImageList(entity);

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading
                    ?
                        <AlbumLoader />
                    :
                        <>
                            {
                                images.length > 0 &&
                                <ImageGallery items={images} showPlayButton={false} additionalClass={cx(classes.imageContainer)} showFullscreenButton={false} />
                            }

                            <Typography variant='h5'>{entity.name}</Typography>

                            <Typography variant='body2' className={cx(classes.artistName)}>
                                {
                                    entity.artistId
                                        ?
                                            <RouteLink to={`/artist/${entity.artistId}`}>{entity.artist}</RouteLink>
                                        :
                                            <>{entity.artist}</>
                                }
                            </Typography>

                            {
                                entity.comment &&
                                <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>
                            }

                            <TagCollection items={(entity.tags || []).slice(0, 10)} />

                            <Box className={cx(classes.releaseDateSection)}>
                                <Typography variant='subtitle2'>Released:</Typography>
                                <Typography variant='body2'>&nbsp;&nbsp;{SharedService.formatDateValue(entity.releaseDate)}</Typography>
                            </Box>

                            <EntityDescription entityDesc={entity.description} />

                            {
                                entity.links.length > 0 &&
                                <Box className={cx(classes.linkContainer)}>
                                    <LinkCollection items={entity.links} />
                                </Box>
                            }

                            {
                                entity.trackList.length > 1 &&
                                <Box className={cx(classes.trackListContainer)}>
                                    <Typography variant='body2'>{currentTrackList.format} {currentTrackList.position.toString()}</Typography>

                                    <Box className={cx(classes.trackListNavContainer)}>
                                        <IconButton onClick={handleShowPreviousMedia} aria-label='Show previous medium' title='Show previous media' disabled={currentTrackList.position === 1}>
                                            <SvgIcon className={cx(classes.prevTrackList)}>
                                                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                                                    <path d='M22 18V20H2V18H22ZM2 3.5L10 8.5L2 13.5V3.5ZM22 11V13H12V11H22ZM4 7.1085V9.8915L6.22641 8.5L4 7.1085ZM22 4V6H12V4H22Z'></path>
                                                </svg>
                                            </SvgIcon>
                                        </IconButton>

                                        <IconButton onClick={handleShowNextMedia} aria-label='Show next medium' title='Show next media' disabled={currentTrackList.position === entity.trackList.length}>
                                            <SvgIcon>
                                                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                                                    <path d='M22 18V20H2V18H22ZM2 3.5L10 8.5L2 13.5V3.5ZM22 11V13H12V11H22ZM4 7.1085V9.8915L6.22641 8.5L4 7.1085ZM22 4V6H12V4H22Z'></path>
                                                </svg>
                                            </SvgIcon>
                                        </IconButton>
                                    </Box>
                                </Box>
                            }

                            <Tracks tracks={currentTrackList.tracks} totalDuration={currentTrackList.totalDuration} artist={entity.artist} />
                        </>
            }
        </Box>
    )
};

export default AlbumDetails;
