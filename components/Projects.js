import styles from './Projects.module.css';

export default function Projects() {
  // Sample project data - in a real application, this could come from an API or CMS
  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'A full-featured online store with product catalog, shopping cart, and secure checkout.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      image: '/projects/ecommerce.jpg',
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A productivity application for teams to organize projects, assign tasks, and track progress.',
      tags: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind CSS'],
      image: '/projects/taskapp.jpg',
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      id: 3,
      title: 'Fitness Tracker',
      description: 'Mobile application for tracking workouts, nutrition, and health metrics with visualization.',
      tags: ['React Native', 'GraphQL', 'Apollo Client', 'D3.js'],
      image: '/projects/fitness.jpg',
      demoUrl: '#',
      githubUrl: '#'
    },
    {
      id: 4,
      title: 'Weather Dashboard',
      description: 'Real-time weather monitoring application with forecast data and interactive maps.',
      tags: ['JavaScript', 'OpenWeather API', 'Chart.js', 'Leaflet'],
      image: '/projects/weather.jpg',
      demoUrl: '#',
      githubUrl: '#'
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
                    <a href={project.demoUrl} className={styles.actionBtn} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                    <a href={project.githubUrl} className={styles.actionBtn} target="_blank" rel="noopener noreferrer">
                      View Code
                    </a>
                  </div>
                </div>
                <div className={styles.imagePlaceholder}>
                  {/* In a real project, you would use an actual image here */}
                  <div className={styles.placeholderText}>{project.title[0]}</div>
                </div>
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
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.ctaButton}>
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
}