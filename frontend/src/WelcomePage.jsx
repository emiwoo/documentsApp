import styles from './modules/WelcomePage.module.css';
import { Link } from 'react-router-dom';

function WelcomePage() {
    return (
        <div className={styles.container}>
            <header>
                <img src='turkeytype.png' />
                <Link className={styles.loginButton}to='/login'>Log in</Link>
            </header>
            <main>
                <video src='video.mp4' autoPlay muted loop></video>
                <section>
                    <h1>TurkeyType</h1>
                    <h2>No distractions. Just type.</h2>
                    <p>A simple text editor aimed to let you just type. No distracting toolbar. No funky buttons to click. No themes to pick. Just a page and you. No excuses.</p>
                    <Link className={styles.registerButton} to='/register'>Start writing for free</Link>
                </section>
            </main>
        </div>
    );
}

export default WelcomePage;