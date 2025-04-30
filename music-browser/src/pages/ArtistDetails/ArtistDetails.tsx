import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { tss } from 'tss-react/mui';
import DOMPurify from 'dompurify';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import ArtistLoader from '../../components/ArtistLoader/ArtistLoader.tsx';
import EntityDescription from '../../components/EntityDescription/EntityDescription.tsx';
import LifeSpan from '../../components/LifeSpan/LifeSpan.tsx';
import Discography from '../../components/Discography/Discography.tsx';
import GroupMembers from '../../components/GroupMembers/GroupMembers.tsx';
import Tags from '../../components/Tags/Tags.tsx';
import Links from '../../components/Links/Links.tsx';
import GoToTop from '../../components/GoToTop/GoToTop.tsx';
import { Album, Artist } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { Colors, BlueAnchorStyles, ImageViewerStyles } from '../../services/themeService.ts';
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
        ...ImageViewerStyles
    },

    entityName: {
        marginBottom: '12px'
    },

    comment: {
        marginBottom: '12px'
    },

    lifeSpanSection: {
        marginBottom: '8px'
    },

    annotation: {
        fontSize: '14px',
        marginBottom: '10px',

        '& a': {
            ...BlueAnchorStyles
        },

        '& p': {
            whiteSpace: 'pre-line'
        }
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
    const [ albums, setAlbums] = useState<Album[]>([]);
    const [ currentTab, setCurrentTab] = useState<string>('discography');
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);
    const { id: artistId } = useParams() as { id: string };

    const defaultPageSize = SharedService.getDefaultPageSize();

    useDocumentTitle(entity.name === '' ? 'Artist - Music Browser' : `Artist - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');
                setLoading(true);

                const artist = await DataService.getArtist(artistId, defaultPageSize);

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
                setError(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setBanner('An error occurred retrieving artist details', 'error');
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        // The entity ID comparison is for when the user goes backwards or forwards in the browser history to different artists
        if ((entity.name === '' || (entity.id && entity.id !== artistId)) && !error) {
            fetchData();
            SharedService.scrollToTop(props.topOfPageRef);
        }
    }, [artistId, defaultPageSize, entity.id, entity.name, error, props.topOfPageRef, setBanner]);

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const images = SharedService.getEntityImageList(entity);
    const showTabs = (entity.albums && entity.albums.length > 0) || (entity.members && entity.members.length > 0) || entity.annotation;

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

                            <Tags items={(entity.tags || []).slice(0, 10)} />

                            {
                                entity.lifeSpan &&
                                <Box className={cx(classes.lifeSpanSection)}>
                                    <LifeSpan artist={entity} />
                                </Box>
                            }

                            <EntityDescription entityDesc={entity.description} />
                            <Links items={entity.links} />

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
                                            <Discography entityId={entity.id} entityType={EntityType.Artist} entities={albums} totalEntities={entity.totalAlbums} />
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

                            <GoToTop topOfPageRef={props.topOfPageRef} />
                        </>
            }
        </Box>
    )
};

export default ArtistDetails;
