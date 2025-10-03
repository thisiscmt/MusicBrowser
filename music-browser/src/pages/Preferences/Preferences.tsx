import React, {useContext, useState} from 'react';
import { Box, FormControl, FormControlLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { tss } from 'tss-react/mui';

import useDocumentTitle from '../../hooks/useDocumentTitle.tsx';
import { MainContext } from '../../contexts/MainContext.tsx';
import { Colors } from '../../services/themeService.ts';
import * as Constants from '../../constants/constants';

const useStyles = tss.create(({ theme }) => ({
    mainContainer: {
        backgroundColor: Colors.white,
        display: 'flex',
        justifyContent: 'center',
        marginTop: '16px'

    },

    field: {
        '& .MuiFormControlLabel-root': {
            gap: '16px',
            marginLeft: 0,
            marginRight: 0
        }
    },

    fieldLabel: {
        fontSize: '14px',
        minWidth: '100px',

        [theme.breakpoints.down(600)]: {
            minWidth: '70px'
        }
    },

    pageSizeSelector: {
        width: '100px'
    }
}));

const Preferences = () => {
    const savedPageSize = window.localStorage.getItem(Constants.STORAGE_DEFAULT_PAGE_SIZE);

    const { classes, cx } = useStyles();
    const [ pageSize, setPageSize ] = useState<string>(savedPageSize || '10');
    const { setBanner } = useContext(MainContext);

    useDocumentTitle('Preferences - Music Browser');

    const handleChangePageSize = (event: SelectChangeEvent) => {
        setPageSize(event.target.value);
        window.localStorage.setItem(Constants.STORAGE_DEFAULT_PAGE_SIZE, event.target.value);

        setBanner('Preferences saved');
    };

    return (
        <Box className={cx(classes.mainContainer)}>
            <FormControl className={cx(classes.field)}>
                <FormControlLabel
                    labelPlacement='start'
                    label='Default page size'
                    classes={{ label: classes.fieldLabel }}
                    control={
                        <Select size='small' value={pageSize} className={cx(classes.pageSizeSelector)} onChange={handleChangePageSize}>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                        </Select>
                    }
                />
            </FormControl>
        </Box>
    )
};

export default Preferences;
