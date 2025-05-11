import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>Hi, I'm <span className={styles.name}>Brandon Sabio</span></h1>
          <h2 className={styles.subtitle}>Full Stack Developer & Problem Solver</h2>
          <p className={styles.description}>
            I create impactful digital solutions that help businesses and individuals achieve their goals.
            With expertise in modern web technologies, I build applications that make a difference.
          </p>
          <div className={styles.cta}>
            <button className={styles.primaryBtn}>View My Work</button>
            <button className={styles.secondaryBtn}>Contact Me</button>
          </div>
        </div>
      </div>
    </section>
  );
}