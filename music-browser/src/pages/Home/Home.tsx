import {FC, RefObject, useContext, useState} from 'react';
import {Box, Button, CircularProgress, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField} from '@mui/material';
import { tss } from 'tss-react/mui';

import { SearchResultEntity } from '../../models/models.ts';
import { ENTITY_TYPE } from '../../enums/enums.ts';
import { MainContext } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';

const useStyles = tss.create(({ theme }) => ({
    mainContainer: {
        [theme.breakpoints.down(600)]: {
            marginLeft: '12px',
            marginRight: '12px'
        }
    },

    row: {
        marginTop: '16px'
    },

    entityTypeRow: {
        marginTop: '7px'
    },

    field: {
        '& .MuiFormControlLabel-root': {
            marginLeft: 0
        }
    },

    searchText: {
        width: '100%',

        '& .MuiFormControl-root': {
            paddingLeft: '9px'
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
            flexDirection: 'column'

        }
    },

    fieldLabel: {
        fontSize: '14px',
        minWidth: '100px'
    },

    saveIndicator: {
        color: Colors.white,
        marginLeft: '8px'
    },
}));

interface HomeProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const Home: FC<HomeProps> = ({ topOfPageRef }) => {
    const { classes, cx } = useStyles();
    const [ searchText, setSearchText ] = useState<string>('');
    const [ entityType, setEntityType ] = useState<string>('');
    const [ searchResults, setSearchResults ] = useState<SearchResultEntity[]>([]);
    const [ searchTextInputError, setSearchTextInputError ] = useState<boolean>(false);
    const [ loading, setLoading ] = useState<boolean>(false);
    const { setBanner } = useContext(MainContext);

    const handleSearch = () => {
        if (searchText === '') {
            setBanner('');
        } else {
            setBanner('You must provide search text', 'error');
            return;
        }



    };



    return (
        <Box className={cx(classes.mainContainer)}>
            <Grid item xs={12} className={cx(classes.row)}>
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
                                onChange={(event) => setSearchText(event.target.value)}
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
                            <RadioGroup aria-labelledby='entity-type' row={true} defaultValue={ENTITY_TYPE.Artist} className={cx(classes.entityTypeOptions)}>
                                <FormControlLabel value={ENTITY_TYPE.Artist} control={<Radio />} label='Artist' />
                                <FormControlLabel value={ENTITY_TYPE.Album} control={<Radio />} label='Album' />
                                <FormControlLabel value={ENTITY_TYPE.Song} control={<Radio />} label='Song' />
                            </RadioGroup>
                        }
                    />
                </FormControl>
            </Grid>

            <Grid item xs={12} className={cx(classes.row)}>
                <Button onClick={handleSearch} variant='contained' color='primary' disabled={loading}>Submit
                    {loading && (
                        <CircularProgress size={20} className={cx(classes.saveIndicator)} />
                    )}
                </Button>
            </Grid>

            <Grid item xs={12} className={cx(classes.row)}>
                Results go here
            </Grid>
        </Box>
    );
}

export default Home;
