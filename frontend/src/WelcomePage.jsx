import styles from './modules/WelcomePage.module.css';
import { Link } from 'react-router-dom';

function WelcomePage() {
    return (
        <>
            <div>
                <nav className={`${styles.navBar} ${styles.marginApplyHeaderAndFooter}`}>
                    <img src='turkey.png' className={styles.turkeyImage} />
                    <ul>
                        <a href='#features'>Features</a>
                        <a href='#pricing'>Pricing</a>
                        <a href='#about'>About</a>
                        <Link to='/login' className={styles.loginButton}>Log in</Link>
                    </ul>
                </nav>
                <article className={styles.header}>
                    <video autoPlay muted loop>
                            <source src='video.mp4' type='video/mp4' />
                    </video>
                    <h1>TurkeyType</h1>
                    <p>No distractions. Just type.</p>
                    <Link to='/register' className={styles.registerButton}>Start writing for free</Link>
                </article>
                <article id='features'className={styles.featuresSection}>
                    <div className={styles.featuresSectionContainer}>
                        <div>
                            <h1>Features</h1>
                            <p>Create a doc. Select your font. Pick your font size. Type.</p>
                            <p>That's it. That's the point. Just type.</p>
                        </div>
                        <img src='turkey.png' className={styles.featuresImage} />
                    </div>
                </article>
                <article id='pricing' className={styles.pricingSection}>
                    <div className={styles.pricingSectionContainer}>
                        <h1>Pricing</h1>
                        <div className={styles.pricingSectionCardContainer}>
                            <section className={styles.pricingCard}>
                                <h1>Free</h1>
                                <h2>$0.00 /mo</h2>
                                <p>✓ 5 docs</p>
                            </section>
                            <section className={styles.pricingCard}>
                                <div className={styles.paidCardHeader}>
                                    <h1>Paid</h1>
                                    <h4>Save 20%</h4>
                                </div>
                                <div className={styles.priceCardHeader}>
                                    <h2>$3.99 /mo</h2>
                                    <h3>$4.99 /mo</h3>
                                </div>
                                <p>✓ Unlimited docs</p>
                                <p>✓ Themes</p>
                                <p>✓ Ambient music</p>
                            </section>
                        </div>
                    </div>
                </article>
                <article id='about' className={styles.aboutSection}>
                    <div className={styles.aboutSectionContainer}>
                        <img src='turkey.png' className={styles.aboutImage} />
                        <div>
                            <h1>About</h1>
                            <p>TurkeyType is aimed to be a simple, minimalistic text editor that erases all distractions. It works to let you just <i>type</i>. No distracting formatting options, no funky buttons to click, no obtrusive toolbars. Just you and the page. Just type.</p>
                        </div>
                    </div>
                </article>
                <footer className={styles.footer}>
                    <p>Peter Tran @ 2025</p>
                </footer>
            </div>
        </>
    );
}

export default WelcomePage;