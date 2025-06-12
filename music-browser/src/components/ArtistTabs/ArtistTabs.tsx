import React, {FC, useState} from 'react';
import { Box, Fade, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { tss } from 'tss-react/mui';
import DOMPurify from 'dompurify';

import Discography from '../Discography/Discography.tsx';
import GroupMembers from '../GroupMembers/GroupMembers.tsx';
import { BlueAnchorStyles, Colors, ImageViewerStyles } from '../../services/themeService.ts';
import { EntityType } from '../../enums/enums.ts';
import { Artist, Album } from '../../models/models.ts';
import * as SharedService from '../../services/sharedService.ts';

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

interface ArtistTabsProps {
    entity: Artist;
    albums: Album[];
}

const ArtistTabs: FC<ArtistTabsProps> = (props: ArtistTabsProps) => {
    const { classes, cx } = useStyles();
    const [ currentTab, setCurrentTab] = useState<string>('discography');

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    return (
        <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChangeTab}>
                    <Tab label='Discography' value='discography' />

                    {
                        props.entity.members && props.entity.members.length > 0 &&
                        <Tab label='Members' value='members' />
                    }

                    {
                        props.entity.annotation &&
                        <Tab label='Extra' value='extra' />
                    }
                </TabList>
            </Box>

            <Fade in={currentTab === 'discography'} timeout={500}>
                <TabPanel className={cx(classes.tabPanel)} value='discography'>
                    <Discography entityId={props.entity.id} entityType={EntityType.Artist} entities={props.albums} totalEntities={props.entity.totalAlbums} />
                </TabPanel>
            </Fade>

            {
                props.entity.members && props.entity.members.length > 0 &&
                <Fade in={currentTab === 'members'} timeout={500}>
                    <TabPanel className={cx(classes.tabPanel)} value='members'>
                        <GroupMembers entities={props.entity.members} />
                    </TabPanel>
                </Fade>
            }

            {
                props.entity.annotation &&
                <Fade in={currentTab === 'extra'} timeout={500}>
                    <TabPanel className={cx(classes.tabPanel)} value='extra'>
                        <Typography
                            variant='body2'
                            className={cx(classes.annotation)}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(SharedService.convertWikiTextToHTML(props.entity.annotation)) }}
                        />
                    </TabPanel>
                </Fade>
            }
        </TabContext>
    );
}

export default ArtistTabs;
