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

const useStyles = tss.create(() => ({
    typeSelectorContainer: {
        marginBottom: '12px',

        '& .MuiFormControlLabel-root': {
            marginLeft: 0
        }
    },

    fieldLabel: {
        fontSize: '14px',
        paddingRight: '16px'
    },

    discogTypeSelector: {
        width: '180px'
    },

    entityContainer: {
        '& .entityDetail': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0
            }
        }
    },

    loader: {
        marginBottom: '12px',

        '&:last-child': {
            marginBottom: 0
        }
    },

    showMoreButton: {
        marginTop: '10px',
        textAlign: 'center',

        '& .MuiButtonBase-root': {
            padding: '2px 6px'
        }
    }
}));

interface EntityCount {
    [discogType: string]: number
}

interface DiscographyProps {
    entityId: string;
    entities: Album[];
    totalEntities: number;
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ currentDiscogType, setCurrentDiscogType ] = useState<DiscographyType>(DiscographyType.Album);
    const [ entities, setEntities ] = useState<Album[] | undefined>(undefined);
    const [ albums, setAlbums ] = useState<Album[] | undefined>(undefined);
    const [ singlesEPs, setSinglesEPs ] = useState<Album[] | undefined>(undefined);
    const [ compilations, setCompilations ] = useState<Album[] | undefined>(undefined);
    const [ liveCompilations, setLiveCompilations ] = useState<Album[] | undefined>(undefined);
    const [ demos, setDemos ] = useState<Album[] | undefined>(undefined);
    const [ entityCounts, setEntityCounts ] = useState<EntityCount>({});
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ disableShowMore, setDisableShowMore ] = useState<boolean>(false);

    const defaultPageSize = SharedService.getDefaultPageSize();

    useEffect(() => {
        setEntities(props.entities);
        setAlbums(props.entities);

        const entityCounts = { [DiscographyType.Album.toString()]: props.totalEntities };

        if (props.entities.length < defaultPageSize) {
            // For the initial load we are showing albums, and the total count passed in that is returned by the API includes subtypes that we don't
            // show on the Album tab (e.g. compilations, demos, etc). So if the total is less than the default page size, we set that as the total
            // count so the Show More button isn't visible if the user switches the discog type and then goes back to Albums.
            entityCounts[DiscographyType.Album] = props.entities.length;
            setDisableShowMore(true);
        }

        setEntityCounts(entityCounts);
    }, [props.entities, props.totalEntities, defaultPageSize]);

    const getDiscogEntities = async (discogType: DiscographyType, stateVariable: Album[] | undefined, stateUpdateFunction: (value: Album[]) => void,
                                     page: number, pageSize: number, append?: boolean) => {
        if (stateVariable !== undefined && !append) {
            setEntities(stateVariable);

            if (entityCounts[discogType] !== undefined) {
                setDisableShowMore(entityCounts[discogType] === stateVariable.length);
            }

            return;
        }

        const newEntities = await DataService.getArtistDiscography(props.entityId, discogType, page, pageSize);
        let newRows = newEntities.rows;

        if (stateVariable !== undefined && append) {
            newRows = [...stateVariable, ...newRows];
            let ordinal = 0;

            for (const row of newRows) {
                row.ordinal = ordinal;
                ordinal += 1;
            }
        }

        stateUpdateFunction(newRows);
        setEntities(newRows);

        if (entityCounts[discogType] !== undefined) {
            if (discogType === DiscographyType.Album) {
                // We can't use the regular entity count for albums to know whether there are more albums to fetch because it will be too large, since
                // it includes subtypes that we don't show on the Album tab (e.g. compilations, demos, etc). So we look at what was returned by the
                // latest request and if it's not a full page worth, we know we are at the end of the actual album list. In that case we update the
                // entity count for albums since we know the true number now, so if the user switches the discog type and then switches it back to Album,
                // the visibility of the Show More button will be correct.
                const newEntityCounts = {...entityCounts};
                newEntityCounts[DiscographyType.Album] = newRows.length;

                setDisableShowMore(newEntities.rows.length < pageSize);
                setEntityCounts(newEntityCounts);
            } else {
                setDisableShowMore(entityCounts[discogType] === newRows.length);
            }
        } else {
            const newEntityCounts = {...entityCounts};

            newEntityCounts[discogType] = newEntities.count;
            setEntityCounts(newEntityCounts);
            setDisableShowMore(newEntities.rows.length < defaultPageSize);
        }
    };

    const getStateObjects = (discogType: DiscographyType) => {
        let stateVariable: Album[] | undefined;
        let stateUpdateFunction: (value: Album[]) => void;

        switch (discogType) {
            case DiscographyType.Album:
                stateVariable = albums;
                stateUpdateFunction = setAlbums;

                break;
            case DiscographyType.SingleEP:
                stateVariable = singlesEPs;
                stateUpdateFunction = setSinglesEPs;

                break;
            case DiscographyType.Compilation:
                stateVariable = compilations;
                stateUpdateFunction = setCompilations;

                break;
            case DiscographyType.LiveCompilation:
                stateVariable = liveCompilations;
                stateUpdateFunction = setLiveCompilations;

                break;
            case DiscographyType.Demo:
                stateVariable = demos;
                stateUpdateFunction = setDemos;

                break;
        }

        return { stateVariable, stateUpdateFunction };
    };

    const handleChangeDiscogType = async (event: SelectChangeEvent) => {
        try {
            setLoading(true);
            const discogType = event.target.value as DiscographyType;
            const { stateVariable, stateUpdateFunction } = getStateObjects(discogType);

            await getDiscogEntities(discogType, stateVariable, stateUpdateFunction, 1, defaultPageSize);
            setCurrentDiscogType(discogType);
        } catch (error) {
            setBanner((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleShowMoreItems = async () => {
        try {
            setLoading(true);

            const { stateVariable, stateUpdateFunction } = getStateObjects(currentDiscogType);

            // We need to get the current page for the given discog type, since they could all vary independently
            const currentPage = Math.floor((stateVariable || []).length / defaultPageSize);

            const newPage = currentPage + 1;
            await getDiscogEntities(currentDiscogType, stateVariable, stateUpdateFunction, newPage, defaultPageSize, true);
        } catch (error) {
            setBanner((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const entityIds: string[] = [];

    if (entities) {
        for (const item of entities) {
            entityIds.push(item.id);
        }
    }

    return (
        <>
            {
                loading
                    ?
                        <>
                            {
                                [1, 2, 3, 4, 5, 6].map((item: number) => {
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
                                        <Typography variant='body2'>No items of the current discography type were found for this artist.</Typography>
                                    :
                                        <Box className={cx(classes.entityContainer)}>
                                            {
                                                entities?.map((item: Album) => {
                                                    const albumImage = item.images && item.images.length > 0 ? item.images[0] : undefined;
                                                    let discogType: string | undefined;

                                                    if (currentDiscogType === DiscographyType.SingleEP && (item.albumType === 'Single' || item.albumType === 'EP')) {
                                                        discogType = item.albumType;
                                                    }

                                                    return (
                                                        <Box key={item.id} className='entityDetail'>
                                                            <EntityDetails
                                                                id={item.id} name={item.name} entityType={EntityType.Album} discogType={discogType}
                                                                dateValue={item.releaseDate} image={albumImage} secondaryId={props.entityId}
                                                                entityIds={entityIds}
                                                            />
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
