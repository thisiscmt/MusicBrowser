import React, { FC, RefObject, useContext, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Pagination
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import {SearchResults, SearchResultEntity, SearchParams} from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import { MainContext } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';
import * as Constants from '../../constants/constants';
import SearchResult from '../../components/SearchResult/SearchResult.tsx';
import SearchResultLoader from '../../components/SearchResultLoader/SearchResultLoader.tsx';

const useStyles = makeStyles()((theme) => ({
    mainContainer: {
        backgroundColor: Colors.white,
        paddingLeft: '12px',
        paddingRight: '12px',

        // [theme.breakpoints.down(600)]: {
        //     marginLeft: '12px',
        //     marginRight: '12px'
        // }
    },

    searchTextRow: {
        marginTop: '16px'
    },

    entityTypeRow: {
        marginTop: '7px'
    },

    submitButtonRow: {
        marginTop: '10px'
    },

    resultsRow: {
        marginTop: '18px'
    },

    field: {
        '& .MuiFormControlLabel-root': {
            marginLeft: 0
        }
    },

    fieldLabel: {
        fontSize: '14px',
        minWidth: '100px',

        [theme.breakpoints.down(600)]: {
            minWidth: '70px'
        }
    },

    searchText: {
        width: '100%',

        '& .MuiFormControl-root': {
            paddingLeft: '9px'
        },

        '& .MuiOutlinedInput-root': {
            paddingRight: 0
        },

        '& .MuiFormControlLabel-root': {
            marginRight: 0,
        }
    },

    entityTypeLabel: {
        [theme.breakpoints.down(600)]: {
            alignSelf: 'start',
            paddingTop: '9px'
        }
    },

    entityTypeOptions: {
        '& .MuiFormControlLabel-label': {
            fontSize: '14px'
        },

        [theme.breakpoints.down(600)]: {
            flexDirection: 'row',

            '& .MuiFormControlLabel-root:last-child': {
                marginRight: 0
            }
        }
    },

    saveIndicator: {
        color: Colors.white,
        marginLeft: '8px'
    },

    searchResultContainer: {
        a: {
            textDecoration: 'none'
        },

        '& .searchResult': {
            marginBottom: '8px',

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

    pagination: {
        marginTop: '16px',
        paddingBottom: '20px',

        '& .MuiPagination-ul': {
            justifyContent: 'center'
        }
    }
}));

interface HomeProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const Home: FC<HomeProps> = ({ topOfPageRef }) => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ searchText, setSearchText ] = useState<string>('');
    const [ entityType, setEntityType ] = useState<string>(EntityType.Artist);
    const [ searchResults, setSearchResults ] = useState<SearchResultEntity[] | undefined>(undefined);
    const [ currentPage, setCurrentPage ] = useState<number>(1);
    const [ pageCount, setPageCount ] = useState<number>(0);
    const [ currentQueryString, setCurrentQueryString ] = useState<string>('');
    const [ searchTextInputError, setSearchTextInputError ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ noResults, setNoResults ] = useState<boolean>(false);
    const [ searchParams, setSearchParams ] = useSearchParams();

    const getSearchResults = useCallback(async (searchParamsArg: URLSearchParams) => {
        if (!searchParamsArg.get('searchText')) {
            return;
        }

        setLoading(true);

        const searchRequestParams: SearchParams = { query: searchParamsArg.get('searchText') || '' };
        const entityTypeArg = searchParamsArg.get('entityType') || EntityType.Artist;
        const page = searchParamsArg.get('page') || '1';
        const pageSize = searchParamsArg.get('pageSize') || '10';

        searchRequestParams.page = page ? Number(page) : 1;
        searchRequestParams.pageSize = pageSize ? Number(pageSize) : 10;

        let results: SearchResults = {
            rows: [],
            count: 0
        };

        try {
            switch (entityTypeArg)
            {
                case EntityType.Artist:
                    results = await DataService.searchArtists(searchRequestParams);
                    break;

                case EntityType.Album:
                    results = await DataService.searchAlbums(searchRequestParams);
                    break;

                case EntityType.Song:
                    break;
            }

            setSearchResults(results.rows);
            setPageCount(results.count);
            setNoResults(results.rows.length === 0);

            SharedService.scrollToTop(topOfPageRef);
        } catch (error) {
            // TODO: Log this somewhere
            setBanner('An error occurred retrieving search results', 'error');
        } finally {
            setLoading(false);
        }
    }, [setBanner, topOfPageRef]);

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

            if (entityTypeQueryParam) {
                setEntityType(entityTypeQueryParam);
            }

            setCurrentQueryString(searchParams.toString());

            if (getData) {
                fetchData();
            }
        }
    }, [searchParams, currentQueryString, searchText, getSearchResults, setSearchText]);

    const handleChangeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const handleChangeEntityType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntityType(event.target.value);
    };

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        searchParams.set('page', value.toString());

        setCurrentPage(value);
        setSearchParams(searchParams);
        getSearchResults(searchParams);
    }

    const handleSearch = () => {
        if (searchText === '') {
            setSearchTextInputError(true);
            setBanner('You must provide search text', 'error');
            return;
        } else {
            setSearchTextInputError(false);
            setBanner('');
        }

        if (searchText) {
            searchParams.set('searchText', searchText);
        } else {
            searchParams.delete('searchText');
        }

        searchParams.set('entityType', entityType);

        if (currentPage !== 1) {
            searchParams.set('page', '1');
            setCurrentPage(1);
        }

        setSearchParams(searchParams);
        getSearchResults(searchParams);
    };

    const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const searchResultsToRender = searchResults || [];

    return (
        <Box className={cx(classes.mainContainer)}>
            <Grid item xs={12} className={cx(classes.searchTextRow)}>
                <FormControl className={cx(classes.field, classes.searchText)}>
                    <FormControlLabel
                        labelPlacement='start'
                        label='Search'
                        classes={{ label: classes.fieldLabel }}
                        control={
                            <TextField
                                name='Search'
                                margin='none'
                                variant='outlined'
                                value={searchText}
                                size='small'
                                error={searchTextInputError}
                                fullWidth={true}
                                autoCorrect='off'
                                inputProps={{ maxLength: 255 }}
                                onChange={handleChangeSearchText}
                                onKeyDown={handleEnterKeyDown}
                            />
                        }
                    />
                </FormControl>
            </Grid>

            <Grid item xs={12} className={cx(classes.entityTypeRow)}>
                <FormControl className={cx(classes.field)}>
                    <FormControlLabel
                        id='entity-type'
                        labelPlacement='start'
                        label='Entity'
                        classes={{ label: `${classes.fieldLabel} ${classes.entityTypeLabel}` }}
                        control={
                            <RadioGroup onChange={handleChangeEntityType} aria-labelledby='entity-type' row={true} value={entityType}
                                        className={cx(classes.entityTypeOptions)} onKeyDown={handleEnterKeyDown}>
                                <FormControlLabel value={EntityType.Artist} control={<Radio />} label='Artist' />
                                <FormControlLabel value={EntityType.Album} control={<Radio />} label='Album' />
                                <FormControlLabel value={EntityType.Song} control={<Radio />} label='Song' />
                            </RadioGroup>
                        }
                    />
                </FormControl>
            </Grid>

            <Grid item xs={12} className={cx(classes.submitButtonRow)}>
                <Button onClick={handleSearch} size='small' variant='contained' color='primary' disabled={loading}>Submit</Button>
            </Grid>

            <Grid item xs={12} className={cx(classes.resultsRow)}>
                {
                    loading
                        ?
                            <>
                                {
                                    [1, 2, 3, 4, 5].map((item: number) => {
                                        return (
                                            <Box key={item} className={cx(classes.loader)}><SearchResultLoader entityType={entityType as EntityType} /></Box>
                                        );
                                    })
                                }
                            </>
                        :
                            <>
                                {
                                    searchResultsToRender.length > 0
                                        ?
                                            <>
                                                <Box className={cx(classes.searchResultContainer)}>
                                                    {
                                                        searchResultsToRender.map((item: SearchResultEntity) => {
                                                            const searchResultImage = item.entityType === EntityType.Artist ? Constants.STOCK_ARTIST_IMAGE :
                                                                (item.entityType === EntityType.Album ? Constants.STOCK_ALBUM_IMAGE : Constants.STOCK_SONG_IMAGE);

                                                            return (
                                                                <Box key={item.id} className='searchResult'>
                                                                    <SearchResult entity={item} image={searchResultImage} />
                                                                </Box>
                                                            );
                                                        })
                                                    }
                                                </Box>

                                                <Box>
                                                    <Pagination onChange={handleChangePage} page={currentPage} count={pageCount}
                                                                className={cx(classes.pagination)} />
                                                </Box>
                                            </>
                                        :
                                            <>
                                                {
                                                    !loading && noResults &&
                                                    <Box>No results for '{searchText}'</Box>
                                                }
                                            </>
                                }
                            </>
                }
            </Grid>
        </Box>
    );
}

export default Home;
