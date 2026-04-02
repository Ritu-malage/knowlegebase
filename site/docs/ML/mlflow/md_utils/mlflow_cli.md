# MLFlow CLI
- List of various commands that could be run on CLI

# MLFlow Doctor
- Helps in debugging and identifying the environment issues with the MLFlow setup
- More like a health checker for MLFlow

## Why is MLFlow Doctor needed?
- When MLflow doesn’t behave as expected, common issues include:
    - Tracking server not reachable
    - Wrong backend store URI
    - Artifact store misconfiguration
    - Missing dependencies
    - Wrong environment variables
    - Permission issues
- Instead of manually debugging, you run:
```bash
mlflow doctor
```
- This prints diagnostics about the setup
- But if there is some sensitive information then we can mask its values by running
```bash
mlflow doctor --mask-envs
```

# MLFlow artifacts
- Through CLI we can 
    - Download
    - List
    - Log artifact or artifacts
```bash
# To List all the artifacts
mlflow artifacts list --run-id < run_id >

# To download artifacts
mlflow artifacts download --run-id < run_id > --dst-path < Path where you want to download >

# To log artifacts
mlflow artifacts download --local-dir < Path where the artifacts are currently present > --run_id < run_id where you want the artifacts to be logged >

```
- Instead of run_id even artifact URI can be provided

# MlFlow DB
- To upgrade the database
```bash
mlflow db upgrade sqlite:///mlflow.db
```

# MLFlow experiments
- Through CLI we can
    - create experiments
    - rename experiments
    - delete experiments
    - restore experiments
    - search experiments
    - Exporting experiments runs as CSVs
```bash
mlflow experiments create --experiment-name < Experiment Name >
```


# Exporting experiment runs into a CSV
- This exports all the experiment runs and its parameters and metrics into a CSV
- This will be useful when 
    - You want to compare results in an excel sheet
    - Share results
    - Perform analysis
- Via scripts
```python
import mlflow

# Get experiment
experiment = mlflow.get_experiment_by_name("FraudDetection")

# Search runs
runs_df = mlflow.search_runs(
    experiment_ids=[experiment.experiment_id]
)

# Export to CSV
runs_df.to_csv("experiments.csv", index=False)
```
- Via CLI
```bash
mlflow experiments csv --experiment-id < id > --filename < sample.csv >
```

# MLFlow Runs
- Used to
    - List
    - Restore
    - Delete runs
```bash
mlflow runs list --experiment-id < id > --view `all`
```
- Returns all the runs with the given id and the view mode is all i.e. active only, deleted only etc
- To get the detailed information about the run
```bash
mlflow runs describe --run-id < id >
```
- Gives the detailed information about the given run id like its tags, decsriptions, start time, metrics logged ..etc 