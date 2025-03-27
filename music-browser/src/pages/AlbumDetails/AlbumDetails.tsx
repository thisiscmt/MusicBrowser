import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams, useSearchParams, useLocation, useNavigate } from 'react-router';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
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
        alignItems: 'center',
        display: 'flex',
        marginBottom: '8px'
    },

    albumNavContainer: {
        display: 'flex',
        gap: '8px',
        marginLeft: 'auto',

        '& .MuiIconButton-root': {
            color: Colors.primaryLinkColor,
            padding: '4px'
        },

        '& .Mui-disabled': {
            color: Colors.disabled
        }
    },

    linkContainer: {
        marginBottom: '12px'
    },

    trackListContainer: {
        alignItems: 'center',
        display: 'flex',
        gap: '20px',
        justifyContent: 'space-between',
        marginBottom: '4px',
        marginTop: '-8px'
    },

    trackListNavContainer: {
        display: 'flex',
        gap: '6px',

        '& .MuiIconButton-root': {
            color: Colors.primaryLinkColor,
            padding: '6px'
        },

        '& .Mui-disabled': {
            color: Colors.disabled
        }
    },

    prevTrackList: {
        // Flips the icon for the previous track list button horizontally, since we only have one SVG and it points forward
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
    const [ showAlbumNav, setShowAlbumNav ] = useState<boolean>(false);
    const [ albumOrdinal, setAlbumOrdinal ] = useState<number>(-1);
    const [ error, setError ] = useState<boolean>(false);

    const { id: albumId } = useParams() as { id: string };
    const [ searchParams, ] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const artistId = searchParams.get('artistId');
    let queryString = '';

    if (artistId) {
        queryString = `?artistId=${artistId}`;
    }

    useDocumentTitle(entity.name === '' ? 'Album - Music Browser' : `Album - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');
                setLoading(true);

                const album = await DataService.getAlbum(albumId, searchParams.get('artistId'));
                setEntity(album);

                if (album.trackList && album.trackList.length > 0) {
                    setCurrentTrackList(album.trackList[0]);
                }

                if (location.state && location.state.entityIds && location.state.entityIds.length > 0) {
                    let ordinal;

                    for (let i = 0; i < location.state.entityIds.length; i++) {
                        if (location.state.entityIds[i] === album.id) {
                            ordinal = i;
                            break;
                        }
                    }

                    if (ordinal !== undefined) {
                        setAlbumOrdinal(ordinal);
                        setShowAlbumNav(true);
                    }
                }

                setError(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setBanner('An error occurred retrieving album details', 'error');
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if ((entity.name === '' || entity.id !== albumId) && !error) {
            fetchData();
            SharedService.scrollToTop(props.topOfPageRef);
        }
    }, [albumId, entity.id, entity.name, error, location.state, props.topOfPageRef, searchParams, setBanner]);

    const handleShowPreviousAlbum = () => {
        navigate(`/album/${location.state.entityIds[albumOrdinal - 1]}${queryString}`, { state: {entityIds: location.state.entityIds} });
    };

    const handleShowNextAlbum = () => {
        navigate(`/album/${location.state.entityIds[albumOrdinal + 1]}${queryString}`, { state: {entityIds: location.state.entityIds} });
    };

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

                            {
                                entity.name &&
                                <Typography variant='h5'>{entity.name}</Typography>
                            }

                            {
                                entity.artist &&
                                <Typography variant='body2' className={cx(classes.artistName)}>
                                    {
                                        entity.artistId
                                            ?
                                            <RouteLink to={`/artist/${entity.artistId}`}>{entity.artist}</RouteLink>
                                            :
                                            <>{entity.artist}</>
                                    }
                                </Typography>
                            }

                            {
                                entity.comment &&
                                <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>
                            }

                            <TagCollection items={(entity.tags || []).slice(0, 10)} />

                            {
                                (entity.releaseDate || showAlbumNav) &&
                                <Box className={cx(classes.releaseDateSection)}>
                                    <Typography variant='subtitle2'>Released:</Typography>
                                    <Typography variant='body2'>&nbsp;&nbsp;{SharedService.formatDateValue(entity.releaseDate)}</Typography>

                                    {
                                        showAlbumNav &&
                                        <Box className={cx(classes.albumNavContainer)}>
                                            <IconButton onClick={handleShowPreviousAlbum} aria-label='Show previous album' title='Show previous album'
                                                        disabled={albumOrdinal === 0}>
                                                <SvgIcon>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 10.6667L21.2227 4.51823C21.4524 4.36506 21.7629 4.42714 21.9161 4.65691C21.9708 4.73904 22 4.83554 22 4.93426V19.0657C22 19.3419 21.7762 19.5657 21.5 19.5657C21.4013 19.5657 21.3048 19.5365 21.2227 19.4818L12 13.3333V19.0657C12 19.3419 11.7762 19.5657 11.5 19.5657C11.4013 19.5657 11.3048 19.5365 11.2227 19.4818L0.62407 12.416C0.394306 12.2628 0.332219 11.9524 0.485395 11.7226C0.522013 11.6677 0.569144 11.6206 0.62407 11.584L11.2227 4.51823C11.4524 4.36506 11.7629 4.42714 11.9161 4.65691C11.9708 4.73904 12 4.83554 12 4.93426V10.6667ZM10 16.263V7.73703L3.60558 12L10 16.263ZM20 16.263V7.73703L13.6056 12L20 16.263Z"></path>
                                                    </svg>
                                                </SvgIcon>
                                            </IconButton>

                                            <IconButton onClick={handleShowNextAlbum} aria-label='Show next album' title='Show next album'
                                                        disabled={albumOrdinal === (location.state.entityIds.length - 1)}>
                                                <SvgIcon>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 13.3334L2.77735 19.4818C2.54759 19.635 2.23715 19.5729 2.08397 19.3432C2.02922 19.261 2 19.1645 2 19.0658V4.93433C2 4.65818 2.22386 4.43433 2.5 4.43433C2.59871 4.43433 2.69522 4.46355 2.77735 4.5183L12 10.6667V4.93433C12 4.65818 12.2239 4.43433 12.5 4.43433C12.5987 4.43433 12.6952 4.46355 12.7774 4.5183L23.376 11.584C23.6057 11.7372 23.6678 12.0477 23.5146 12.2774C23.478 12.3323 23.4309 12.3795 23.376 12.4161L12.7774 19.4818C12.5476 19.635 12.2372 19.5729 12.084 19.3432C12.0292 19.261 12 19.1645 12 19.0658V13.3334ZM10.3944 12.0001L4 7.7371V16.263L10.3944 12.0001ZM14 7.7371V16.263L20.3944 12.0001L14 7.7371Z"></path>
                                                    </svg>
                                                </SvgIcon>
                                            </IconButton>
                                        </Box>
                                    }
                                </Box>
                            }

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
                                        <IconButton onClick={handleShowPreviousMedia} aria-label='Show previous medium' title='Show previous media'
                                                    disabled={currentTrackList.position === 1}>
                                            <SvgIcon className={cx(classes.prevTrackList)}>
                                                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'>
                                                    <path d='M22 18V20H2V18H22ZM2 3.5L10 8.5L2 13.5V3.5ZM22 11V13H12V11H22ZM4 7.1085V9.8915L6.22641 8.5L4 7.1085ZM22 4V6H12V4H22Z'></path>
                                                </svg>
                                            </SvgIcon>
                                        </IconButton>

                                        <IconButton onClick={handleShowNextMedia} aria-label='Show next medium' title='Show next media'
                                                    disabled={currentTrackList.position === entity.trackList.length}>
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
