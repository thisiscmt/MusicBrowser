import React, { FC, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Button, FormControlLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import EntityDetails from '../EntityDetails/EntityDetails.tsx';
import EntityDetailsLoader from '../Loaders/EntityDetailsLoader/EntityDetailsLoader.tsx';
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

interface EntityMetadata {
    [discogType: string]: number
}

interface DiscographyProps {
    entityId: string;
    entityType: EntityType;
    entities: Album[];
    totalEntities: number;
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ currentDiscogType, setCurrentDiscogType ] = useState<DiscographyType>(DiscographyType.Album);

    // This variable stores the discog entries currently being viewed.
    const [ entities, setEntities ] = useState<Album[] | undefined>(undefined);

    // These variables store lists of each type of discog item as the data is fetched. This allows quick rendering of content when the user changes
    // the discog type.
    const [ albums, setAlbums ] = useState<Album[] | undefined>(undefined);
    const [ singlesEPs, setSinglesEPs ] = useState<Album[] | undefined>(undefined);
    const [ compilations, setCompilations ] = useState<Album[] | undefined>(undefined);
    const [ liveCompilations, setLiveCompilations ] = useState<Album[] | undefined>(undefined);
    const [ demos, setDemos ] = useState<Album[] | undefined>(undefined);

    // This variable stores runnig counts of the entries for each discog type, to help show/hide the Show More button.
    const [ entityCounts, setEntityCounts ] = useState<EntityMetadata>({});

    const [ entityPages, setEntityPages ] = useState<EntityMetadata>({
        [DiscographyType.Album]: 1,
        [DiscographyType.SingleEP]: 1,
        [DiscographyType.Compilation]: 1,
        [DiscographyType.LiveCompilation]: 1,
        [DiscographyType.Demo]: 1
    });
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ disableShowMore, setDisableShowMore ] = useState<boolean>(false);
    const [ searchParams, setSearchParams ] = useSearchParams();

    const defaultPageSize = SharedService.getDefaultPageSize();

    const getDiscogEntities = async (discogType: DiscographyType, stateVariable: Album[] | undefined, stateUpdateFunction: (value: Album[]) => void,
                                     page: number, pageSize: number, append?: boolean) => {
        if (stateVariable !== undefined && !append) {
            setEntities(stateVariable);

            if (entityCounts[discogType] !== undefined) {
                setDisableShowMore(entityCounts[discogType] === stateVariable.length);
            }

            return;
        }

        setLoading(true);

        const newEntities = await DataService.getDiscography(props.entityId, discogType, props.entityType, page, pageSize);
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

        setLoading(false);
    };

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

    useEffect(() => {
        const fetchData = async () => {
            await getSearchResults(searchParams);
        }

        const queryStringChanged = currentQueryString !== searchParams.toString();
        let getData = true;

        // The check for whether the query string changed is to handle the user clicking the browser's Back button, so we can do a data fetch since
        // we likely need different data.
        if (queryStringChanged) {
            const searchTextQueryParam = searchParams.get('searchText');
            const artistSearchTextQueryParam = searchParams.get('artistSearchText');
            const entityTypeQueryParam = searchParams.get('entityType');

            // If the user clicked the browser's Back button and no longer has a search text query param we need to clear the text box. Or if they
            // clicked Back and have a search text query param we need to put it in the text box.
            if (!searchTextQueryParam && searchText) {
                setSearchText('');
                setSearchResults([]);

                getData = false;
            } else if (searchTextQueryParam) {
                setSearchText(searchTextQueryParam);
            }

            if (!artistSearchTextQueryParam && artistSearchText) {
                setArtistSearchText('');
            } else if (artistSearchTextQueryParam) {
                setArtistSearchText(artistSearchTextQueryParam);
            }

            if (entityTypeQueryParam) {
                setEntityType(entityTypeQueryParam);

                if (entityTypeQueryParam === EntityType.Song) {
                    setShowArtistSearchInput(true);
                }
            }

            setCurrentQueryString(searchParams.toString());

            if (getData) {
                fetchData();
            }
        }
    });

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
        const discogType = event.target.value as DiscographyType;

        searchParams.set('discogType', discogType);
        setCurrentDiscogType(discogType);
        setSearchParams(searchParams);
    };

    const handleShowMoreItems = async () => {
        const newPage = entityPages[currentDiscogType] + 1;

        searchParams.set('page', newPage.toString());
        setSearchParams(searchParams);
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
                                [1, 2, 3, 4].map((item: number) => {
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
                                        <Typography variant='body2'>No items of the current discography type were found.</Typography>
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
