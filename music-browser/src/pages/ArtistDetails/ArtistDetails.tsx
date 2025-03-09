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

    hideFullDesc: {
        height: 0,
        marginBottom: 0,
        opacity: 0
    },

    showFullDesc: {
        height: 'auto',
        marginBottom: '12px',
        opacity: 1,
        transition: 'opacity 0.5s linear',
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

interface ArtistDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const ArtistDetails: FC<ArtistDetailsProps> = (props: ArtistDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Artist>(SharedService.getEmptyArtist());
    const [ showFullDesc, setShowFullDesc ] = useState<boolean>(false);
    const [ albums, setAlbums] = useState<Album[]>([]);
    const [ currentTab, setCurrentTab] = useState<string>('discography');
    const [ loading, setLoading ] = useState<boolean>(true);
    const { id: artistId } = useParams() as { id: string };

    useDocumentTitle(entity.name === '' ? 'Artist - Music Browser' : `Artist - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');

                const artist = await DataService.getArtist(artistId);

                if (artist.lifeSpan) {
                    artist.lifeSpan.begin = SharedService.formatDateValue(artist.lifeSpan.begin);
                    artist.lifeSpan.end = SharedService.formatDateValue(artist.lifeSpan.end);
                }

                if (artist.members) {
                    for (let i = 0; i < artist.members.length; i++) {
                        if (artist.members[i].lifeSpan) {
                            artist.members[i].lifeSpan.begin = SharedService.formatDateValue(artist.members[i].lifeSpan.begin);
                        }
                    }
                }

                setEntity(artist);
                setAlbums(artist.albums);
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

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const images = SharedService.getEntityImageList(entity);
    const entityDesc = SharedService.getEntityDescription(entity.description);
    const showTabs = (entity.albums && entity.albums.length > 0) || (entity.members && entity.members.length > 0);

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading
                    ?
                        <ArtistLoader />
                    :
                        <>
                            {
                                images.length > 0 &&
                                <ImageGallery items={images} showPlayButton={false} additionalClass={cx(classes.imageContainer)} showFullscreenButton={false} />
                            }

                            <Typography variant='h5' className={entity.comment ? undefined : cx(classes.entityName)}>{entity.name}</Typography>

                            {
                                entity.comment &&
                                <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>
                            }

                            <TagCollection items={(entity.tags || []).slice(0, 10)} />

                            {
                                entity.lifeSpan &&
                                <Box className={cx(classes.lifeSpanSection)}>
                                    <LifeSpan artist={entity} />
                                </Box>
                            }

                            {
                                entityDesc.short &&
                                <Typography variant='body2' className={cx(classes.entityDesc)}>
                                    {entityDesc.short}

                                    {
                                        entityDesc.hasFullDesc && !showFullDesc &&
                                        <>
                                            &nbsp;
                                            <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show more)</Link>
                                        </>
                                    }
                                </Typography>
                            }

                            <Typography variant='body2' className={showFullDesc ? cx(classes.showFullDesc) : cx(classes.hideFullDesc)}>
                                {entityDesc.full}
                                &nbsp;
                                <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show less)</Link>
                            </Typography>

                            <LinkCollection items={entity.links} />

                            {
                                showTabs &&
                                <>
                                    <TabContext value={currentTab}>
                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                            <TabList onChange={handleChangeTab}>
                                                <Tab label='Discography' value='discography' />

                                                {
                                                    entity.members && entity.members.length > 0 &&
                                                    <Tab label='Members' value='members' />
                                                }

                                                {
                                                    entity.annotation &&
                                                    <Tab label='Extra' value='extra' />
                                                }
                                            </TabList>
                                        </Box>

                                        <TabPanel className={cx(classes.tabPanel)} value='discography'>
                                            <Discography entityId={entity.id} entities={albums} totalEntities={entity.totalAlbums} />
                                        </TabPanel>

                                        {
                                            entity.members && entity.members.length > 0 &&
                                            <TabPanel className={cx(classes.tabPanel)} value='members'>
                                                <GroupMembers entities={entity.members} />
                                            </TabPanel>
                                        }

                                        {
                                            entity.annotation &&
                                            <TabPanel className={cx(classes.tabPanel)} value='extra'>
                                                <Typography
                                                    variant='body2'
                                                    className={cx(classes.annotation)}
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(SharedService.convertWikiTextToHTML(entity.annotation)) }}
                                                />
                                            </TabPanel>
                                        }
                                    </TabContext>
                                </>
                            }
                        </>
            }
        </Box>
    )
};

export default ArtistDetails;
