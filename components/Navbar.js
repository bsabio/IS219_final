import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            <span className={styles.highlight}>BS</span>Portfolio
          </Link>
          
          <button 
            className={styles.menuButton} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span className={styles.menuIcon}></span>
          </button>
          
          <ul className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <li>
              <Link href="/" className={styles.navLink}>Home</Link>
            </li>
            <li>
              <Link href="#about" className={styles.navLink}>About</Link>
            </li>
            <li>
              <Link href="#projects" className={styles.navLink}>Projects</Link>
            </li>
            <li>
              <Link href="#contact" className={styles.navLink}>Contact</Link>
            </li>
            <li>
              <Link href="#resume" className={`${styles.navLink} ${styles.highlight}`}>Resume</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}