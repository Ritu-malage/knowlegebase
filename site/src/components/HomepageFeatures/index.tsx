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
    title: 'MLflow',
    description:
      'Notes on MLflow covering experiment tracking, UI usage, and logging practices. Includes references on managing models, organizing projects, working with the registry, and deployment strategies.',
    to: '/docs/ML/mlflow/',
  },
  {
    title: 'LangGraph',
    description:
      'Comprehensive notes on using LangGraph for Retrieval-Augmented Generation (RAG), chatbot development, and practical implementation strategies.',
    to: '/docs/gen_AI/langgraph/',
  },
  {
    title: 'Agentic AI',
    description:
      'Notes on Agentic AI covering its core ideas, how agents work in loops with tools, and practical uses for automation and problem-solving.',
    to: '/docs/gen_AI/agentic_ai/',
  }
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
