import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import { Artist } from '../../models/models.ts';

const useStyles = tss.create(() => ({
    lifeSpanSection: {
        display: 'flex'
    }
}));

interface LifeSpanProps {
    artist: Artist
}

const LifeSpan: FC<LifeSpanProps> = (props: LifeSpanProps) => {
    const { classes, cx } = useStyles();

    const artistBeginLabel = props.artist.artistType === 'Group' ? 'Formed:' : 'Born:';
    const artistEndLabel = props.artist.artistType === 'Group' ? 'Dissolved:' : 'Died:';
    let lifeSpanBeginArea = (props.artist.beginArea && props.artist.beginArea.name) ? `, ${props.artist.beginArea.name}` : '';
    let lifeSpanEndArea = (props.artist.endArea && props.artist.endArea.name) ? `, ${props.artist.endArea.name}` : '';

    if (props.artist.area && props.artist.area.name) {
        if (lifeSpanBeginArea) {
            lifeSpanBeginArea = `${lifeSpanBeginArea}, ${props.artist.area.name}`;
        } else {
            lifeSpanBeginArea = `, ${props.artist.area.name}`;
        }

        if (lifeSpanEndArea) {
            lifeSpanEndArea = `${lifeSpanEndArea}, ${props.artist.area.name}`;
        }
    }

    return (
        <>
            {
                props.artist.lifeSpan &&
                    <>
                        <Box className={cx(classes.lifeSpanSection)}>
                            <Typography variant='subtitle2'>{artistBeginLabel}</Typography>
                            <Typography variant='body2'>&nbsp;&nbsp;</Typography>

                            {
                               props.artist.lifeSpan.begin &&
                                <Typography variant='body2'>{props.artist.lifeSpan.begin}</Typography>
                            }

                            {
                                lifeSpanBeginArea &&
                                <Typography variant='body2'>{lifeSpanBeginArea}</Typography>
                            }
                        </Box>

                        {
                            props.artist.lifeSpan.ended &&
                            <Box className={cx(classes.lifeSpanSection)}>
                                <Typography variant='subtitle2'>{artistEndLabel}</Typography>

                                {
                                    props.artist.lifeSpan.end &&
                                    <Typography variant='body2'>&nbsp;&nbsp;{props.artist.lifeSpan.end}</Typography>
                                }

                                {
                                    lifeSpanEndArea &&
                                    <Typography variant='body2'>{lifeSpanBeginArea}</Typography>
                                }
                            </Box>
                        }
                    </>
            }
        </>
    );
}

export default LifeSpan;
