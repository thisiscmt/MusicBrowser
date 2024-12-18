import { FC, RefObject } from 'react';
import { Box } from '@mui/material';

interface HomeProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const Home: FC<HomeProps> = ({ topOfPageRef }) => {

    return (
        <Box>
            Music Browser
        </Box>
    );
}

export default Home;
