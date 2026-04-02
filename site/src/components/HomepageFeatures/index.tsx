import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: string;
  to: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'AI / ML',
    description:
      'Notes and references across artificial intelligence, machine learning, and related areas.',
    to: '/docs/AI_ML/',
  },
  {
    title: 'MLFlow',
    description:
      'Practical notes on tracking, UI, logging, models, projects, registry, deployment, and implementation.',
    to: '/docs/AI_ML/mlflow/',
  },
];


function Feature({title, description, to}: FeatureItem) {
  return (
    <div className={clsx('col col--6 col--md-6', styles.featureColumn)}>
      <Link className={styles.featureCard} to={to}>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.description}>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionIntro}>
          <p className={styles.kicker}>Browse by topic</p>
          <p className={styles.sectionLead}>
            Start with a topic and jump straight into the notes
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className={styles.communityNote}>
          <div>
            <Heading as="h3">Notice something unclear or incorrect?</Heading>
            <p className={styles.communityText}>
              Your feedback is welcome! Please feel free to raise an issue on GitHub to help make this knowledgebase better.
            </p>
          </div>
          <Link
            className="button button--primary button--md"
            to="https://github.com/Ritu-malage/knowlegebase/issues">
            Open an issue
          </Link>
        </div>
      </div>
    </section>
  );
}
