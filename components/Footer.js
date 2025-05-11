import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.logo}>
            <span className={styles.highlight}>BS</span>Portfolio
          </div>
          
          <div className={styles.quote}>
            "The only way to do great work is to love what you do." - Steve Jobs
          </div>
          
          <div className={styles.copyright}>
            &copy; {currentYear} Brandon Sabio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}