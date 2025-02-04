import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { ArtistEntity } from '../../models/models.ts';

const useStyles = tss.create(() => ({
    lifeSpanSection: {
        display: 'flex'
    }
}));

interface LifeSpanProps {
    artist: ArtistEntity
}

const LifeSpan: FC<LifeSpanProps> = (props: LifeSpanProps) => {
    const { classes, cx } = useStyles();

    return (
        <>
            {
                props.artist.lifeSpan &&
                (props.artist.artistType === 'Group'
                    ?
                        <>
                            <Box className={cx(classes.lifeSpanSection)}>
                                <Typography variant='subtitle2'>Formed:&nbsp;&nbsp;</Typography>

                                {
                                    props.artist.lifeSpan.begin &&
                                    <Typography variant='body2'>{props.artist.lifeSpan.begin}</Typography>
                                }
                                {
                                    props.artist.beginArea.name &&
                                    <Typography variant='body2'>, {props.artist.beginArea.name}</Typography>
                                }
                                {
                                    props.artist.area && props.artist.area.name &&
                                    <Typography variant='body2'>, {props.artist.area.name}</Typography>
                                }
                            </Box>

                            {
                                props.artist.lifeSpan.ended &&
                                <Box className={cx(classes.lifeSpanSection)}>
                                    <Typography variant='subtitle2'>Dissolved:</Typography>

                                    {
                                        props.artist.lifeSpan.end &&
                                        <Typography variant='body2'>&nbsp;&nbsp;{props.artist.lifeSpan.end}</Typography>
                                    }
                                    {
                                        props.artist.endArea && props.artist.endArea.name
                                            ?
                                                <Typography variant='body2'>, {props.artist.endArea.name}</Typography>
                                            :
                                                <>
                                                    {
                                                        props.artist.area && props.artist.area.name &&
                                                        <Typography variant='body2'>, {props.artist.area.name}</Typography>
                                                    }
                                                </>
                                    }
                                </Box>
                            }
                        </>
                    :
                        <>
                            <Box className={cx(classes.lifeSpanSection)}>
                                <Typography variant='subtitle2'>Born:</Typography>

                                {
                                    props.artist.lifeSpan.begin &&
                                    <Typography variant='body2'>&nbsp;&nbsp;{props.artist.lifeSpan.begin}</Typography>
                                }
                                {
                                    props.artist.beginArea.name &&
                                    <Typography variant='body2'>, {props.artist.beginArea.name}</Typography>
                                }
                                {
                                    props.artist.area && props.artist.area.name &&
                                    <Typography variant='body2'>, {props.artist.area.name}</Typography>
                                }
                            </Box>

                            {
                                props.artist.lifeSpan.ended &&
                                <Box className={cx(classes.lifeSpanSection)}>
                                    <Typography variant='subtitle2'>Died:</Typography>

                                    {
                                        props.artist.lifeSpan.end &&
                                        <Typography variant='body2'>&nbsp;&nbsp;{props.artist.lifeSpan.end}</Typography>
                                    }
                                    {
                                        props.artist.endArea && props.artist.endArea.name &&
                                        <Typography variant='body2'>, {props.artist.endArea.name}</Typography>
                                    }
                                </Box>
                            }
                        </>
                )
            }
        </>
    );
}

export default LifeSpan;
