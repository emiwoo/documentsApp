import styles from './modules/Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import EyeSlashSolid from './assets/svgs/eye-slash-solid-full.svg?react';
import EyeSolid from './assets/svgs/eye-solid-full.svg?react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const loginUser = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
                email: email,
                password: password
            }, { withCredentials: true });
            console.log(response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error(error.response.data);
            setError('Invalid login');
        }
    }

    return (
        <div className={styles.registerModule}>
            <label>Email address</label>
            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />
            <label>Password</label>
            <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={passwordVisibility ? 'text' : 'password'}
            />
            {!passwordVisibility && <EyeSolid 
                className={styles.eye}
                onClick={() => setPasswordVisibility(true)}
            />}
            {passwordVisibility && <EyeSlashSolid 
                className={styles.eye}
                onClick={() => setPasswordVisibility(false)}
            />}
            {error !== '' && <p className={styles.loginError}><i>{error}</i></p>}
            <button 
                className={(email !== '' && password !== '') ? styles.enabledButton : ''}
                onClick={loginUser}>Login</button>
            <Link to='/register' className={styles.loginHereText}>Don't have an account? Register here</Link>
        </div>
    );
}

export default Login;