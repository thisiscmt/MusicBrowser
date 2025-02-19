import React, { FC, useContext, useEffect, useState } from 'react';
import { Box, Button, FormControlLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import EntityDetails from '../EntityDetails/EntityDetails.tsx';
import EntityDetailsLoader from '../EntityDetailsLoader/EntityDetailsLoader.tsx';
import { Album } from '../../models/models.ts';
import { DiscographyType, EntityType } from '../../enums/enums.ts';
import { MainContext } from '../../contexts/MainContext.tsx';
import * as DataService from '../../services/dataService.ts';
import * as SharedService from '../../services/sharedService.ts';

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
    },

    loader: {
        marginBottom: '12px',

        '&:last-child': {
            marginBottom: 0,
        }
    },

    showMoreButton: {
        marginTop: '10px',
        textAlign: 'center'
    }
}));

interface DiscographyProps {
    entityId: string;
    entities: Album[];
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ currentDiscogType, setCurrentDiscogType ] = useState<DiscographyType>(DiscographyType.Album);
    const [ discogPage, setDiscogPage] = useState<number>(1);
    const [ entities, setEntities ] = useState<Album[] | undefined>(undefined);
    const [ albums, setAlbums ] = useState<Album[] | undefined>(undefined);
    const [ singlesEPs, setSinglesEPs ] = useState<Album[] | undefined>(undefined);
    const [ compilations, setCompilations ] = useState<Album[] | undefined>(undefined);
    const [ liveCompilations, setLiveCompilations ] = useState<Album[] | undefined>(undefined);
    const [ demos, setDemos ] = useState<Album[]>([]);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ disableShowMore, setDisableShowMore ] = useState<boolean>(false);

    const defaultPageSize = SharedService.getDefaultPageSize();

    useEffect(() => {
        setEntities(props.entities)
        setAlbums(props.entities)
    }, [props.entities]);

    const getDiscogEntities = async (discogType: DiscographyType, stateVariable: Album[] | undefined, stateUpdateFunction: (value: Album[]) => void,
                                     page: number, pageSize: number, append?: boolean) => {
        if (stateVariable !== undefined && !append) {
            setEntities(stateVariable);
            return;
        }

        const newEntities = await DataService.getArtistDiscography(props.entityId, discogType, page, pageSize);
        let newRows = newEntities.rows;

        if (stateVariable !== undefined && append) {
            newRows = [...stateVariable, ...newRows];

        }

        // If we fetched less than the page size we know there aren't any more rows, so we hide the 'Show more' button
        setDisableShowMore(newEntities.rows.length < pageSize)

        stateUpdateFunction(newRows);
        setEntities(newRows);
    };

    const handleChangeDiscogType = async (event: SelectChangeEvent) => {
        const discogType = event.target.value as DiscographyType;

        setCurrentDiscogType(discogType);
        setLoading(true);

        try {
            switch (discogType) {
                case DiscographyType.Album:
                    await getDiscogEntities(DiscographyType.Album, albums, setAlbums, 1, defaultPageSize);
                    break;
                case DiscographyType.SingleEP:
                    await getDiscogEntities(DiscographyType.SingleEP, singlesEPs, setSinglesEPs, 1, defaultPageSize);
                    break;
                case DiscographyType.Compilation:
                    await getDiscogEntities(DiscographyType.Compilation, compilations, setCompilations, 1, defaultPageSize);
                    break;
                case DiscographyType.LiveCompilation:
                    await getDiscogEntities(DiscographyType.LiveCompilation, liveCompilations, setLiveCompilations, 1, defaultPageSize);
                    break;
                case DiscographyType.Demo:
                    await getDiscogEntities(DiscographyType.Demo, demos, setDemos, 1, defaultPageSize);
                    break;
            }
        } catch (error) {
            setBanner((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleShowMoreItems = async () => {
        try {
            const newPage = discogPage + 1;
            setLoading(true);

            switch (currentDiscogType) {
                case DiscographyType.Album:
                    await getDiscogEntities(DiscographyType.Album, albums, setAlbums, newPage, defaultPageSize, true);
                    break;
                case DiscographyType.SingleEP:
                    await getDiscogEntities(DiscographyType.SingleEP, singlesEPs, setSinglesEPs, newPage, defaultPageSize, true);
                    break;
                case DiscographyType.Compilation:
                    await getDiscogEntities(DiscographyType.Compilation, compilations, setCompilations, newPage, defaultPageSize, true);
                    break;
                case DiscographyType.LiveCompilation:
                    await getDiscogEntities(DiscographyType.LiveCompilation, liveCompilations, setLiveCompilations, newPage, defaultPageSize, true);
                    break;
                case DiscographyType.Demo:
                    await getDiscogEntities(DiscographyType.Demo, demos, setDemos, newPage, defaultPageSize, true);
                    break;
            }

            setDiscogPage(newPage);
        } catch (error) {
            setBanner((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                loading
                    ?
                        <>
                            {
                                [1, 2, 3, 4, 5].map((item: number) => {
                                    return (
                                        <Box key={item} className={cx(classes.loader)}><EntityDetailsLoader smallImage={true} /></Box>
                                    );
                                })
                            }
                        </>
                    :
                        <>
                            <Box className={cx(classes.typeSelectorContainer)}>
                                <FormControlLabel
                                    labelPlacement='start'
                                    label='Type:'
                                    classes={{ label: classes.fieldLabel }}
                                    control={
                                        <Box>
                                            <Select value={currentDiscogType} size='small' className={cx(classes.discogTypeSelector)}
                                                    onChange={handleChangeDiscogType}>
                                                <MenuItem value={DiscographyType.Album}>Albums</MenuItem>
                                                <MenuItem value={DiscographyType.SingleEP}>Singles & EPs</MenuItem>
                                                <MenuItem value={DiscographyType.Compilation}>Compilations</MenuItem>
                                                <MenuItem value={DiscographyType.LiveCompilation}>Live Compilations</MenuItem>
                                                <MenuItem value={DiscographyType.Demo}>Demos</MenuItem>
                                            </Select>
                                        </Box>
                                    }
                                />
                            </Box>

                            {
                                entities && entities.length === 0
                                    ?
                                        <Typography variant='body2'>No items of the selected type were found for this artist.</Typography>
                                    :
                                        <Box className={cx(classes.artistDetailContainer)}>
                                            {
                                                entities?.map((item: Album) => {
                                                    const albumImage = item.images && item.images.length > 0 ? item.images[0] : undefined;

                                                    return (
                                                        <Box key={item.id} className='artistDetail'>
                                                            <EntityDetails id={item.id} name={item.name} entityType={EntityType.Album} dateValue={item.releaseDate}
                                                                           image={albumImage} />
                                                        </Box>
                                                    );
                                                })
                                            }

                                            {
                                                !disableShowMore &&
                                                <Box className={cx(classes.showMoreButton)}>
                                                    <Button onClick={handleShowMoreItems}>Show more</Button>
                                                </Box>
                                            }
                                        </Box>
                            }
                        </>
            }


        </>
    );
}

export default Discography;
