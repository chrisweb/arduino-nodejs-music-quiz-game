import { NextPage } from 'next';
import Link from 'next/link';

const Index: NextPage = () => (
    <>
        <h1>Gamemaster</h1>
        <nav>
            <Link href="/gamemaster/setup">
                <a>Setup new game</a>
            </Link>
        </nav>
    </>
);

export default Index;