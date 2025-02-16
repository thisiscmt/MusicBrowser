import React, { FC, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Box, Button, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import ArtistLoader from '../../components/ArtistLoader/ArtistLoader.tsx';
import LifeSpan from '../../components/LifeSpan/LifeSpan.tsx';
import Discography from '../../components/Discography/Discography.tsx';
import { Album, Artist, LinkEntry } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { Colors } from '../../services/themeService.ts';
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
        marginBottom: '6px'
    },

    lifeSpanSection: {
        marginBottom: '10px'
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
    short: string;
    full: string;
}

const ArtistDetails: FC = () => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Artist>(SharedService.getEmptyArtist());
    const [ discogEntities, setDiscogEntities] = useState<Album[]>([]);
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
                setDiscogEntities(artist.albums);
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

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const getEntityDescription = (): EntityDescription => {
        const entityDesc = {
            short: '',
            full: ''
        }

        if (entity.description) {
            // We normalize line breaks and do general cleanup so we get a nice presentation of the description text
            const desc = entity.description.replace(/(\[\[)\n(\]\])/g, '\n').trim().replace(/\n\n/g, '\n');
            entityDesc.full = desc.replace(/\n/g, '\n\n');

            const descParts = desc.split('\n');

            if (descParts.length > 1) {
                entityDesc.short = descParts[0];
            }
        }

        return entityDesc;
    };

    const images = SharedService.getEntityImageList(entity);
    const entityDesc = getEntityDescription();

    const entityDescState = {
        images,
        desc: entityDesc.full,
        entityName: entity.name,
        entityType: EntityType.Artist
    };

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
                                    <Typography variant='body2' className={cx(classes.entityName)}>{`(${entity.comment})`}</Typography>
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
                                entityDesc.short
                                    ?
                                        <Typography variant='body2' className={cx(classes.entityDesc)}>
                                            {entityDesc.short}
                                            &nbsp;
                                            <Link to={`/artist/${entity.id}/description`} state={entityDescState} className='app-link'>(see more)</Link>
                                        </Typography>
                                    :
                                        <>
                                            {
                                                entityDesc.full &&
                                                <Typography variant='body2' className={cx(classes.entityDesc)}>{entityDesc.full}</Typography>
                                            }
                                        </>
                            }

                            {
                                entity.links && entity.links.length > 0 &&
                                <Box className={cx(classes.linkContainer)}>
                                    {
                                        entity.links.map((item: LinkEntry, index: number) => {
                                            return (
                                                <Box key={index}>
                                                    <Button component={Link} to={item.target} target='_blank'>
                                                        {item.label}
                                                    </Button>
                                                </Box>
                                            )
                                        })
                                    }
                                </Box>
                            }

                            {
                                (entity.albums || entity.members) &&
                                <>
                                    <TabContext value={currentTab}>
                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                            <TabList onChange={handleChangeTab} aria-label='Additional artist information'>
                                                <Tab label='Discography' value='discography' />
                                                {
                                                    entity.members &&
                                                    <Tab label='Members' value='members' />
                                                }
                                            </TabList>
                                        </Box>

                                        <TabPanel className={cx(classes.tabPanel)} value='discography'>
                                            <Discography entityId={entity.id} entities={discogEntities} />
                                        </TabPanel>
                                        <TabPanel className={cx(classes.tabPanel)} value='members'>
                                            Item Two
                                        </TabPanel>
                                    </TabContext>
                                </>
                            }
                        </>
            }
        </Box>
    )
};

export default ArtistDetails;
