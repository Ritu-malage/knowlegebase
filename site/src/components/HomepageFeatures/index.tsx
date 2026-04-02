import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: string;
  to: string;
  meta: string;
};

const FeatureList: FeatureItem[] = [
  // {
  //   title: 'AI / ML',
  //   description:
  //     'Notes and references across artificial intelligence, machine learning, and related areas.',
  //   to: '/docs/AI_ML/',
  //   meta: 'Top-level topic',
  // },
  {
    title: 'MLFlow',
    description:
      'Practical notes on tracking, UI, logging, models, projects, registry, deployment, and implementation.',
    to: '/docs/AI_ML/mlflow/',
    meta: 'MLFlow',
  },
];


function Feature({title, description, to, meta}: FeatureItem) {
  return (
    <div className={clsx('col col--3 col--md-6', styles.featureColumn)}>
      <Link className={styles.featureCard} to={to}>
        <p className={styles.cardMeta}>{meta}</p>
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
              Your feedback is welcome! If you find a something unclear or incorrect or an area that could be improved, please feel free to raise an issue on GitHub to help make this knowledgebase better.
            </p>
          </div>
          <Link
            className="button button--primary button--lg"
            to="https://github.com/Ritu-malage/knowlegebase/issues">
            Open an issue
          </Link>
        </div>
      </div>
    </section>
  );
}
