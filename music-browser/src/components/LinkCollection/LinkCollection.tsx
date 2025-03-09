import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router';
import { Box, Button } from '@mui/material';
import { tss } from 'tss-react/mui';

import { LinkEntry } from '../../models/models.ts';

const useStyles = tss.create(() => ({
    linkContainer: {
        columnGap: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        rowGap: '4px'
    },

    linkButton: {
        paddingBottom: '4px',
        paddingTop: '4px'
    }
}));

interface LinkCollectionProps {
    items: LinkEntry[];
}

const LinkCollection: FC<LinkCollectionProps> = (props: LinkCollectionProps) => {
    const { classes, cx } = useStyles();

    return (
        <>
            {
                props.items.length > 0 &&
                <Box className={cx(classes.linkContainer)}>
                    {
                        props.items.map((item: LinkEntry, index: number) => {
                            return (
                                <Box key={index}>
                                    <Button component={RouteLink} to={item.target} className={cx(classes.linkButton)} target='_blank'>
                                        {item.label}
                                    </Button>
                                </Box>
                            )
                        })
                    }
                </Box>
            }
        </>
    );
}

export default LinkCollection;
