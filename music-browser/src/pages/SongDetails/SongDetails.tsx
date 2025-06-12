import React, { useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams } from 'react-router';
import { Box, Fade, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { tss } from 'tss-react/mui';
import DOMPurify from 'dompurify';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import Tags from '../../components/Tags/Tags.tsx';
import Links from '../../components/Links/Links.tsx';
import Discography from '../../components/Discography/Discography.tsx';
import SongLoader from '../../components/Loaders/SongLoader/SongLoader.tsx';
import GoToTop from '../../components/GoToTop/GoToTop.tsx';
import { Song } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { BlueAnchorStyles, Colors, GrayAnchorStyles } from '../../services/themeService.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';

const useStyles = tss.create(() => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
    },

    entityName: {
        marginBottom: '12px'
    },

    artistName: {
        fontSize: '18px',
        marginTop: '4px',

        '& a': {
            ...GrayAnchorStyles
        }
    },

    details: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '8px'
    },

    detailSection: {
        display: 'flex',
    },

    section: {
        marginBottom: '12px'
    },

    label: {
        marginRight: '8px'
    },

    annotation: {
        fontSize: '14px',
        marginBottom: '10px',

        '& a': {
            ...BlueAnchorStyles
        },

        '& pre': {
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

const SongDetails = () => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Song>(SharedService.getEmptySong());
    const [ currentTab, setCurrentTab] = useState<string>('appearsOn');
    const [ loading, setLoading ] = useState<boolean>(true);
    const { id: songId } = useParams() as { id: string };

    useDocumentTitle(entity.name === '' ? 'Song - Music Browser' : `Song - ${entity.name} - Music Browser`);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setBanner('');

                const song = await DataService.getSong(songId);
                setEntity(song);
            } catch (error) {
                setBanner((error as Error).message, 'error');
            } finally {
                setLoading(false);
            }
        }

        if (entity.name === '') {
            fetchData();
            window.scrollTo({ top: 0, behavior: 'smooth'});
        }
    });

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading
                    ?
                        <SongLoader />
                    :
                        <>
                            <Typography variant='h5'>{entity.name}</Typography>

                            {
                                entity.artist &&
                                <Typography variant='body2' className={entity.comment ? cx(classes.artistName) : cx(classes.artistName, classes.section)}>
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
                                <Typography variant='body2' className={cx(classes.section)}>{`(${entity.comment})`}</Typography>
                            }

                            <Tags items={(entity.tags || []).slice(0, 10)} />

                            {
                                (entity.duration || entity.releaseDate) &&
                                <Box className={cx(classes.details)}>
                                    {
                                        entity.duration &&
                                        <Box className={cx(classes.detailSection)}>
                                            <Typography variant='subtitle2' className={cx(classes.label)}>Duration:</Typography>
                                            <Typography variant='body2'>{entity.duration}</Typography>
                                        </Box>
                                    }

                                    {
                                        entity.releaseDate &&
                                        <Box className={cx(classes.detailSection)}>
                                            <Typography variant='subtitle2' className={cx(classes.label)}>Released:</Typography>
                                            <Typography variant='body2'>{SharedService.formatDateValue(entity.releaseDate)}</Typography>
                                        </Box>
                                    }
                                </Box>
                            }

                            {
                                entity.links.length > 0 &&
                                <Box className={cx(classes.linkContainer)}>
                                    <Links items={entity.links} />
                                </Box>
                            }

                            <TabContext value={currentTab}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: '-8px' }}>
                                    <TabList onChange={handleChangeTab}>
                                        <Tab label='Appears On' value='appearsOn' />

                                        {
                                            entity.annotation &&
                                            <Tab label='Extra' value='extra' />
                                        }
                                    </TabList>
                                </Box>

                                <Fade in={currentTab === 'appearsOn'} timeout={500}>
                                    <TabPanel className={cx(classes.tabPanel)} value='appearsOn'>
                                        <Discography entityId={entity.artistId} entityType={EntityType.Song} entities={entity.appearsOn}
                                                     totalEntities={entity.appearsOn.length} />
                                    </TabPanel>
                                </Fade>

                                {
                                    entity.annotation &&
                                    <Fade in={currentTab === 'extra'} timeout={500}>
                                        <TabPanel className={cx(classes.tabPanel)} value='extra'>
                                            <Typography
                                                variant='body2'
                                                className={cx(classes.annotation)}
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(SharedService.convertWikiTextToHTML(entity.annotation)) }}
                                            />
                                        </TabPanel>
                                    </Fade>
                                }
                            </TabContext>

                            <GoToTop showAtPosition={100} />
                        </>
            }
        </Box>
    )
};

export default SongDetails;
