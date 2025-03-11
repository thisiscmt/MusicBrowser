import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams, useSearchParams } from 'react-router';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import AlbumLoader from '../../components/AlbumLoader/AlbumLoader.tsx';
import EntityDescription from '../../components/EntityDescription/EntityDescription.tsx';
import TagCollection from '../../components/TagCollection/TagCollection.tsx';
import LinkCollection from '../../components/LinkCollection/LinkCollection.tsx';
import { Album } from '../../models/models.ts';
import { Colors, ChildAnchorGrayStyles, ImageViewerStyles } from '../../services/themeService.ts';
import * as SharedService from '../../services/sharedService.ts';
import * as DataService from '../../services/dataService.ts';
import Tracks from '../../components/Tracks/Tracks.tsx';

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
    }
}));

interface AlbumDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const AlbumDetails: FC<AlbumDetailsProps> = (props: AlbumDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Album>(SharedService.getEmptyAlbum());
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
    }, [albumId, entity.name, props.topOfPageRef, searchParams, setBanner]);

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

                            <EntityDescription entityDesc={entity.description} />
                            <LinkCollection items={entity.links} />
                            <Tracks tracks={entity.trackList[0].tracks} totalDuration={entity.trackList[0].totalDuration} artist={entity.artist} />
                        </>
            }
        </Box>
    )
};

export default AlbumDetails;
