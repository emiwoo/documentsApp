import styles from './modules/AccountSettings.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AccountSettings() {
    const [disabledEmail, setDisabledEmail] = useState(true);
    const [disabledPassword, setDisabledPassword] = useState(true);
    const navigate = useNavigate();
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [accountInfo, setAccountInfo] = useState({
        email: '',
        is_verified: false,
        tier: ''
    });
    const [emailErrors, setEmailErrors] = useState('');
    const [password, setPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');

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
            setVerificationCode('');
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

    const verifyAccount = async () => {
        setIsVerifying(true);
        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/private/verifyaccount`, null, { withCredentials: true });
            console.log(response.data);
        } catch (error) {
            console.error(error.response.data);
        }
    }

    const submitVerificationCode = async () => {
        setVerificationError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/private/submitverificationcode`, {
                verificationCode: verificationCode
            }, { withCredentials: true });
            console.log(response.data);
            getAccountInformation();
            setIsVerifying(false);
        } catch (error) {
            console.error(error.response.data);
            setVerificationError('Invalid code');
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
                <img 
                    src='arrow-left-solid-full.svg' 
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
                {!passwordVisibility && !disabledPassword && <img
                    src='eye-solid-full.svg'
                    onClick={() => setPasswordVisibility(true)}
                />}
                {passwordVisibility && !disabledPassword && <img
                    src='eye-slash-solid-full.svg'
                    onClick={() => setPasswordVisibility(false)}
                />}
            </section>
            <section className={styles.tier}>
                <p>Current tier:</p>
                {accountInfo.tier === 'free' && <span>FREE</span>}
                {accountInfo.tier === 'paid' && <span>PAID</span>}
                <button>Upgrade</button>
            </section>
            <section className={`${styles.tier} ${styles.verify}`}>
                <p>Verified status:</p>
                {accountInfo.is_verified && <span className={styles.verifiedAccount}>VERIFIED</span>}
                {!accountInfo.is_verified && <span>NOT VERIFIED</span>}
                {!accountInfo.is_verified && <button onClick={verifyAccount}>{isVerifying ? 'Resend code' : 'Verify'}</button>}
            </section>
            {isVerifying && !accountInfo.is_verified && <section className={styles.verifyBanner}>
                <p>Check your email for the verification code</p>
                <div>
                    <input 
                        placeholder='Enter code'
                        onChange={(e) => setVerificationCode(e.target.value)}
                        value={verificationCode}
                    /><button onClick={submitVerificationCode}>Submit</button>
                </div>
                {verificationError !== '' && <p className={styles.codeError}>{verificationError}</p>}
            </section>}
        </div>
    );
}

export default AccountSettings;