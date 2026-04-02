import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroBackdrop} />
      <div className="container">
        <div className={styles.heroContent}>
          {/* <p className={styles.heroKicker}>Open notes. Practical guides. Growing library.</p> */}
          <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
            {siteConfig.title}
          </Heading>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          A public knowledgebase of notes, notebooks, practical guides, and implementation details across the topics I explore. This evolving collection serves as both a personal reference for future learning and a shared resource for anyone interested in similar subjects. 
          </p>
          <div className={styles.heroMeta}>
            <span>Open Notes</span>
            <span>Practical Guides</span>
            <span>Growing Library</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Explore the docs
          </Link>
          <Link
            className={clsx('button button--outline button--lg', styles.secondaryButton)}
            to="https://github.com/Ritu-malage/knowlegebase">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A public knowledge base of notes, notebooks, implementation details, and practical guides across evolving technical topics.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
