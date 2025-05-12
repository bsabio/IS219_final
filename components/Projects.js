import styles from './Projects.module.css';
import Link from 'next/link';

export default function Projects() {
  // Project data
  const projects = [
    {
      id: 1,
      title: 'Data Visualization Project',
      description: 'Interactive data visualization project showcasing advanced charting techniques and data analysis capabilities using modern web technologies.',
      tags: ['D3.js', 'JavaScript', 'Data Analysis', 'Visualization'],
      image: '/projects/data-visualization-image.svg',
      demoUrl: '/data-visualization',
      localProject: true,
      internalLink: true,
      githubUrl: 'https://github.com/bsabio/IS219_project1'
    },
    {
      id: 2,
      title: 'AI Streaming Chat with Groq',
      description: 'A real-time streaming chat application powered by Groq AI (Llama 3) with a customizable AI character persona, built using Server-Sent Events.',
      tags: ['Node.js', 'Express', 'Groq AI', 'Server-Sent Events'],
      image: '/projects/ai-chat.svg',
      demoUrl: '/project2/standalone-with-groq.html',
      localProject: true,
      internalLink: true,
      githubUrl: 'https://github.com/bsabio/IS219_final/tree/main/public/project2'
    },
    {
      id: 3,
      title: 'Productivity Goal Tracker',
      description: 'Interactive productivity tracker that visualizes your progress with a dynamic bar that responds to logged activities, helping you monitor and improve your productivity.',
      tags: ['JavaScript', 'CSS3', 'Local Storage', 'Interactive UI'],
      image: '/projects/productivity-tracker.svg',
      demoUrl: '/project3',
      localProject: true,
      internalLink: true,
      githubUrl: 'https://github.com/bsabio/IS219_final/tree/main/public/project3'
    }
  ];

  return (
    <section id="projects" className={styles.projects}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Projects</h2>
          <div className={styles.underline}></div>
          <p className={styles.subtitle}>
            Explore some of my recent work showcasing my skills and problem-solving approach.
          </p>
        </div>
        
        <div className={styles.grid}>
          {projects.map(project => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.imageContainer}>
                <div className={styles.overlay}>
                  <div className={styles.actions}>
                    {project.internalLink ? (
                      <Link href={project.demoUrl} className={styles.actionBtn}>
                        View Project
                      </Link>
                    ) : (
                      <a 
                        href={project.demoUrl} 
                        className={styles.actionBtn} 
                        target={project.localProject ? "_self" : "_blank"} 
                        rel="noopener noreferrer"
                      >
                        Live Demo
                      </a>
                    )}
                    <a 
                      href={project.githubUrl} 
                      className={styles.actionBtn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Code
                    </a>
                  </div>
                </div>
                {project.image.includes('.svg') ? (
                  <div className={styles.svgContainer}>
                    <img src={project.image} alt={project.title} className={styles.projectImage} />
                  </div>
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <div className={styles.placeholderText}>{project.title[0]}</div>
                  </div>
                )}
              </div>
              
              <div className={styles.content}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                
                <div className={styles.tags}>
                  {project.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.cta}>
          <p>Interested in seeing more of my work?</p>
          <a href="https://github.com/bsabio" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
}