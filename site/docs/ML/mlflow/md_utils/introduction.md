# Introduction
# MLOps: Why tools like MLflow exist

- **MLOps (Machine Learning Operations)** brings DevOps principles to ML i.e. continuous integration, continuous delivery, continuous training, and continuous monitoring.
- In a typical ML project, *modeling* (code + training) is only one part.
  The “Ops” side covers deployment, observability, maintenance and
  continuous improvement.
- MLOps aims to **standardize and streamline the ML lifecycle** so teams
  can ship models reliably, not just train them once on a laptop.
- MLFlow is a tool based on the concept of MLOps
  


---

## Traditional ML lifecycle

- Data ingestion (more and better data → better models)
- Data preparation (iterative)
  - Feature engineering  
  - Cleaning  
  - Normalization / scaling  
- Modeling (iterative)
  - Model selection  
  - Model training  
  - Model validation  
- Model deployment  
- Monitoring performance in production (e.g. data drift)  
- Retraining / continuous improvement  

---

## Practical challenges in the ML lifecycle

In real projects, several issues show up quickly:

- **Local-only development**  
  - Models are trained only on a developer’s machine → hard to scale,
    hard to reproduce elsewhere.
- **Environment drift**  
  - The same code behaves differently across machines, environments, or
    versions of libraries.
  - Dependency conflicts are common.
- **Experiment explosion**  
  - You can easily generate many versions of the “same” model just by
    changing data, features, or hyperparameters.
  - Without proper versioning, rolling back to “the model from last
    week that worked better” is painful.
- **Manual, ad‑hoc tracking**  
  - Experiments tracked via file names, spreadsheets, screenshots, or
    manual notes.
  - No single source of truth for parameters, metrics, and artifacts.
- **Manual monitoring and feedback loops**  
  - Performance in production is checked manually.
  - There is no automated trigger for retraining when data or model
    performance drifts.
- **Lack of standardization**  
  - Each project structures code, logging, and deployment differently.
  - Hard to onboard new team members and scale best practices.

These are exactly the kinds of problems that MLOps – and MLflow in
particular – try to solve.

---

## What is MLflow?

- **MLflow** is an open‑source platform created by Databricks to manage
  the **end‑to‑end ML lifecycle**.
- It helps with:
  - Tracking experiments
  - Comparing experiments  
  - Packaging code in a reproducible way  
  - Packaging and serving models consistently  
  - Managing model versions and deployment stages  
- It is:
  - **Language‑agnostic** – works with Python, R, Java, etc.  
  - **Framework‑agnostic** – integrates with TensorFlow, Keras,
    PyTorch, scikit‑learn, Spark ML, and more.  
  - **Environment‑flexible** – can run locally, in Conda/virtualenv,
    Docker, or cloud environments.
- To use MLflow, you add small snippets of code to your ML pipeline to
  log what matters (or enable autologging).

---

## MLflow components (high level)

Each MLflow component addresses a specific part of the ML lifecycle:

1. **[MLflow Tracking](./mlflow_tracking.md)**  
   - Log and compare experiments (parameters, metrics, artifacts, code
     versions, etc.).
2. **[MLflow Projects](./mlflow_projects.md)**  
   - Standardize how ML code, environments and entry points are defined
     so experiments are reproducible.
3. **[MLflow Models](./mlflow_model.md)**  
   - Package trained models in a standard format with multiple “flavors”
     so they can be served in different environments.
4. **[MLflow Model Registry](./mlflow_registry.md)**  
   - Central place to manage model versions and their lifecycle stages
     (e.g. Staging, Production, Archived).


