import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams, useSearchParams } from 'react-router';
import { Box, Button, Typography, Link, } from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import TagCollection from '../../components/TagCollection/TagCollection.tsx';
import AlbumLoader from '../../components/AlbumLoader/AlbumLoader.tsx';
import { Album, LinkEntry } from '../../models/models.ts';
import * as SharedService from '../../services/sharedService.ts';
import * as DataService from '../../services/dataService.ts';
import {ChildAnchorGrayStyles, Colors} from '../../services/themeService.ts';

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

    linkContainer: {
        '& div': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0
            }
        }
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

                            {
                                entity.links && entity.links.length > 0 &&
                                <Box className={cx(classes.linkContainer)}>
                                    {
                                        entity.links.map((item: LinkEntry, index: number) => {
                                            return (
                                                <Box key={index}>
                                                    <Button component={RouteLink} to={item.target} target='_blank'>
                                                        {item.label}
                                                    </Button>
                                                </Box>
                                            )
                                        })
                                    }
                                </Box>
                            }
                        </>
            }
        </Box>
    )
};

export default AlbumDetails;
