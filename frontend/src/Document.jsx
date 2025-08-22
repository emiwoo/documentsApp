import { useCurrentEditor, EditorProvider, EditorContent } from '@tiptap/react';
import { TextStyleKit } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { useState, useRef, useEffect } from 'react';
import './modules/Document.css';
import styles from './modules/Document.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';

import ArrowLeftSolid from './assets/svgs/arrow-left-solid-full.svg?react';
import DownloadSolid from './assets/svgs/download-solid-full.svg?react';
import RotateLeftSolid from './assets/svgs/rotate-left-solid-full.svg?react';
import RotateRightSolid from './assets/svgs/rotate-right-solid-full.svg?react';
import AngleDownSolid from './assets/svgs/angle-down-solid-full.svg?react';
import MinusSolid from './assets/svgs/minus-solid-full.svg?react';
import PlusSolid from './assets/svgs/plus-solid-full.svg?react';
import UnderlineSolid from './assets/svgs/underline-solid-full.svg?react';
import BoldSolid from './assets/svgs/bold-solid-full.svg?react';
import ItalicSolid from './assets/svgs/italic-solid-full.svg?react';
import AngleUpSolid from './assets/svgs/angle-up-solid-full.svg?react';
import TrashCanSolid from './assets/svgs/trash-can-solid-full.svg?react';
import PencilSolid from './assets/svgs/pencil-solid-full.svg?react';

function Document() {
    const { documentId } = useParams();
    const [documentContent, setDocumentContent] = useState(null);
    const navigate = useNavigate();
    
    const verifyInitialAccess = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/verifyinitialaccess`, { withCredentials: true });
            console.log(response.data);
        } catch (error) {
            console.error(error.response.data);
            navigate('/');
        }
    }

    const loadDocumentContent = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/loaddocumentcontent/${documentId}`, { withCredentials: true });
            setDocumentContent(response.data.body);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    useEffect(() => {
        verifyInitialAccess();
        loadDocumentContent();
    }, []);

    return (
        <>
            {documentContent && (<EditorProvider
                extensions={[StarterKit, TextStyleKit]}
                content={documentContent}
            >
                <Editor />
            </EditorProvider>)}
        </>
    );
}

