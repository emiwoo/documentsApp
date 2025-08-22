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
    const [activeMenu, setActiveMenu] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [activeDocumentMenuId, setActiveDocumentMenuId] = useState('');
    const [updateDashboard, setUpdateDashboard] = useState(0);
    const [activeTrashMenu, setActiveTrashMenu] = useState('');

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
                onClick={() => setActiveMenu(() => {
                    if (activeMenu === false) return true;
                    if (activeMenu === true) return false;
                    if (activeMenu === null) return true;
                })}
            />
            <div className={`${styles.menuContainer} ${activeMenu !== null ? (activeMenu ? styles.slideIn : styles.slideOut) : ''}`}>
                <Menu setActiveTrashMenu={setActiveTrashMenu} />
            </div>
            {activeTrashMenu && <>
                <div className={styles.dimmer}></div>
                <Trash 
                    setActiveTrashMenu={setActiveTrashMenu}
                    setUpdateDashboard={setUpdateDashboard}
                />
            </>}
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

function Menu({ setActiveTrashMenu }) {
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
            <section onClick={() => setActiveTrashMenu(true)}>
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

function Trash({ setActiveTrashMenu, setUpdateDashboard }) {
    const [trashedDocuments, setTrashedDocuments] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const loadTrashedDocuments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/loadtrasheddocuments`, { withCredentials: true });
            setTrashedDocuments(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    const recoverDocuments = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/recoverdocuments`, {
                documentIds: selectedDocuments }, { withCredentials: true });
            console.log(response.data);
            loadTrashedDocuments();
            setUpdateDashboard(prev => prev += 1);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    const permanentlyDeleteDocuments = async () => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/private/deletedocuments`, { 
                data: { documentIds: selectedDocuments },    
                withCredentials: true 
            });
            console.log(response.data);
            loadTrashedDocuments();
        } catch (error) {
            console.error(error.response.data);
        }
    }

    useEffect(() => {
        loadTrashedDocuments();
    }, []);

    return (
        <div className={styles.trashMenu}>
            <h1>Trash</h1>
            <section>
                {trashedDocuments.map(trashedDocument => 
                    <DocumentTrashCard
                        key={trashedDocument.id}
                        title={trashedDocument.title}
                        modifiedAt={trashedDocument.modified_at}
                        setSelectedDocuments={setSelectedDocuments}
                        documentId={trashedDocument.doc_id}
                    />
                )}
            </section>
            <div className={styles.trashMenuButtons}>
                <button onClick={() => setActiveTrashMenu(false)}>Cancel</button>
                <button onClick={recoverDocuments}>Recover</button>
                <button onClick={permanentlyDeleteDocuments}>Permanently delete</button>
            </div>
        </div>
    );
}

function DocumentTrashCard({ title, modifiedAt, setSelectedDocuments, documentId } ) {
    const [selected, setSelected] = useState(false);
    const localDate = new Date(modifiedAt);

    return (
        <div 
            className={`${styles.container} ${selected ? styles.activelySelected : ''}`}
            onClick={() => {
                setSelected(!selected);
                if (!selected) setSelectedDocuments(prev => [...prev, documentId]);
                if (selected) setSelectedDocuments(prev => prev.filter(docId => docId !== documentId));
            }}
        >
            <section className={styles.imageContainer}>
                <img src='library.jpg' />
            </section>
            <section className={styles.textContainer}>
                <h1>{title}</h1>
                <p>Opened {localDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}</p>
            </section>
        </div>
    );
}

export default Dashboard;