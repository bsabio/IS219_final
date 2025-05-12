import styles from './About.module.css';

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>About Me</h2>
            <div className={styles.underline}></div>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.story}>
              <h3>My Journey</h3>
              <p>
                As a dedicated problem solver and coding enthusiast, I've always been drawn to challenges 
                that push me beyond my comfort zone. My journey began when I discovered how technology 
                could be used to create meaningful solutions that improve people's lives.
              </p>
              <p>
                With a background in computer science and years of hands-on experience, I've developed 
                a unique approach to software development that prioritizes clean code, user experience, 
                and business value. I believe in taking responsibility for my work and going above and 
                beyond to deliver exceptional results.
              </p>
              <p>
                When I'm not coding, you'll find me volunteering in tech education initiatives, helping 
                others discover their potential in the world of programming.
              </p>
            </div>
            
            <div className={styles.skills}>
              <h3>Skills & Expertise</h3>
              
              <div className={styles.skillCategories}>
                <div className={styles.skillCategory}>
                  <h4>Front-end</h4>
                  <ul>
                    <li>React.js / Next.js</li>
                    <li>JavaScript / TypeScript</li>
                    <li>HTML5 / CSS3</li>
                    <li>Responsive Design</li>
                    <li>UI/UX Principles</li>
                  </ul>
                </div>
                
                <div className={styles.skillCategory}>
                  <h4>Back-end</h4>
                  <ul>
                    <li>Node.js</li>
                    <li>Express</li>
                    <li>Python / Django</li>
                    <li>RESTful APIs</li>
                    <li>Database Design</li>
                  </ul>
                </div>
                
                <div className={styles.skillCategory}>
                  <h4>Other</h4>
                  <ul>
                    <li>Git / GitHub</li>
                    <li>Docker</li>
                    <li>Test-Driven Development</li>
                    <li>Database Management</li>
                    <li>Agile Methodologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.values}>
            <h3>My Mission & Values</h3>
            <div className={styles.valuesList}>
              <div className={styles.valueItem}>
                <div className={styles.valueIcon}>🎯</div>
                <h4>Excellence</h4>
                <p>Striving for the highest quality in everything I create</p>
              </div>
              
              <div className={styles.valueItem}>
                <div className={styles.valueIcon}>🤝</div>
                <h4>Collaboration</h4>
                <p>Building meaningful partnerships to achieve shared goals</p>
              </div>
              
              <div className={styles.valueItem}>
                <div className={styles.valueIcon}>💡</div>
                <h4>Innovation</h4>
                <p>Finding creative solutions to complex problems</p>
              </div>
              
              <div className={styles.valueItem}>
                <div className={styles.valueIcon}>🌱</div>
                <h4>Growth</h4>
                <p>Continuously learning and improving my craft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}