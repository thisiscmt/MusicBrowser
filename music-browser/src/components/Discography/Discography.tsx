import React, { FC, useState } from 'react';
import  {Box, FormControlLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import ArtistDetail from '../ArtistDetail/ArtistDetail.tsx';
import { AlbumEntity } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';

const useStyles = tss.create(({ theme }) => ({
    typeSelectorContainer: {
        marginBottom: '12px',

        '& .MuiFormControlLabel-root': {
            marginLeft: 0,
        }
    },

    fieldLabel: {
        fontSize: '14px',
        paddingRight: '16px',

        [theme.breakpoints.down(470)]: {
            marginBottom: '4px',
            paddingRight: 0,
            textAlign: 'left',
            width: '100%'
        }
    },

    discogTypeSelector: {
        width: '160px'
    },

    artistDetailContainer: {
        '& .artistDetail': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0,
            }
        },
    }
}));

interface DiscographyProps {
    albums: AlbumEntity[];
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const [discogType, setDiscogType] = useState<string>('Albums')

    const handleTypeChange = (event: SelectChangeEvent<string>) => {
        setDiscogType(event.target.value);

        // TODO: Show the proper items
    };

    return (
        <>
            <Box className={cx(classes.typeSelectorContainer)}>
                <FormControlLabel
                    labelPlacement='start'
                    label='Type:'
                    classes={{ label: classes.fieldLabel }}
                    control={
                        <Box>
                            <Select value={discogType} size='small' className={cx(classes.discogTypeSelector)} onChange={handleTypeChange}>
                                <MenuItem value='Albums'>Albums</MenuItem>
                                <MenuItem value='SinglesEPs'>Singles & EPs</MenuItem>
                                <MenuItem value='Compilations'>Compilations</MenuItem>
                            </Select>
                        </Box>
                    }
                />
            </Box>

            {
                props.albums.length === 0
                ?
                    <>
                        <Typography variant='body2'>No items of the selected type were found for this artist.</Typography>
                    </>
                :
                    <Box className={cx(classes.artistDetailContainer)}>
                        {
                            props.albums.map((item: AlbumEntity) => {
                                const albumImage = item.images && item.images.length > 0 ? item.images[0] : undefined;

                                return (
                                    <Box key={item.id} className='artistDetail'>
                                        <ArtistDetail id={item.id} name={item.name} entityType={EntityType.Album} dateValue={item.releaseDate}
                                                      image={albumImage} />
                                    </Box>
                                );
                            })
                        }
                    </Box>
            }
        </>
    );
}

export default Discography;
