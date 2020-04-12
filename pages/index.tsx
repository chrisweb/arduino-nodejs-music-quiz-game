import { NextPage } from 'next';
import Link from 'next/link';

import { IMainLayoutProps, MainLayout } from '../components/layout/main';

const Index: NextPage<IMainLayoutProps> = () => (
    <MainLayout>
        <h1>Music Quiz Game</h1>
        <nav>
            <Link href="/gamemaster">
                <a target="_blank">Gamemaster screen</a>
            </Link>
            <Link href="/player">
                <a target="_blank">Player screen</a>
            </Link>
        </nav>
    </MainLayout>
);

// Index.getInitialProps = async () => {

// };

export default Index;
