# MLFlow Logging
# MLflow Logging APIs

- This file covers the **core Python APIs** for configuring tracking and logging to MLflow. 

---

## Tracking URI

### `set_tracking_uri(uri)`

Specifies where MLflow stores tracking data (metadata and artifacts).

- **Default**: Creates a local `mlruns/` folder in the current working directory
- **URI options**: Local path, HTTP(S) URL (remote server), Databricks, etc.

```python
import mlflow

mlflow.set_tracking_uri("http://127.0.0.1:5000")
```
- If its a remote server then replace the URI with the hosted URI instead of localhost

> For local filesystem paths, use `file:/path/to/dir`. Dont use Drive-specific paths like `C:/...` as it can behave differently across platforms.

### `get_tracking_uri()`

Returns the currently configured tracking URI.

```python
current_uri = mlflow.get_tracking_uri()
```

---

## Experiment management

### `create_experiment(name, artifact_location=None, tags=None)`

Creates a **new experiment**.

- Parameters
    - name 
        - Name of the experiment
        - Unique, case-sensitive experiment name
    - artifact_location 
        – Where to store artifacts for this experiment (overrides default)
    - tags 
        – Dict of key-value metadata
- Returns 
    - Experiment ID

```python
import mlflow
from pathlib import Path

experiment_id = mlflow.create_experiment(
    name="experiment-1",
    tags={"version": "v1", "priority": "low"},
)

with mlflow.start_run(experiment_id=experiment_id):
    # training / logging code
    ...
```

### `get_experiment(experiment_id)`

Fetches metadata for an experiment by ID.
```python
import mlflow 

experiment = mlflow.get_experiment(experiment_id)
print(experiment.name, experiment.artifact_location, experiment.tags, experiment.lifecycle_stage, experiment.experiment_id, experiment.creation_time)
```

### `set_experiment(experiment_name=None, experiment_id=None)`

Sets the **active experiment** for subsequent runs.

- If the experiment **does not exist** (by name) → creates it
- If you pass `experiment_id` for a non-existent experiment → raises an error
- Returns
    – `mlflow.entities.Experiment` object representing the active experiment

```python
experiment = mlflow.set_experiment(experiment_name="experiment1")

with mlflow.start_run(experiment_id=experiment.experiment_id):
    # Code
    ...
```

---

## Run lifecycle

### `start_run(run_id=None, experiment_id=None, run_name=None, nested=False, tags=None, description=None)`

Starts a new run (or resumes an existing one).

- **run_id** – Resume an existing run (mutually exclusive with `experiment_id`)
- **experiment_id** – Run under this experiment
- **run_name** – Human-readable run name (only for new runs)
- **nested** – If `True`, create a child run inside the active run
- **tags** - Custom key value pairs for easy identification
- **description** – Description to the run (Optional)
- **Returns** – `mlflow.ActiveRun` object

```python
with mlflow.start_run(run_name="my-run"):
    # Code
    ...
```
- As `start_run` is written within the "with" block it automatically ends the run after the experiments execution is completed



### `end_run(status=None)`

- When `start_run` is executed out of the "with" block we need to manually end the run

- **status** can be either one of these : `RUNNING`, `SCHEDULED`, `FAILED`, `FINISHED`, `KILLED`
- Default: `FINISHED`

```python
mlflow.start_run(run_id="existing_run_id")
# Code
mlflow.end_run()
```

### `active_run()`

- Returns the **currently active run**, or `None` if no run is active. 
- This can be used only between start_run() and end_run(), as during this span alone the run can be active

```python
mlflow.start_run()

run = mlflow.active_run()
print(run.info.run_id)

mlflow.end_run()
```

### `last_active_run()`

- Returns the most recent active run
- It can also be used to return the current active run, as it just depends on where the `last_active_run` is being called
    - If its placed between start_run() & end_run() then it returns the active run
    - If its placed after end_run() then it returns the previous run
        - This would make more sense only when more runs are there, and you want to know which run was previously run

---

## Logging parameters and metrics

### `log_param(key, value)` / `log_params(params)`

Log hyperparameters or config as key-value pairs.

- `log_param()` – Single parameter logging
- `log_params()` – Dict of parameters can be logged at once

```python
mlflow.log_param("learning_rate", 0.01)
mlflow.log_param("alpha", 0.1)

mlflow.log_params({"learning_rate": 0.01, "alpha": 0.1})
```

### `log_metric(key, value, step=None)` / `log_metrics(metrics, step=None)`

- Used to Log metrics like RMSE, accuracy, recall etc

- `log_metric()` – Logs only single metric at a time
- `log_metrics()` – Dict of metrics can be logged at once

```python
mlflow.log_metric("rmse", 40)
mlflow.log_metric("mae", 70)

mlflow.log_metrics({"rmse": 40, "mae": 70})

# With step (e.g. epoch)
mlflow.log_metric("loss", 0.5, step=1)
```

---

## Logging artifacts

### `log_artifact(local_path, artifact_path=None)` / `log_artifacts(local_dir, artifact_path=None)`

- Used to log artifacts like datasets, encoders, scalars etc

- `log_artifact()` – Single artifact can be logged
- `log_artifacts()` – Multiple artifacts can be logged at a time

- Parameters
    - local_path
        - Path of the artifact file that must be stored
    - local_dir
        - Path of the artifact directory that has to be stored
    - artifact_path
        - If you do not want the artifact to be stored in the default path i.e. mlruns then use this
- Returns
    - None

```python
mlflow.log_artifact("sample_dataset.csv")

mlflow.log_artifacts("path_to_dataset_directory")  
```

### `get_artifact_uri(artifact_path=None)`

- Returns the Absolute URI of the specified artifact in the current run.

```python
mlflow.log_artifact("features.txt", artifact_path="features")
uri = mlflow.get_artifact_uri()
```
- Here it will return the absolute path for "path/to/artifacts"

```python
mlflow.log_artifact("features.txt", artifact_path ="features")
artifact_uri = mlflow.get_artifact_uri(artifact_path = "features/features.txt")
```
- Returns absolute path pointing to features.txt instead of artifacts which is the root directory i.e. "path/to/artifacts/features/features.txt"

---

## Tags

### `set_tag(key, value)` / `set_tags(tags)`

- Set custom key-value tags on the current run for filtering and organization.
- `set_tag()` is used to set a single tag under the current run
- `set_tags()` is used to set multiple tags under the current run
- If there is no active run it creates a new run and then sets the tags accordingly
- Can be used only during the run i.e. between `start_run` and `end_run`
- Parameters - `set_tag()`
    - key
        - Name of the tag
    - value
        - Value of the tag
        - It must be a string
- Returns
    - None
- Parameters - `set_tags()`
    - tags
        - Dictionary of tags
        - Key: Name of the tag
        - Value: Value of the tag
- Returns
    - None
```python
mlflow.set_tag("release_version", "0.1")
mlflow.set_tags({"release_version": "0.1", "release.candidate": "ABC"})
```
- MLflow also adds **system tags** (e.g. `mlflow.runName`, `mlflow.user`, `mlflow.source.type`). 
- In the UI it shows only the custom tags created, it does not show the system tags
