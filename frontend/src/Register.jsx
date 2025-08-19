import { useState, useEffect } from 'react';
import styles from './modules/Register.module.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const [emailErrors, setEmailErrors] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({
        length: false,
        number: false,
        letter: false,
        specialCharacter: false
    });

    const registerUser = async () => {
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            setEmailErrors('Invalid email');
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, {
                email: email,
                password: password
            }, { withCredentials: true });
            console.log(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error(error.response.data);
            if (error.response.data.error === 'Email already registered') setEmailErrors('Email already registered');
        }
    }

    useEffect(() => {
        const errors = {
            length: true,
            number: true,
            letter: true,
            specialCharacter: true
        }
        if (password.length < 4) errors.length = false;
        if (!/\d/.test(password)) errors.number = false;
        if (!/[a-zA-Z]/.test(password)) errors.letter = false;
        if (!/[!@#$%^&*]/.test(password)) errors.specialCharacter = false;
        setPasswordErrors(errors);
    }, [password]);

    return (
        <div className={styles.registerModule}>
            <label>Email address</label>
            <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailErrors === '' ? '' : styles.errorBorder}
            />
            {emailErrors !== '' && <p className={styles.usernameError}><i>{emailErrors}</i></p>}
            <label>Password</label>
            <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={passwordVisibility ? 'text' : 'password'}
            />
            {!passwordVisibility && <img 
                src='eye-solid-full.svg' 
                onClick={() => setPasswordVisibility(true)}
            />}
            {passwordVisibility && <img 
                src='eye-slash-solid-full.svg' 
                onClick={() => setPasswordVisibility(false)}
            />}
            <section className={styles.passwordErrorContainer}>
                <h1>Your password must contain:</h1>
                <p className={passwordErrors.length ? '' : styles.passwordError}>{!passwordErrors.length && <span>ㄨ</span>}{passwordErrors.length && <span>✓</span>} At least 4 characters</p>
                <p className={passwordErrors.number ? '' : styles.passwordError}>{!passwordErrors.number && <span>ㄨ</span>}{passwordErrors.number && <span>✓</span>} Number</p>
                <p className={passwordErrors.letter ? '' : styles.passwordError}>{!passwordErrors.letter && <span>ㄨ</span>}{passwordErrors.letter && <span>✓</span>} Letter</p>
                <p className={passwordErrors.specialCharacter ? '' : styles.passwordError}>{!passwordErrors.specialCharacter && <span>ㄨ</span>}{passwordErrors.specialCharacter && <span>✓</span>} Special character (e.g. !@#$%^&*)</p>
            </section>
            <button 
                className={(email !== '' && Object.values(passwordErrors).every(val => val === true)) ? styles.enabledButton : ''}
                onClick={registerUser}>Register</button>
            <Link to='/login' className={styles.loginHereText}>Have an account? Log in here</Link>
        </div>
    );
}

export default Register;