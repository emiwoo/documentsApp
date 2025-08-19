import { useCurrentEditor, EditorProvider, EditorContent } from '@tiptap/react';
import { TextStyleKit } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { useState, useRef, useEffect } from 'react';
import './modules/Document.css';
import styles from './modules/Document.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
    const { documentid } = useParams();
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
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/loaddocumentcontent/${documentid}`, { withCredentials: true });
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
    const [activeMenus, setActiveMenus] = useState(false);
    const { editor } = useCurrentEditor();
    const { documentid } = useParams();
    const timeout = useRef(null);


    const autoSave = () => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(async () => {
            try {
                const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/autosavedocument/${documentid}`, {
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
            <div className={`${styles.toolbarContainer} ${activeMenus ? styles.toolbarSlideIn : styles.toolbarSlideOut}`}>
                <Toolbar />
            </div>
            <div className={`${styles.menuContainer} ${activeMenus ? styles.menuSlideIn : styles.menuSlideOut}`}>
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
    const [activeFont, setActiveFont] = useState('');
    const [activeFontMenu, setActiveFontMenu] = useState(false);
    const [activeTextType, setActiveTextType] = useState('');
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
        const currentFontSize = editor.getAttributes('textStyle').fontSize;
        console.log(currentFontSize);
        setFontSize(Number(currentFontSize.slice(0, -2)));
    }

    const findCurrentMarks = () => {
        setActiveIcon(prev => ({...prev, activeBold: editor.isActive('bold')}));
        setActiveIcon(prev => ({...prev, activeItalic: editor.isActive('italic')}));
        setActiveIcon(prev => ({...prev, activeUnderline: editor.isActive('underline')}));
    }

    const findCurrentFontFamily = () => {
        const currentFontFamily = editor.getAttributes('textStyle').fontFamily;
        console.log(currentFontFamily);
        setActiveFont(currentFontFamily);
    }

    useEffect(() => {
        if (editor.isDestroyed) return;

        editor
            .chain()
            .focus('end')
            .run();

        editor.on('selectionUpdate', () => {
            findCurrentFontSize();
            findCurrentMarks();
            findCurrentFontFamily();
        });
        
        if (editor.state.selection.empty) return;

        findCurrentFontSize();
        findCurrentMarks();
        findCurrentFontFamily();

        return () => {
            editor.off('selectionUpdate', () => {
                findCurrentFontSize();
                findCurrentMarks();
            });
        }
    }, [editor]);

    const fonts = ['Inter', 'Merriweather', 'Montserrat', 'Open Sans', 'Roboto'];
    const types = ['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph'];

    return (
        <>
            <article className={styles.toolbar}>
                <section>
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
                        <p className={styles.selectedTextType}>Paragraph</p>
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

    return (
        <div className={styles.menu}>
            <section className={styles.section1}>
                <PencilSolid className={styles.section1Svg} />
                <span>Rename</span>
            </section>
            <section>
                <TrashCanSolid className={styles.section2Svg} />
                <span>Remove</span>
            </section>
            <section className={styles.section3}>
                <ArrowLeftSolid className={styles.section3Svg} />
                <span>Go back</span>
            </section>
        </div>
    );
}

export default Document;