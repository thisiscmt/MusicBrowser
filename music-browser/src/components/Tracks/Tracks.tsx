import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Track } from '../../models/models.ts';
import { BlueAnchorStyles } from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    mainContainer: {
        display: 'grid',
        rowGap: '6px',
        width: 'fit-content'
    },

    track: {
        display: 'grid',
        columnGap: '16px'
    },

    stdGridColumns: {
        gridTemplateColumns: '16px auto 50px'
    },

    withArtistGridColumns: {
        gridTemplateColumns: '16px 2fr 1fr 50px'
    },

    link: {
        ...BlueAnchorStyles
    },

    nameOverflow: {
        overflowWrap: 'anywhere'
    },

    durationColumn: {
        textAlign: 'right'
    },

    totalDurationContainer: {
        marginTop: '4px'
    },

    totalDuration: {
        fontWeight: 'bold'
    }
}));

interface TracksProps {
    tracks: Track[];
    totalDuration: string;
    artist: string;
}

const Tracks: FC<TracksProps> = (props: TracksProps) => {
    const { classes, cx } = useStyles();
    const artist = props.artist.toLowerCase();

    const nonUniqueArtists = props.tracks.some((track: Track) => {
        return track.artist.toLowerCase() !== artist;
    });

    const trackClasses = nonUniqueArtists ? classes.withArtistGridColumns : classes.stdGridColumns;

    return (
        <>
            {
                props.tracks && props.tracks.length > 0 &&
                <Box className={cx(classes.mainContainer)}>
                    {
                        props.tracks.map((track: Track, index: number) => {
                            const trackURL = `/?searchText=${encodeURIComponent(track.name)}&entityType=song`

                            return (
                                <Box key={track.id} className={cx(classes.track, trackClasses)}>
                                    <Typography variant='body2'>{index + 1}</Typography>

                                    <Typography variant='body2' component={RouteLink} to={trackURL} className={cx(classes.link, classes.nameOverflow)}>
                                        {track.name}
                                    </Typography>

                                    {
                                        nonUniqueArtists &&
                                            <>
                                                {
                                                    track.artistId
                                                        ?
                                                            <Typography variant='body2' component={RouteLink} to={`/artist/${track.artistId}`}
                                                                        className={cx(classes.link, classes.nameOverflow)}>
                                                                {track.artist}
                                                            </Typography>
                                                        :
                                                            <Typography variant='body2' className={cx(classes.nameOverflow)}>
                                                                {track.artist}
                                                            </Typography>
                                                }
                                            </>
                                    }

                                    <Typography variant='body2' className={cx(classes.durationColumn)}>{track.duration}</Typography>
                                </Box>
                            );
                        })
                    }

                    {
                        props.totalDuration &&
                        <Box className={cx(classes.totalDurationContainer, classes.track, classes.stdGridColumns)}>
                            <Typography variant='body2'></Typography>
                            <Typography variant='subtitle2'>Total duration:</Typography>
                            <Typography variant='body2' className={cx(classes.durationColumn, classes.totalDuration)}>{props.totalDuration}</Typography>
                        </Box>
                    }
                </Box>
            }
        </>
    );
}

export default Tracks;
