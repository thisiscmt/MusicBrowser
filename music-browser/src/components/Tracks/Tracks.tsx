import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Track } from '../../models/models.ts';
import { BlueAnchorStyles } from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    trackContainer: {
        display: 'grid',
        rowGap: '6px',
        width: 'fit-content'
    },

    track: {
        display: 'grid',
        columnGap: '16px'
    },

    stdGridColumns: {
        gridTemplateColumns: '20px auto 50px'
    },

    withArtistGridColumns: {
        gridTemplateColumns: '20px 2fr 1fr 50px'
    },

    numericColumn: {
        textAlign: 'right'
    },

    link: {
        ...BlueAnchorStyles
    },

    totalDurationColumn: {
        fontWeight: 'bold',
        textAlign: 'right'
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
                <Box className={cx(classes.trackContainer)}>
                    {
                        props.tracks.map((track: Track, index: number) => {
                            return (
                                <Box key={track.id} className={cx(classes.track, trackClasses)}>
                                    <Typography variant='body2' className={cx(classes.numericColumn)}>{index + 1}</Typography>

                                    <Typography variant='body2' component={RouteLink} to={`/song/${track.id}`} className={cx(classes.link)}>
                                        {track.name}
                                    </Typography>

                                    {
                                        nonUniqueArtists &&
                                        <Typography variant='body2' component={RouteLink} to={`/artist/${track.artist}`} className={cx(classes.link)}>
                                            {track.artist}
                                        </Typography>
                                    }

                                    <Typography variant='body2' className={cx(classes.numericColumn)}>{track.duration}</Typography>
                                </Box>
                            );
                        })
                    }

                    {
                        props.totalDuration &&
                        <Box className={cx(classes.track, classes.stdGridColumns)}>
                            <Typography variant='body2' className={cx(classes.numericColumn)}></Typography>
                            <Typography variant='subtitle2'>Total duration:</Typography>
                            <Typography variant='body2' className={cx(classes.totalDurationColumn)}>{props.totalDuration}</Typography>
                        </Box>
                    }
                </Box>
            }
        </>
    );
}

export default Tracks;
