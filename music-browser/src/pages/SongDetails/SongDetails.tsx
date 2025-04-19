import React, { FC, RefObject, useContext, useEffect, useState } from 'react';
import { Link as RouteLink, useParams } from 'react-router';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';
import DOMPurify from 'dompurify';

import { MainContext } from '../../contexts/MainContext.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import Tags from '../../components/Tags/Tags.tsx';
import Links from '../../components/Links/Links.tsx';
import AlbumLoader from '../../components/AlbumLoader/AlbumLoader.tsx';
import GoToTop from '../../components/GoToTop/GoToTop.tsx';
import { Song } from '../../models/models.ts';
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
        marginBottom: '12px',
        marginTop: '4px',

        '& a': {
            ...GrayAnchorStyles
        }
    },

    comment: {
        marginBottom: '12px'
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
    }
}));

interface SongDetailsProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const SongDetails: FC<SongDetailsProps> = (props: SongDetailsProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ entity, setEntity ] = useState<Song>(SharedService.getEmptySong());
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
            SharedService.scrollToTop(props.topOfPageRef);
        }
    });

    return (
        <Box className={cx(classes.mainContainer)}>
            {
                loading
                    ?
                        <AlbumLoader />
                    :
                        <>
                            {
                                entity.name &&
                                <Typography variant='h5'>{entity.name}</Typography>
                            }

                            {
                                entity.artist &&
                                <Typography variant='body2' className={cx(classes.artistName)}>
                                    {
                                        entity.artistId
                                            ?
                                                <RouteLink to={`/artist/${entity.artistId}`}>{entity.artist}</RouteLink>
                                            :
                                                <>{entity.artist}</>
                                    }
                                </Typography>
                            }

                            {/*{*/}
                            {/*    entity.comment &&*/}
                            {/*    <Typography variant='body2' className={cx(classes.comment)}>{`(${entity.comment})`}</Typography>*/}
                            {/*}*/}

                            <Tags items={(entity.tags || []).slice(0, 10)} />

                            {
                                entity.links.length > 0 &&
                                <Box className={cx(classes.linkContainer)}>
                                    <Links items={entity.links} />
                                </Box>
                            }

                            {
                                entity.appearsOn && entity.appearsOn.length > 0 &&
                                <Box>

                                </Box>
                            }

                            <GoToTop topOfPageRef={props.topOfPageRef} />
                        </>
            }
        </Box>
    )
};

export default SongDetails;
