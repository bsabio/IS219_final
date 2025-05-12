import styles from './Hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.content}>
            <h1 className={styles.title}>Hi, I'm <span className={styles.name}>Brandon Sabio</span></h1>
            <h2 className={styles.subtitle}>Full Stack Developer & Problem Solver</h2>
            <p className={styles.description}>
              I create impactful digital solutions that help businesses and individuals achieve their goals.
              With expertise in modern web technologies, I build applications that make a difference.
            </p>
            <div className={styles.cta}>
              <Link href="#projects" className={styles.primaryBtn}>View My Work</Link>
              <Link href="#contact" className={styles.secondaryBtn}>Contact Me</Link>
            </div>
          </div>
          <div className={styles.imageWrapper}>
            <img
              src="/May 11, 2025, 11_01_29 PM.png"
              alt="Brandon Sabio"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}