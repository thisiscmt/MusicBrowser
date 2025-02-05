import React, { FC, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

import { ArtistEntity, LinkEntry } from '../../models/models.ts';
import { MainContext } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';
import ArtistLoader from '../../components/ArtistLoader/ArtistLoader.tsx';
import useDocumentTitle from '../../components/hooks/useDocumentTitle.tsx';
import LifeSpan from '../../components/LifeSpan/LifeSpan.tsx';
import {EntityType} from '../../enums/enums.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
    },

    section: {
        marginBottom: '12px'
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

    button: {
        textTransform: 'none'
    }
}));

interface EntityDescription {
    short: string;
    full: string;
}

const Artist: FC = () => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<ArtistEntity>(SharedService.getEmptyArtist());
    const [ currentTab, setCurrentTab] = useState<number>(0);
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
            } catch (error: any) {
                setBanner(error.message, 'error');
            } finally {
                setLoading(false);
            }
        }

        if (entity.name === '') {
            fetchData();
        }
    });

    const getEntityDescription = (): EntityDescription => {
        const entityDesc = {
            short: '',
            full: ''
        }

        if (entity.description) {
            // We normalize the line breaks in the description so we get nice spacing between blocks of text
            const desc = entity.description.replace(/\n\n/g, '\n').trim();
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

                            <Typography variant='h5' className={cx(classes.entityName)}>{entity.name}</Typography>

                            {
                                entity.tags.length > 0 &&
                                <Box className={cx(classes.tagContainer)}>
                                    {
                                        entity.tags.map((item: string, index: number) => {
                                            return <Box key={index} className={cx(classes.tag)}>{item}</Box>
                                        })
                                    }
                                </Box>
                            }

                            {
                                <Box className={cx(classes.section)}>
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
                                        <Typography variant='body2' className={cx(classes.entityDesc)}>{entityDesc.full}</Typography>
                            }

                            {
                                entity.links.length > 0 &&
                                <Box>
                                    {
                                        entity.links.map((item: LinkEntry, index: number) => {
                                            return (
                                                <Box key={index}>
                                                    <Button component={Link} to={item.target} className={cx(classes.button)} target='_blank' disableRipple={true}>
                                                        {item.label}
                                                    </Button>
                                                </Box>
                                            )
                                        })
                                    }
                                </Box>
                            }

                            <Tabs value={currentTab}>
                                <Tab label='Discography' className={cx(classes.button)} />
                                <Tab label='Members' className={cx(classes.button)} />
                            </Tabs>
                        </>
            }
        </Box>
    )
};

export default Artist;
