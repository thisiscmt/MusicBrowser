import React, { FC, useState } from 'react';
import { Box, Button, FormControlLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import EntityDetails from '../EntityDetails/EntityDetails.tsx';
import { Album } from '../../models/models.ts';
import { DiscographyType, EntityType } from '../../enums/enums.ts';

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
    entities: Album[];
    onChangeDiscogType: (discogType: DiscographyType) => void;
    onShowMoreDiscogEntities: (discogType: DiscographyType) => void;
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const [ currentDiscogType, setCurrentDiscogType ] = useState<DiscographyType>(DiscographyType.Albums);

    const handleChangeDiscogType = (event: SelectChangeEvent) => {
        const discogType = event.target.value as DiscographyType;

        setCurrentDiscogType(discogType);
        props.onChangeDiscogType(discogType);
    };

    const onShowMoreItems = () => {
        props.onShowMoreDiscogEntities(currentDiscogType);
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
                            <Select value={DiscographyType.Albums} size='small' className={cx(classes.discogTypeSelector)} onChange={handleChangeDiscogType}>
                                <MenuItem value={DiscographyType.Albums}>Albums</MenuItem>
                                <MenuItem value={DiscographyType.SinglesEPs}>Singles & EPs</MenuItem>
                                <MenuItem value={DiscographyType.Compilations}>Compilations</MenuItem>
                            </Select>
                        </Box>
                    }
                />
            </Box>

            {
                props.entities.length === 0
                ?
                    <>
                        <Typography variant='body2'>No items of the selected type were found for this artist.</Typography>
                    </>
                :
                    <Box className={cx(classes.artistDetailContainer)}>
                        {
                            props.entities.map((item: Album) => {
                                const albumImage = item.images && item.images.length > 0 ? item.images[0] : undefined;

                                return (
                                    <Box key={item.id} className='artistDetail'>
                                        <EntityDetails id={item.id} name={item.name} entityType={EntityType.Album} dateValue={item.releaseDate}
                                                       image={albumImage} />
                                    </Box>
                                );
                            })
                        }

                        <Button onClick={onShowMoreItems}>Show more</Button>
                    </Box>
            }
        </>
    );
}

export default Discography;
