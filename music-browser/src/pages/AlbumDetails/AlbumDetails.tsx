import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams, useSearchParams } from 'react-router';
import { Box, Typography, Link, } from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import AlbumLoader from '../../components/AlbumLoader/AlbumLoader.tsx';
import TagCollection from '../../components/TagCollection/TagCollection.tsx';
import LinkCollection from '../../components/LinkCollection/LinkCollection.tsx';
import { Album, Track } from '../../models/models.ts';
import { ChildAnchorBlueStyles, ChildAnchorGrayStyles, Colors } from '../../services/themeService.ts';
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

    artistName: {
        fontSize: '18px',
        marginBottom: '8px',
        marginTop: '4px',
        ...ChildAnchorGrayStyles
    },

    comment: {
        marginBottom: '10px'
    },

    releaseDateSection: {
        display: 'flex',
        marginBottom: '8px'
    },

    description: {
        marginBottom: '12px',
        whiteSpace: 'pre-wrap'
    },

    trackContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '12px',
        minWidth: '50%',
        rowGap: '6px',
        width: 'fit-content'
    },

    track: {
        display: 'flex'
    },

    trackNumberColumn: {
        paddingRight: '12px',
        minWidth: '22px',
        textAlign: 'right'
    },

    nameColumn: {
        ...ChildAnchorBlueStyles
    },

    durationColumn: {
        marginLeft: 'auto',
        paddingLeft: '18px'
    }
}));

interface AlbumDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const AlbumDetails: FC<AlbumDetailsProps> = (props: AlbumDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Album>(SharedService.getEmptyAlbum());
    const [ showFullDesc, setShowFullDesc ] = useState<boolean>(false);
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

    const handleShowFullDesc = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        setShowFullDesc(!showFullDesc);
    };

    const images = SharedService.getEntityImageList(entity);
    const desc = SharedService.getEntityDescription(entity.description);

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
                                            <>
                                                {entity.artist}
                                            </>
                                }
                            </Typography>

                            {
                                entity.comment &&
                                <Box>
                                    <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>
                                </Box>
                            }

                            <TagCollection items={(entity.tags || []).slice(0, 10)} />

                            <Box className={cx(classes.releaseDateSection)}>
                                <Typography variant='subtitle2'>Released:</Typography>
                                <Typography variant='body2'>&nbsp;&nbsp;{SharedService.formatDateValue(entity.releaseDate)}</Typography>
                            </Box>

                            {
                                desc.short && !showFullDesc &&
                                <Typography variant='body2' className={cx(classes.description)}>
                                    {desc.short}

                                    {
                                        desc.hasFullDesc &&
                                        <>
                                            &nbsp;
                                            <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show more)</Link>
                                        </>
                                    }
                                </Typography>
                            }

                            {
                                showFullDesc &&
                                <Typography variant='body2' className={cx(classes.description)}>
                                    {desc.full}
                                    &nbsp;
                                    <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show less)</Link>
                                </Typography>
                            }

                            <LinkCollection items={entity.links} />

                            {
                                entity.tracks && entity.tracks.length > 0 &&
                                <Box className={cx(classes.trackContainer)}>
                                    {
                                        entity.tracks.map((track: Track, index: number) => {
                                            return (
                                                <Box key={track.id} className={cx(classes.track)}>
                                                    <Typography variant='body2' className={cx(classes.trackNumberColumn)}>{index + 1}</Typography>

                                                    <Box className={cx(classes.nameColumn)}>
                                                        <Typography variant='body2' component={RouteLink} to={`/song/${track.id}`}>{track.name}</Typography>
                                                    </Box>

                                                    <Typography variant='body2' className={cx(classes.durationColumn)}>{track.duration}</Typography>
                                                </Box>
                                            );
                                        })
                                    }
                                </Box>
                            }

                            {

                            }
                        </>
            }
        </Box>
    )
};

export default AlbumDetails;
