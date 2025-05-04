import React, { useContext, useEffect, useState, useCallback } from 'react';
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
    Pagination,
    InputAdornment,
    IconButton,
    Typography, 
    Fade
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import SearchResultDetails from '../../components/SearchResultDetails/SearchResultDetails.tsx';
import SearchResultLoader from '../../components/SearchResultLoader/SearchResultLoader.tsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import { MainContext } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';
import { SearchResults, SearchResult, SearchParams } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';
import * as DataService from '../../services/dataService';
import * as SharedService from '../../services/sharedService';
import * as Constants from '../../constants/constants';

const useStyles = makeStyles()((theme) => ({
    mainContainer: {
        backgroundColor: Colors.white,
        paddingLeft: '16px',
        paddingRight: '16px'
    },

    introText: {
        lineHeight: 1.3,
        margin: 'inherit'
    },

    entityTypeRow: {
        marginTop: '7px'
    },

    submitButtonRow: {
        marginTop: '10px'
    },

    resultsRow: {
        marginTop: '20px'
    },

    field: {
        '& .MuiFormControlLabel-root': {
            marginLeft: 0
        }
    },

    fieldLabel: {
        fontSize: '14px',
        minWidth: '70px',
    },

    fieldRow: {
        marginTop: '16px'
    },

    searchText: {
        width: '100%',

        '& .MuiFormControl-root': {
            paddingLeft: '9px'
        },

        '& .MuiOutlinedInput-root': {
            paddingRight: '6px'
        },

        '& .MuiFormControlLabel-root': {
            marginRight: 0
        }
    },

    clearSearch: {
        padding: '4px'
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

    searchResultsContainer: {
        '& .searchResult': {
            marginBottom: '8px',

            '&:last-child': {
                marginBottom: 0
            }
        },
    },

    loader: {
        marginBottom: '12px',

        '&:last-child': {
            marginBottom: 0
        }
    },

    pagination: {
        marginTop: '16px',
        marginBottom: '24px',

        '& .MuiPagination-ul': {
            justifyContent: 'center'
        }
    }
}));

const Home = () => {
    const { classes, cx } = useStyles();
    const { setBanner } = useContext(MainContext);
    const [ searchText, setSearchText ] = useState<string>('');
    const [ artistSearchText, setArtistSearchText ] = useState<string>('');
    const [ entityType, setEntityType ] = useState<string>(EntityType.Artist);
    const [ searchResults, setSearchResults ] = useState<SearchResult[] | undefined>(undefined);
    const [ currentPage, setCurrentPage ] = useState<number>(1);
    const [ pageCount, setPageCount ] = useState<number>(0);
    const [ currentQueryString, setCurrentQueryString ] = useState<string>('');
    const [ showArtistSearchInput, setShowArtistSearchInput ] = useState<boolean>(false);
    const [ searchTextInputError, setSearchTextInputError ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ noResults, setNoResults ] = useState<boolean>(false);
    const [ searchParams, setSearchParams ] = useSearchParams();

    const defaultPageSize = SharedService.getDefaultPageSize();

    useDocumentTitle('Home - Music Browser');

    const getSearchResults = useCallback(async (searchParamsArg: URLSearchParams) => {
        if (!searchParamsArg.get('searchText')) {
            return;
        }

        setLoading(true);

        const searchRequestParams: SearchParams = { query: searchParamsArg.get('searchText') || '' };
        const entityTypeArg = searchParamsArg.get('entityType') || EntityType.Artist;
        const page = searchParamsArg.get('page') || '1';
        const pageSize = searchParamsArg.get('pageSize') || defaultPageSize.toString();

        searchRequestParams.page = page ? Number(page) : 1;
        searchRequestParams.pageSize = pageSize ? Number(pageSize) : defaultPageSize;

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
                    {
                        const artistSearchTextArg = searchParamsArg.get('artistSearchText') || '';

                        if (artistSearchTextArg) {
                            searchRequestParams.query += ` artist:${artistSearchTextArg}`;
                        }

                        results = await DataService.searchSongs(searchRequestParams);
                        break;
                    }
            }

            setSearchResults(results.rows);
            setPageCount(Math.ceil(results.count / defaultPageSize));
            setCurrentPage(searchRequestParams.page);
            setNoResults(results.rows.length === 0);

            window.scrollTo({ top: 0, behavior: 'smooth'});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // TODO: Log this somewhere
            setBanner('An error occurred retrieving search results', 'error');
        } finally {
            setLoading(false);
        }
    }, [defaultPageSize, setBanner]);

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
    }, [searchParams, currentQueryString, searchText, artistSearchText, getSearchResults, setSearchText]);

    const handleChangeSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const handleChangeArtistSearchText = (event: React.ChangeEvent<HTMLInputElement>) => {
        setArtistSearchText(event.target.value);
    };

    const handleChangeEntityType = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEntityType(event.target.value);

        if (event.target.value === EntityType.Song) {
            setShowArtistSearchInput(true);
        } else {
            setShowArtistSearchInput(false);
        }
    };

    const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
        searchParams.set('page', value.toString());

        setCurrentPage(value);
        setSearchParams(searchParams);
        window.scrollTo({ top: 0, behavior: 'smooth'});
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

        if (artistSearchText) {
            searchParams.set('artistSearchText', artistSearchText);
        } else {
            searchParams.delete('artistSearchText');
        }

        searchParams.set('entityType', entityType);

        if (currentPage !== 1) {
            searchParams.set('page', '1');
            setCurrentPage(1);
        }

        setSearchParams(searchParams);
    };

    const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearchText = () => {
        setSearchText('');
    };

    const handleClearArtistSearchText = () => {
        setArtistSearchText('');
    };

    const searchResultsToRender = searchResults || [];

    return (
        <Box className={cx(classes.mainContainer)}>
            <Box className={cx(classes.fieldRow)}>
                <Typography variant='body1' className={cx(classes.introText)}>
                    The Music Browser is used to look up information about musical artists. Use the fields below to find an artist, album, or song.
                </Typography>

                <Typography variant='body1' className={cx(classes.introText)}>
                    When searching for a song, you can optionally specify an artist name to narrow down the results.
                </Typography>
            </Box>

            <Grid item xs={12} className={cx(classes.fieldRow)}>
                <FormControl className={cx(classes.field, classes.searchText)}>
                    <FormControlLabel
                        labelPlacement='start'
                        label='Search'
                        classes={{ label: classes.fieldLabel }}
                        control={
                            <TextField
                                name='Search'
                                value={searchText}
                                size='small'
                                error={searchTextInputError}
                                fullWidth={true}
                                autoCorrect='off'
                                inputProps={{ maxLength: 255 }}
                                onChange={handleChangeSearchText}
                                onKeyDown={handleEnterKeyDown}
                                InputProps={ searchText ?
                                    {
                                        endAdornment:
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    className={cx(classes.clearSearch)}
                                                    aria-label='clear search input'
                                                    onClick={handleClearSearchText}
                                                    title='Clear search text'
                                                    type='submit'
                                                >
                                                    <CloseOutlined />
                                                </IconButton>
                                            </InputAdornment>
                                    } : undefined
                                }
                            />
                        }
                    />
                </FormControl>
            </Grid>

            {
                showArtistSearchInput &&
                <Fade in={showArtistSearchInput} timeout={500}>
                    <Grid item xs={12} className={cx(classes.fieldRow)}>
                        <FormControl className={cx(classes.field, classes.searchText)}>
                            <FormControlLabel
                                labelPlacement='start'
                                label='Artist'
                                classes={{ label: classes.fieldLabel }}
                                control={
                                    <TextField
                                        name='Artist'
                                        value={artistSearchText}
                                        size='small'
                                        fullWidth={true}
                                        autoCorrect='off'
                                        inputProps={{ maxLength: 255 }}
                                        onChange={handleChangeArtistSearchText}
                                        onKeyDown={handleEnterKeyDown}
                                        InputProps={ artistSearchText ?
                                            {
                                                endAdornment:
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            className={cx(classes.clearSearch)}
                                                            aria-label='clear artist input'
                                                            onClick={handleClearArtistSearchText}
                                                            title='Clear artist search text'
                                                            type='submit'
                                                        >
                                                            <CloseOutlined />
                                                        </IconButton>
                                                    </InputAdornment>
                                            } : undefined
                                        }
                                    />
                                }
                            />
                        </FormControl>
                    </Grid>
                </Fade>
            }

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
                                    [1, 2, 3, 4].map((item: number) => {
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
                                                <Box className={cx(classes.searchResultsContainer)}>
                                                    {
                                                        searchResultsToRender.map((item: SearchResult) => {
                                                            const searchResultImage = item.entityType === EntityType.Artist ? Constants.STOCK_ARTIST_IMAGE :
                                                                (item.entityType === EntityType.Album ? Constants.STOCK_ALBUM_IMAGE : Constants.STOCK_SONG_IMAGE);

                                                            return (
                                                                <Box key={item.id} className='searchResult'>
                                                                    <SearchResultDetails entity={item} image={searchResultImage} />
                                                                </Box>
                                                            );
                                                        })
                                                    }
                                                </Box>

                                                <Box>
                                                    <Pagination onChange={handleChangePage} page={currentPage} count={pageCount} showFirstButton={true}
                                                                showLastButton={true} className={cx(classes.pagination)} />
                                                </Box>
                                            </>
                                        :
                                            <>
                                                {
                                                    !loading && noResults &&
                                                    <Typography variant='body2'>No results for '{searchText}'</Typography>
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
