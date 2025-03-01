import React, { FC } from 'react';
import { Box, Typography } from '@mui/material';
import { tss } from 'tss-react/mui';

import EntityDetails from '../EntityDetails/EntityDetails.tsx';
import { Member } from '../../models/models.ts';
import { EntityType } from '../../enums/enums.ts';

const useStyles = tss.create(() => ({
    entityContainer: {
        '& .entityDetail': {
            marginBottom: '6px',

            '&:last-child': {
                marginBottom: 0
            }
        }
    }
}));

interface GroupMembersProps {
    entities: Member[];
}

const GroupMembers: FC<GroupMembersProps> = (props: GroupMembersProps) => {
    const { classes, cx } = useStyles();

    return (
        <>
            {
                props.entities && props.entities.length === 0
                    ?
                        <Typography variant='body2'>No group members were found.</Typography>
                    :
                        <Box className={cx(classes.entityContainer)}>
                            {
                                props.entities?.map((item: Member) => {
                                    return (
                                        <Box key={item.id} className='entityDetail'>
                                            <EntityDetails id={item.id} name={item.name} entityType={EntityType.Artist} />
                                        </Box>
                                    );
                                })
                            }
                        </Box>
            }
       </>
    );
}

export default GroupMembers;
