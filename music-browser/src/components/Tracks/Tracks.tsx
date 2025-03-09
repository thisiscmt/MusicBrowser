import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Track } from '../../models/models.ts';
import { ChildAnchorBlueStyles } from '../../services/themeService.ts';

const useStyles = tss.create(() => ({
    trackContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '12px',
        minWidth: '50%',
        rowGap: '6px',
        width: 'fit-content'
    },

    track: {
        display: 'flex'
    },

    trackNumberColumn: {
        paddingRight: '12px',
        minWidth: '22px',
        textAlign: 'right'
    },

    nameColumn: {
        ...ChildAnchorBlueStyles
    },

    durationColumn: {
        marginLeft: 'auto',
        paddingLeft: '18px'
    },

    totalDuration: {
        display: 'flex',
        marginTop: '6px'
    }
}));

interface TracksProps {
    tracks: Track[];
    totalDuration: string;
}

const Tracks: FC<TracksProps> = (props: TracksProps) => {
    const { classes, cx } = useStyles();

    return (
        <>
            {
                props.tracks && props.tracks.length > 0 &&
                <Box className={cx(classes.trackContainer)}>
                    {
                        props.tracks.map((track: Track, index: number) => {
                            return (
                                <Box key={track.id} className={cx(classes.track)}>
                                    <Typography variant='body2' className={cx(classes.trackNumberColumn)}>{index + 1}</Typography>

                                    <Box className={cx(classes.nameColumn)}>
                                        <Typography variant='body2' component={RouteLink} to={`/song/${track.id}`}>{track.name}</Typography>
                                    </Box>

                                    <Typography variant='body2' className={cx(classes.durationColumn)}>{track.duration}</Typography>
                                </Box>
                            );
                        })
                    }

                    {
                        props.totalDuration &&
                        <Box className={cx(classes.totalDuration)}>
                            <Typography variant='body2' className={cx(classes.trackNumberColumn)}></Typography>
                            <Typography variant='subtitle2'>Total duration: </Typography>
                            <Typography variant='body2' className={cx(classes.durationColumn)}>{props.totalDuration}</Typography>
                        </Box>
                    }
                </Box>
            }
        </>
    );
}

export default Tracks;
