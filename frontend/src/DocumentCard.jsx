import styles from './modules/DocumentCard.module.css';
import { useNavigate } from 'react-router-dom';
import EllipsisVerticalSolid from './assets/svgs/ellipsis-vertical-solid-full.svg?react';
import TrashCanSolid from './assets/svgs/trash-can-solid-full.svg?react';
import DiamondTurnRightSolid from './assets/svgs/diamond-turn-right-solid-full.svg?react';
import PencilSolid from './assets/svgs/pencil-solid-full.svg?react';
import { useState } from 'react';
import axios from 'axios';

function DocumentCard({ title, documentId, modifiedAt, activeDocumentMenuId, setActiveDocumentMenuId, setUpdateDashboard}) {
    const navigate = useNavigate();
    const localDate = new Date(modifiedAt);

    const openDocument = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/updatemodifiedat/${documentId}`, null, { withCredentials: true });
            setUpdateDashboard(prev => prev += 1);
            navigate(`/document/${documentId}`);
            console.log(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <div 
            className={styles.container}
            onClick={openDocument}
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
                <EllipsisVerticalSolid 
                    className={styles.ellipsis}
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveDocumentMenuId(documentId !== activeDocumentMenuId ? documentId : '');
                    }}
                /> 
            </section>
            {activeDocumentMenuId === documentId && <div className={styles.documentContainer}>
                <DocumentCardMenu 
                    documentId={documentId} 
                    setUpdateDashboard={setUpdateDashboard} 
                />
            </div>}
        </div>
    );
}

function DocumentCardMenu({ documentId, setUpdateDashboard }) {
    const [activeRenameModal, setActiveRenameModal] = useState(false);

    const removeDocument = async () => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/private/removedocument/${documentId}`, { withCredentials: true });
            console.log(response.data);
            setUpdateDashboard(prev => prev += 1);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    const openDocumentInNewTab = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/updatemodifiedat/${documentId}`, null, { withCredentials: true });
            setUpdateDashboard(prev => prev += 1);
            console.log(response.data);
            window.open(`/document/${documentId}`, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <>
            <div 
                className={styles.documentMenu}
                onClick={(e) => e.stopPropagation()}
            >
                <section
                    className={styles.section1}
                    onClick={() => setActiveRenameModal(true)}    
                >
                    <PencilSolid className={styles.svg} />
                    <span>Rename</span>
                </section>
                <section
                    onClick={removeDocument}
                >
                    <TrashCanSolid className={styles.svg} />
                    <span>Remove</span>
                </section>
                <section
                    className={styles.section3}
                    onClick={openDocumentInNewTab}
                >
                    <DiamondTurnRightSolid className={styles.svg} />
                    <span>Open in new tab</span>
                </section>
            </div>
            {activeRenameModal && <RenameModal 
                setActiveRenameModal={setActiveRenameModal} 
                documentId={documentId}
                setUpdateDashboard={setUpdateDashboard}
            />}
        </>
    );
}

function RenameModal({ setActiveRenameModal, documentId, setUpdateDashboard }) {
    const [newTitle, setNewTitle] = useState('');

    const renameDocument = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/renamedocument/${documentId}`, {
                newTitle: newTitle
            }, { withCredentials: true });
            console.log(response.data);
            setActiveRenameModal(false);
            setUpdateDashboard(prev => prev += 1);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <>
            <div 
                className={styles.dimmer}
                onClick={(e) => e.stopPropagation()}
            >    
            </div>
            <div 
                className={styles.renameModal}
                onClick={(e) => e.stopPropagation()}    
            >
                <h1>Rename document</h1>        
                <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <section>
                    <button onClick={() => {
                        setNewTitle('');
                        setActiveRenameModal(false);
                    }}>Cancel</button>
                    <button onClick={renameDocument}>Submit</button>
                </section>
            </div>
        </>
    );
}

export default DocumentCard;