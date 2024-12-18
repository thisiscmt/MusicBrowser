import {FC, RefObject} from 'react';


interface HomeProps {
    topOfPageRef: RefObject<HTMLElement>;
}

const Home: FC<HomeProps> = ({ topOfPageRef }) => {
    const cmt = '123';

    return <div>Music Browser</div>
}

export default Home;