function Editor() {
    const [activeMenus, setActiveMenus] = useState(null);
    const { editor } = useCurrentEditor();
    const { documentId } = useParams();
    const timeout = useRef(null);

    const autoSave = () => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(async () => {
            try {
                const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/autosavedocument/${documentId}`, {
                    body: editor.getJSON()
                }, { withCredentials: true });
                console.log(response.data);
            } catch (error) {
                console.error(error.response.data);
            }
        }, 2000);
    }

    useEffect(() => {
        editor.on('update', autoSave);
        return () => {
            editor.off('update', autoSave);
        }
    }, [editor]);

    return (
        <>
            <div className={`${styles.toolbarContainer} ${activeMenus !== null ? (activeMenus ? styles.toolbarSlideIn : styles.toolbarSlideOut) : ''}`}>
                <Toolbar />
            </div>
            <div className={`${styles.menuContainer} ${activeMenus !== null ? (activeMenus ? styles.menuSlideIn : styles.menuSlideOut) : ''}`}>
                <DocumentMenu />
            </div>
            {!activeMenus && 
                <AngleDownSolid 
                    className={styles.toggleMenuButton}
                    onClick={() => {
                        setActiveMenus(true);
                        editor.chain().focus().run();
                    }}
            />}
            {activeMenus &&
                <AngleUpSolid 
                    className={styles.toggleMenuButton}
                    onClick={() => {
                        setActiveMenus(false);
                        editor.chain().focus().run();
                    }}
            />}
            <EditorContent />
        </>
    );
}

function Toolbar() {
    const [fontSize, setFontSize] = useState(16);
    const { editor } = useCurrentEditor();
    const [activeIcon, setActiveIcon] = useState({
        activeBold: false,
        activeItalic: false,
        activeUnderline: false
    });
    const [activeFont, setActiveFont] = useState('Inter');
    const [activeFontMenu, setActiveFontMenu] = useState(false);
    const [activeTextType, setActiveTextType] = useState('Paragraph');
    const [activeTextTypeMenu, setActiveTextTypeMenu] = useState(false);

    useEffect(() => {
        if (!/^\d+$/.test(fontSize)) return;
        if (editor.isDestroyed) return;

        const number = Number(fontSize);
        setFontSize(number);
        if (number > 96 || number < 8) return;

        const { from, to } = editor.state.selection;
        editor
            .chain()
            .focus()
            .setTextSelection({ from: from, to: to })
            .setFontSize(`${number}px`)
            .run();
    }, [fontSize, editor]);

    const findCurrentFontSize = () => {
        if (!editor.isActive('paragraph')) return;
        if (editor.state.selection.from === 1 && editor.state.selection.to === 1) return;
        const currentFontSize = editor.getAttributes('textStyle').fontSize;
        if (!currentFontSize) return;
        setFontSize(Number(currentFontSize.slice(0, -2)));
    }

    const findCurrentMarks = () => {
        setActiveIcon({
            activeBold: editor.isActive('bold'),
            activeItalic: editor.isActive('italic'),
            activeUnderline: editor.isActive('underline')
        });
    }

    const findCurrentFontFamily = () => {
        const currentFontFamily = editor.getAttributes('textStyle').fontFamily;
        setActiveFont(currentFontFamily);
    }

    const findCurrentTextType = () => {
        if (editor.isActive('heading', { level: 1 })) {
            setActiveTextType('Heading 1');
        } else if (editor.isActive('heading', { level: 2 })) {
            setActiveTextType('Heading 2');
        } else if (editor.isActive('heading', { level: 3 })) {
            setActiveTextType('Heading 3');
        } else if (editor.isActive('paragraph')) {
            setActiveTextType('Paragraph');
        }
    }

    useEffect(() => {
        if (editor.isDestroyed) return;

        editor
            .chain()
            .focus('end')
            .run();

        editor.on('selectionUpdate', () => {
            findCurrentMarks();
            findCurrentFontSize();
            findCurrentFontFamily();
            findCurrentTextType();
        });

        findCurrentMarks();
        findCurrentFontSize();
        findCurrentFontFamily();
        findCurrentTextType();

        return () => {
            editor.off('selectionUpdate', () => {
                findCurrentMarks();
            });
        }
    }, [editor]);

    const fonts = ['Inter', 'Merriweather', 'Montserrat', 'Open Sans', 'Roboto'];
    const types = ['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph'];

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(editor.getText(), 10, 10);
        doc.save('document.pdf');
    }

    return (
        <>
            <article className={styles.toolbar}>
                <section onClick={downloadPDF}>
                    <DownloadSolid className={styles.icon} />
                </section>
                <section>
                    <RotateLeftSolid 
                        className={styles.icon} 
                        onClick={() => 
                            editor
                            .chain()
                            .focus()
                            .undo()
                            .run()
                        }
                    />
                    <RotateRightSolid 
                        className={styles.icon} 
                        onClick={() => 
                            editor
                                .chain()
                                .focus()
                                .redo()
                                .run()
                            }
                    />
                </section>
                <section>
                    <article onClick={() => setActiveTextTypeMenu(!activeTextTypeMenu)}>
                        <p className={styles.selectedTextType}>{activeTextType}</p>
                        <AngleDownSolid className={styles.angleDownSolid} />
                    </article>
                    {activeTextTypeMenu && <div className={`${styles.list} ${styles.typeList}`}>
                        {types.map(type => <p
                            key={type}
                            className={activeTextType === type ? styles.activeFont : ''}
                            onClick={() => {
                                setActiveTextType(type);
                                if (type.includes('Heading')) {
                                    editor
                                        .chain()
                                        .focus()
                                        .unsetFontSize()
                                        .setHeading({ level: Number(type.slice(8, 9)) })
                                        .run();
                                    return;
                                }
                                if (type.includes('Paragraph')) {
                                    editor
                                        .chain()
                                        .focus()
                                        .setParagraph()
                                        .run();
                                    return;
                                }
                            }}
                        >{type}</p>)}
                    </div>}
                </section>
                <section>
                    <article onClick={() => setActiveFontMenu(!activeFontMenu)}>
                        <p className={styles.selectedFont}>{activeFont}</p>
                        <AngleDownSolid className={styles.angleDownSolid} />
                    </article>
                    {activeFontMenu && <div className={`${styles.list} ${styles.fontList}`}>
                        {fonts.map(font => <p 
                            key={font} 
                            className={activeFont === font ? styles.activeFont : ''}
                            onClick={() => {
                                editor
                                    .chain()
                                    .focus()
                                    .setFontFamily(font)
                                    .run();
                                setActiveFont(font);
                            }}
                        >{font}</p>)}
                    </div>}
                </section>
                <section>
                    <MinusSolid 
                        className={styles.icon}
                        onClick={() => setFontSize(prev => {
                            if (prev === 8) return 8; 
                            return prev -= 1;
                        })}
                    />
                    <input 
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                    />
                    <PlusSolid 
                        className={styles.icon}
                        onClick={() => setFontSize(prev => {
                            if (prev === 92) return 92;
                            return prev += 1;
                        })}
                    />
                </section>
                <section className={styles.removeBorder}>
                    <BoldSolid 
                        className={`${styles.icon} ${activeIcon.activeBold ? styles.iconActive : ''}`} 
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleBold()
                                .run();
                            setActiveIcon(prev => ({...prev, activeBold: !activeIcon.activeBold}));
                        }}
                    />
                    <ItalicSolid 
                        className={`${styles.icon} ${activeIcon.activeItalic ? styles.iconActive : ''}`} 
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleItalic()
                                .run();
                            setActiveIcon(prev => ({...prev, activeItalic: !activeIcon.activeItalic}));
                        }}
                    />
                    <UnderlineSolid 
                        className={`${styles.icon} ${activeIcon.activeUnderline ? styles.iconActive : ''}`} 
                        onClick={() => {
                            editor
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                            setActiveIcon(prev => ({...prev, activeUnderline: !activeIcon.activeUnderline}));
                        }}
                    />
                </section>
            </article>
        </>
    );
}

function DocumentMenu() {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const [activeRenameModal, setActiveRenameModal] = useState(false);

    const removeDocument = async () => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/private/removedocument/${documentId}`, { withCredentials: true });
            console.log(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <>
            <div className={styles.menu}>
                <section 
                    className={styles.section1}
                    onClick={() => {
                        setActiveRenameModal(true);
                    }}
                >
                    <PencilSolid className={styles.section1Svg} />
                    <span>Rename</span>
                </section>
                <section onClick={removeDocument}>
                    <TrashCanSolid className={styles.section2Svg} />
                    <span>Remove</span>
                </section>
                <section 
                    onClick={() => navigate('/dashboard')}
                    className={styles.section3}
                >
                    <ArrowLeftSolid className={styles.section3Svg} />
                    <span>Go back</span>
                </section>
            </div>
            {activeRenameModal && <RenameModal 
                setActiveRenameModal={setActiveRenameModal} 
                documentId={documentId}
            />}
        </>
    );
}

function RenameModal({ setActiveRenameModal, documentId }) {
    const [newTitle, setNewTitle] = useState('');

    const renameDocument = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/renamedocument/${documentId}`, {
                newTitle: newTitle
            }, { withCredentials: true });
            console.log(response.data);
            setActiveRenameModal(false);
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


export default Document;