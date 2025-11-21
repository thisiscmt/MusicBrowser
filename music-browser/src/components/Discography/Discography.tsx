import React, {FC, useCallback, useContext, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router';
import {Box, Button, FormControlLabel, MenuItem, Select, SelectChangeEvent, Typography} from '@mui/material';
import {tss} from 'tss-react/mui';

import EntityDetails from '../EntityDetails/EntityDetails.tsx';
import EntityDetailsLoader from '../Loaders/EntityDetailsLoader/EntityDetailsLoader.tsx';
import {Album, DiscographyParams} from '../../models/models.ts';
import {DiscographyType, EntityType, PaginationButton} from '../../enums/enums.ts';
import {MainContext} from '../../contexts/MainContext.tsx';
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

    pagination: {
        marginTop: '16px',
        paddingBottom: '24px',

        '& .MuiPagination-ul': {
            justifyContent: 'center'
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
}

const Discography: FC<DiscographyProps> = (props: DiscographyProps) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ currentDiscogType, setCurrentDiscogType ] = useState<DiscographyType>(DiscographyType.Album);
    const [ currentPages, setCurrentPages ] = useState<EntityMetadata>({
        [DiscographyType.Album]: 1,
        [DiscographyType.SingleEP]: 1,
        [DiscographyType.Compilation]: 1,
        [DiscographyType.LiveCompilation]: 1,
        [DiscographyType.Demo]: 1
    });
    const [ disablePreviousButton, setDisablePreviousButton ] = useState<boolean>(true);
    const [ disableNextButton, setDisableNextButton ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ initialLoad, setInitialLoad ] = useState<boolean>(true);
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ currentQueryString, setCurrentQueryString ] = useState<string>('');
    const [ entities, setEntities ] = useState<Album[] | undefined>(undefined);

    const defaultPageSize = SharedService.getDefaultPageSize();

    const getDiscogEntities = useCallback(async (searchParamsArg: URLSearchParams) => {
        try {
            setLoading(true);

            const discogType = searchParamsArg.get('discogType') as DiscographyType || DiscographyType.Album;
            const discogParams: DiscographyParams = {
                id: props.entityId,
                discogType,
                entityType: props.entityType,
                pageSize: defaultPageSize
            };

            const discogPage = searchParamsArg.get('page');
            
            if (discogPage) {
                discogParams.page = (!Number.isNaN(discogPage) && Number(discogPage) !== 0) ? Number(discogPage) : 1;
            } else {
                discogParams.page = 1;
            }

            setCurrentPages({...currentPages, [currentDiscogType]: discogParams.page});
            const newEntities = await DataService.getDiscography(discogParams);

            setEntities(newEntities.rows);
            setDisableNextButton(newEntities.rows.length < defaultPageSize);
        } catch(_error) {
            setBanner('An error occurred retrieving the artist\'s discoggraphy', 'error');
        } finally {
            setLoading(false);
        }
    }, [props.entityId, props.entityType, defaultPageSize, currentPages, currentDiscogType, setCurrentPages, setBanner]);

    useEffect(() => {
        const fetchData = async () => {
            await getDiscogEntities(searchParams);
        }

        if (initialLoad) {
            setEntities(props.entities);
            setDisableNextButton(props.entities.length < defaultPageSize);
            setInitialLoad(false);

            return;
        }

        const queryStringChanged = currentQueryString !== searchParams.toString();
        let getData = false;

        if (queryStringChanged) {
            const discogTypeQueryParam = searchParams.get('discogType') as DiscographyType;
            const pageQueryParam = searchParams.get('page');

            if (!discogTypeQueryParam && currentDiscogType) {
                setCurrentDiscogType(DiscographyType.Album);
                setEntities(props.entities);
                setDisablePreviousButton(!pageQueryParam);
                setDisableNextButton(props.entities.length < defaultPageSize);

                currentPages[DiscographyType.Album] = 1;
            } else if (discogTypeQueryParam) {
                setCurrentDiscogType(discogTypeQueryParam);
                getData = true;
            }

            if (pageQueryParam) {
                const newPageQueryParam = Number(pageQueryParam);

                if (!isNaN(newPageQueryParam)) {
                    setCurrentPages({...currentPages, [currentDiscogType]: newPageQueryParam});
                    setDisablePreviousButton(newPageQueryParam === 1);
                } else {
                    setCurrentPages({...currentPages, [currentDiscogType]: 1});
                }

                getData = true;
            }

            setCurrentQueryString(searchParams.toString());
        }

        if (getData) {
            fetchData();
        }
    }, [initialLoad, searchParams, getDiscogEntities, currentQueryString, currentDiscogType, currentPages, defaultPageSize, props.entities]);

    const handleChangeDiscogType = async (event: SelectChangeEvent) => {
        const discogType = event.target.value as DiscographyType;

        setCurrentPages({ ...currentPages, [discogType]: 1 });
        setCurrentDiscogType(discogType);

        searchParams.set('discogType', discogType);
        searchParams.delete('page');
        setSearchParams(searchParams);
    };

    const handleChangePage = (sourceButton: PaginationButton) => {
        const currentPage = currentPages[currentDiscogType];
        let newPage: number;

        if (sourceButton === PaginationButton.Previous) {
            newPage = currentPage - 1;
            setDisablePreviousButton(newPage === 1);
        } else {
            newPage = currentPage + 1;
        }

        searchParams.set('page', newPage.toString());
        setCurrentPages({...currentPages, [currentDiscogType]: newPage });
        setSearchParams(searchParams);
    }

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

                                            <Box className={cx(classes.pagination)}>
                                                <Button variant='text' onClick={() => handleChangePage(PaginationButton.Previous)} disabled={disablePreviousButton}>Previous</Button>
                                                <Button variant='text' onClick={() => handleChangePage(PaginationButton.Next)} disabled={disableNextButton}>Next</Button>
                                            </Box>
                                        </Box>
                            }
                        </>
            }


        </>
    );
}

export default Discography;
