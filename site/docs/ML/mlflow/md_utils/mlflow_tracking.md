# MLflow Tracking

## Why model tracking matters

- During model development we run **many experiments** before
  finalizing anything:
  - Different datasets or train/validation splits  
  - Alternate cleaning and preprocessing pipelines  
  - Multiple feature engineering strategies  
  - Model variants and architectures  
  - Hyperparameter configurations and training schedules  
- Traditionally, all of this was tracked manually:
  - Spreadsheets with metrics  
  - With screenshots and notes  
- This does **not scale** and is very hard to reproduce.

**MLflow Tracking** solves this by:

- Recording parameters, metrics, code versions, tags and artifacts for
  each run
- Storing all runs in a single, queryable place
- It also provides a web UI to explore and compare experiments

---

## What is ML runs?
 
- A single execution of your training/evaluation code.  
- Each run has its own:
  - Parameters  
  - Metrics  
  - Artifacts (models, plots, CSVs, images…)  
  - Tags  
  - Code and environment information  
- Every time you call `mlflow.start_run()`, MLflow creates a new **run**
under the currently active **experiment**.

---

## What is MLflow Experiment?
- Its like a project
- A logical group of related runs  
- Experiments help organize and compare runs that belong together.
- An experiment can have multiple runs within it
- For example breast cancer classification is the experiment while running with different models will be the runs


---

## The `mlruns` directory

- By default, MLflow stores tracking data in a folder called `mlruns/` in
your current working directory (unless you point it to a remote tracking
server). 
- The path where this folder must be stored can be changed
- The directory structure of mlruns looks like this:

```text
mlruns/
 ├── experiment id = 1/
 │    ├── meta.yaml
 │    ├── <run_id_1>/
 │    ├── <run_id_2>/
 │
 ├── experiment id = 2/
 │    ├── meta.yaml
 │    ├── <run_id_3>/
 │
 └── .trash/
```
- Where,
- `meta.yaml` (under each experiment): Stores the experiment details like
  - Experiment ID  
  - Name of the experiment  
  - Artifact location  
- `run_id_1`, `run_id_2`, `run_id_3`
  - Every call to `mlflow.start_run()` creates a unique `run_id` inside the chosen experiment.
  - When you re‑run the script with different hyperparameters under the
same experiment, MLflow simply creates **another run**.
  - Common environment files inside runs:
    - `requirements.txt` – dependencies for reproducing the run via `pip`  
    - `conda.yaml` – dependencies for reproducing the run in a Conda env  
    - `python_env.yaml` – dependencies for a Python virtual environment  
  
  
  
## Directory structure maintained for each run
```text
<run_id>/
 ├── artifacts/
 ├── metrics/
 ├── params/
 ├── tags/
 └── meta.yaml
```

- `artifacts/`
  - Contains everything thats logged via `mlflow.log_artifact()` or `mlflow.log_model()`
  - Contains trained models, plots, CSVs, images, etc.
- `params/`
  - Each parameter is stored as an independent file.
  - Example:

    ```python
    mlflow.log_param("learning_rate", 0.01)
    ```

    creates:

    ```text
    params/
    └── learning_rate   # file content: 0.01
    ```

- `metrics/`
  - Each metric is stored as a file with timestamped values.
  - Example:

    ```python
    mlflow.log_metric("rmse", 0.45)
    ```

    yields a `metrics/rmse` file whose content may look like:

    ```text
    <timestamp> <value> <step>
    1675601234567 0.45 0
    1675601240000 0.42 1
    ```

  - This is useful to analyze how metrics change across steps/epochs.
- `tags/`
  - These are custom metadata tags that we can assign to a run so that we can easily filter and differentiate between the runs
- `meta.yaml`
  - Run‑level metadata:
    - `run_id`, 
    - `experiment_id`  
    - `start_time`, 
    - `end_time`  
    - Run status  
    - `user_id`, 
    - `artifact_uri`, etc.


---

## Basic tracking workflow (experiments + runs)

### 1. Set (or create) an experiment

```python
import mlflow

experiment = mlflow.set_experiment(
    experiment_name="Experiment - iteration 1"
)
```

- If an experiment with this name does not exist, MLflow creates it.
- `experiment.experiment_id` gives you the numeric experiment id.

### 2. Start a run

```python
with mlflow.start_run(experiment_id=experiment.experiment_id):
    # training / evaluation code here
    ...
```

- Every call to `start_run()` creates a **new run**.  
- Each run is uniquely identified by a `run_id`.
- If we pass `run_name` in that particular name the run will be logged

### 3. Log parameters, metrics, and models

```python
from sklearn.linear_model import ElasticNet

experiment = mlflow.set_experiment("Experiment - iteration 1")

lr = ElasticNet(random_state=42)

with mlflow.start_run(experiment_id=experiment.experiment_id):
    # train
    lr.fit(X_train, y_train)

    # log metrics
    mlflow.log_metric("rmse", rmse)
    mlflow.log_metric("mae", mae)

    # log the model
    mlflow.sklearn.log_model(lr, "model")
```

- This run, including parameters, metrics, and the model artifact, will be
visible in the MLflow UI.
- For more detailed logging APIs (e.g. `log_param`, `log_metric`,
`log_artifact`), refer to [MLflow Logging](ml_flow_logging.md)

---

## Multiple runs in a single program

Multiple runs are useful when:

- You perform **incremental training** (e.g. different datasets or
  checkpoints) and want to track performance across checkpoints.
- You want to evaluate a model across multiple datasets.
- You try different feature engineering strategies and want separate
  history per attempt.
- You do **hyperparameter search**, where each candidate configuration
  of hyperparameters becomes a separate run.

Example:

```python
import mlflow

# RUN 1
mlflow.start_run(run_name="run1")
current_run = mlflow.active_run()
print("Active run name:", current_run.info.run_name)
mlflow.end_run()

# Last completed run
previous_run = mlflow.last_active_run()

# RUN 2
mlflow.start_run(run_name="run2")
current_run = mlflow.active_run()
print("Active run name:", current_run.info.run_name)
mlflow.end_run()

# Last completed run (again)
previous_run = mlflow.last_active_run()
```

Here, both runs belong to the currently active experiment. They run
sequentially in the same script, but each has its own `run_id` and
metadata.

---

## Multiple experiments in a program

Use multiple experiments when:

- You want to try **completely different approaches** for the same
  problem (e.g. different model families, very different pipelines).
- You want a clear separation between groups of runs

Example:

```python
import mlflow

# EXPERIMENT 1
exp1 = mlflow.set_experiment(experiment_name="experiment1")
with mlflow.start_run(run_name="run1", experiment_id=exp1.experiment_id):
    # Code for approach 1
    ...

# EXPERIMENT 2
exp2 = mlflow.set_experiment(experiment_name="experiment2")
with mlflow.start_run(run_name="run1", experiment_id=exp2.experiment_id):
    # Code for approach 2
    ...
```

- The same run name (e.g. `"run1"`) can be reused across experiments.  
- What distinguishes runs is their combination of `experiment_id` and
  `run_id`.
- In the UI, each experiment appears separately, and you can drill down into its runs to compare metrics and artifacts.


# Hands On
- [MLflow Tracking](../md_practicals/practice.md)