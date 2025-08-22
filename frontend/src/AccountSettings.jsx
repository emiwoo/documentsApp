import styles from './modules/AccountSettings.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowLeftSolid from './assets/svgs/arrow-left-solid-full.svg?react';
import EyeSlashSolid from './assets/svgs/eye-slash-solid-full.svg?react';
import EyeSolid from './assets/svgs/eye-solid-full.svg?react';

function AccountSettings() {
    const [disabledEmail, setDisabledEmail] = useState(true);
    const [disabledPassword, setDisabledPassword] = useState(true);
    const navigate = useNavigate();
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [accountInfo, setAccountInfo] = useState({
        email: '',
    });
    const [emailErrors, setEmailErrors] = useState('');
    const [password, setPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState('');

    const getAccountInformation = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/getaccountinformation`, { withCredentials: true });
            setAccountInfo(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    const changeEmail = async () => {
        try {
            setEmailErrors('');
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(accountInfo.email)) {
                setEmailErrors('Invalid email');
                return;
            }
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/changeemail`, {
                email: accountInfo.email }, { withCredentials: true });
            console.log(response.data);
            setDisabledEmail(true);
            getAccountInformation();
        } catch (error) {
            console.error(error.response.data);
            setEmailErrors(error.response.data.error);
        }
    }

    const cancelEmailChange = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/private/cancelemailchange`, { withCredentials: true });
            setAccountInfo(prev => ({
                ...prev,
                email: response.data.email
            }));
            setDisabledEmail(true);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    useEffect(() => {
        getAccountInformation();
    }, []);

    const changePassword = async () => {
        setPasswordErrors('');
        if (password.length < 4 || !/\d/.test(password) || !/[a-zA-Z]/.test(password) || !/[!@#$%^&*]/.test(password)) {
            setPasswordErrors('Must be longer than 4 characters, include at least one number, one letter, and one special character (!@#$%^&*)');
            return;
        }
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/changepassword`, {
                password: password
            }, { withCredentials: true });
            console.log(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ArrowLeftSolid 
                    width={45} 
                    height={45}
                    onClick={() => navigate('/dashboard')}    
                />
                <h1>Account settings</h1>
            </div>
            <section className={styles.userInfo}>
                <label>Email: </label>
                <input 
                    disabled={disabledEmail}
                    value={accountInfo.email}
                    onChange={(e) => setAccountInfo(prev => ({
                        ...prev,
                        email: e.target.value
                    }))}
                />
                {disabledEmail && <button onClick={() => setDisabledEmail(false)}>Change email</button>}
                {!disabledEmail && <button onClick={changeEmail}>Submit change</button>}
                {!disabledEmail && <button onClick={cancelEmailChange}>Cancel</button>}
                {emailErrors !== '' && <p><i>{emailErrors}</i></p>}
            </section>
            <section className={styles.userInfo}>
                <label>Password: </label>
                <input 
                    disabled={disabledPassword}
                    type={passwordVisibility ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
                {disabledPassword && <button onClick={() => setDisabledPassword(false)}>Change password</button>}
                {!disabledPassword && <button onClick={changePassword}>Submit change</button>}
                {!disabledPassword && <button onClick={() => {
                    setDisabledPassword(true);
                    setPassword('');
                }}>Cancel</button>}
                {passwordErrors !== '' && <p><i>{passwordErrors}</i></p>}
                {!passwordVisibility && !disabledPassword && <EyeSolid
                    className={styles.eye}
                    onClick={() => setPasswordVisibility(true)}
                />}
                {passwordVisibility && !disabledPassword && <EyeSlashSolid
                    className={styles.eye}
                    onClick={() => setPasswordVisibility(false)}
                />}
            </section>
        </div>
    );
}

export default AccountSettings;