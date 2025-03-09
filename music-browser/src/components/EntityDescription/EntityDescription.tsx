import React, { FC, useState } from 'react';
import { Link, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import * as SharedService from '../../services/sharedService.ts';

const useStyles = tss.create(() => ({
    entityDesc: {
        marginBottom: '12px',
        whiteSpace: 'pre-wrap'
    },

    hideFullDesc: {
        height: 0,
        marginBottom: 0,
        opacity: 0
    },

    showFullDesc: {
        height: 'auto',
        marginBottom: '12px',
        opacity: 1,
        transition: 'opacity 0.5s linear',
        whiteSpace: 'pre-wrap'
    }
}));

interface EntityDescriptionProps {
    entityDesc: string
}

const EntityDescription: FC<EntityDescriptionProps> = (props: EntityDescriptionProps) => {
    const { classes, cx } = useStyles();
    const [ showFullDesc, setShowFullDesc ] = useState<boolean>(false);

    const handleShowFullDesc = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setShowFullDesc(!showFullDesc);
    };

    const desc = SharedService.getEntityDescription(props.entityDesc);

    return (
        <>
            {
                desc.short &&
                <Typography variant='body2' className={cx(classes.entityDesc)}>
                    {desc.short}

                    {
                        desc.hasFullDesc && !showFullDesc &&
                        <>
                            &nbsp;
                            <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show more)</Link>
                        </>
                    }
                </Typography>
            }

            <Typography variant='body2' className={showFullDesc ? cx(classes.showFullDesc) : cx(classes.hideFullDesc)}>
                {desc.full}
                &nbsp;
                <Link href='#' onClick={handleShowFullDesc} className='app-link'>(show less)</Link>
            </Typography>
        </>
    );
}

export default EntityDescription;
