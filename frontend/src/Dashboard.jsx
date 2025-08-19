import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DocumentCard from './DocumentCard.jsx';
import styles from './modules/Dashboard.module.css';
import CreateDocumentCard from './CreateDocumentCard.jsx';

import GearSolid from './assets/svgs/gear-solid-full.svg?react';
import ArrowRightFromBracketSolid from './assets/svgs/arrow-right-from-bracket-solid-full.svg?react';
import BarsSolid from './assets/svgs/bars-solid-full.svg?react';
import MagnifyingGlassSolid from './assets/svgs/magnifying-glass-solid-full.svg?react';
import TrashCanSolid from'./assets/svgs/trash-can-solid-full.svg?react';

function Dashboard() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [activeDocumentMenuId, setActiveDocumentMenuId] = useState('');
    const [updateDashboard, setUpdateDashboard] = useState(0);

    const verifyInitialAccess = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/verifyinitialaccess`, { withCredentials: true });
            console.log(response.data);
        } catch (error) {
            console.log(error.response.data);
            navigate('/');
        }
    }

    const loadDocuments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/loaddocuments`, { withCredentials: true });
            setDocuments(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    useEffect(() => {
        verifyInitialAccess();
        loadDocuments();
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [updateDashboard]);

    return (
        <>
            <SearchBar setDocuments={setDocuments} />
            <div className={styles.documentCardContainer}>
                <CreateDocumentCard />
                {documents.map(document => <DocumentCard 
                    key={document.id}
                    title={document.title}
                    documentId={document.doc_id}
                    modifiedAt={document.modified_at}
                    activeDocumentMenuId={activeDocumentMenuId}
                    setActiveDocumentMenuId={setActiveDocumentMenuId}
                    setUpdateDashboard={setUpdateDashboard}
                />)}
            </div>
            <BarsSolid
                className={styles.barsSvg}
                onClick={() => setActiveMenu(!activeMenu)}
            />
            <div className={`${styles.menuContainer} ${activeMenu ? styles.slideIn : styles.slideOut}`}>
                <Menu />
            </div>
        </>
    );
}

function SearchBar({ setDocuments }) {
    const [searchQuery, setSearchQuery] = useState('');

    const searchDashboard = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/searchdashboard?searchquery=${searchQuery}`, { withCredentials: true });
            setDocuments(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    useEffect(() => {
        searchDashboard();
    }, [searchQuery]);

    return (
        <div className={styles.searchBar}>
            <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassSolid className={styles.magnifyingGlass} />
        </div>
    );
}

function Menu() {
    const navigate = useNavigate();

    const logoutUser = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/logoutuser`, null, { withCredentials: true });
            console.log(response.data);
            navigate('/');
        } catch (error) {
            console.log(error.response.data);
        }
    }

    return (
        <div className={styles.menu}>
            <section 
                onClick={() => navigate('/accountsettings')}
                className={styles.section1}
            >
                <GearSolid className={styles.section1Svg} />
                <span>Account</span>
            </section>
            <section>
                <TrashCanSolid className={styles.section2Svg} />
                <span>Trash</span>
            </section>
            <section
                onClick={logoutUser}
                className={styles.section3}
            >
                <ArrowRightFromBracketSolid className={styles.section3Svg} />
                <span>Log out</span>
            </section>
        </div>
    );
}

export default Dashboard;