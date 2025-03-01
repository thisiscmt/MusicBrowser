import React, { FC, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams } from 'react-router';
import { Box, Button, Tab, Typography, Link } from '@mui/material';
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
import { Album, Artist, LinkEntry } from '../../models/models.ts';
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

    image: {
        minWidth: '250px',
        width: '250px',
        alignSelf: 'center'
    },

    entityName: {
        marginBottom: '6px'
    },

    comment: {
        marginBottom: '6px'
    },

    lifeSpanSection: {
        marginBottom: '10px'
    },

    annotation: {
        fontSize: '14px',
        marginBottom: '10px',
        ...ChildAnchorBlueStyles
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
    },

    linkContainer: {
        '& div': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0,
            }
        }
    },

    tabPanel: {
        padding: '12px 0 0 0'
    }
}));

interface EntityDescription {
    hasFullDesc: boolean,
    short: string;
    full: string;
}

const ArtistDetails: FC = () => {
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
        }
    });

    const handleShowFullDesc = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        setShowFullDesc(!showFullDesc);
    };

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const getEntityDescription = (): EntityDescription => {
        const entityDesc: EntityDescription = {
            hasFullDesc: false,
            short: '',
            full: ''
        }

        if (entity.description) {
            // We normalize line breaks and do general cleanup so we get a nice presentation of the description text
            const desc = entity.description.replace(/(\[\[)\n(\]\])/g, '\n').trim().replace(/\n\n/g, '\n');

            const descParts = desc.split('\n');

            if (descParts.length > 0) {
                entityDesc.short = descParts[0];

                if (descParts.length > 1) {
                    entityDesc.hasFullDesc = true;
                    entityDesc.full = desc.replace(/\n/g, '\n\n');
                }
            }
        }

        return entityDesc;
    };

    const images = SharedService.getEntityImageList(entity);
    const entityDesc = getEntityDescription();
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
                                <Box>
                                    <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>
                                </Box>
                            }

                            {
                                entity.tags && entity.tags.length > 0 &&
                                <Box className={cx(classes.tagContainer)}>
                                    {
                                        entity.tags.map((item: string, index: number) => {
                                            return <Box key={index} className={cx(classes.tag)}>{item}</Box>
                                        })
                                    }
                                </Box>
                            }

                            {
                                entity.lifeSpan &&
                                <Box className={cx(classes.lifeSpanSection)}>
                                    <LifeSpan artist={entity} />
                                </Box>
                            }

                            {
                                entityDesc.short && !showFullDesc &&
                                <Typography variant='body2' className={cx(classes.entityDesc)}>
                                    {entityDesc.short}

                                    {
                                        entityDesc.hasFullDesc &&
                                        <>
                                            &nbsp;
                                            <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show more)</Link>
                                        </>
                                    }
                                </Typography>
                            }

                            {
                                showFullDesc &&
                                <Typography variant='body2' className={cx(classes.entityDesc)}>
                                    {entityDesc.full}
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
                                                    <Tab label='Annotation' value='annotation' />
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
                                            <TabPanel className={cx(classes.tabPanel)} value='annotation'>
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
