import styles from './modules/CreateDocumentCard.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PlusSolid from './assets/svgs/plus-solid-full.svg?react';

function CreateDocumentCard() {
    const navigate = useNavigate();

    const createDocument = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/private/createdocument`, null, { withCredentials: true });
            navigate(`/document/${response.data.doc_id}`);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <div 
            className={styles.container}
            onClick={createDocument} 
        >
            <PlusSolid className={styles.plusSolid} />
        </div>
    );
}

export default CreateDocumentCard;