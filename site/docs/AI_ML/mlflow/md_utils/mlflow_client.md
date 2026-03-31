# MLFlow Client
- Tracking server is responsible to track and log the models and artifacts
- These tasks cannot be done by its own, it needs instructions on what it has to do, which is provided by the client
- Its a Python API class that is used to programmatically interact with the tracking server and model registry
- Think of it as a low level SDK thats used to directly manage experiments, runs, models and registry operations
- High level API are those which are provided by the MLFlow librabry like `log_metric()`, `log_model()` etc
- But when you want to search experiments, delete runs, update model decriptions etc use MLFlow Client


# What can MLFlow Client do?
- Manage & search experiments
- Search runs
- Manage Model registry
- Update or delete metadata



# Experiment management using MLFlow client
- Function provided
    - create_experiment
    - set_experiment_tag
    - get_experiment
    - get_experiment_by_name
    - rename_experiment
    - delete_experiment
    - restore_experiment
    - search_experiment


# `create_experiment()`
```python

import mlflow
from mlflow import MlflowClient

# Set tracking URI
mlflow.set_tracking_uri("http://127.0.0.1:5000")

# Client object
client = MlflowClient()

experiment_id = client.create_experiment(
    name = "Experiment Name",
    tags = {
        "version": 0.1,
        "priority" : "P1
    }
)

```
- Start the tracking server and then run this script

# `set_experiment_tag()`
```python

client.set_experiment_tag(
    experiment_id,
    "Tag Name",
    "Tag value"
)
```
- Disadvantage of this function is that we can create only 1 tag at a time
- To add multiple tags this function must be called N no of times

# `get_experiment()`
- To get the experiment object
```python
experiment = client.get_experiment(experiment_id)
```

# `get_experiment_by_name()`
- It fetches the experiment object given the name of the experiment
- If the experiment name does not exist then it returns None
```python
experiment = client.get_experiment_by_name("Experiment Name")
```

# `rename_experiment()`
- To rename the existing experiment
```python
client.rename_experiment(experiment_id, experiment_name)
```
- It does not return anything, it just renames

# `delete_experiment()`
- To delete an experiment
```python
client.delete_experiment(experiment_id)
```

# `restore_experiment()`
- To fetch the deleted experiments
```python 
client.restore_experiment(experiment_id)
```
- Once you delete the experiment it does not get deleted permanently, instead it will be in the deleted lifecycle stage

# `search_experiment()`
- Searching an experiment is very difficult, so we can search an experiment in 2 ways, 1 is through UI and the other is programatically
- This function is more like a serach engine to search the experiments
- Parameters
    - view_type: 
        - Allow to specify what type of experiment are you looking for
        - Whether you want to look at all the experiments that are active i.e. ACTIVE_ONLY or all experiments that are deleted i.e. DELETED_ONLY or irrespective of the status i.e. ALL
    - max_results
        - Maximum no of experiments that you want to retrieve
        - Sometimes even if you specify the no you may not get the results which matches the given number as a few internal servers have their own max thresholds set
    - filter_string
        - Provide the query to filter out the eperiments
        - Multiple sub queries can be used
    - order_by
        - The order in which the results must be shown
        - Default: last_updat_time in DESC
    - page_token
        - Used for pagination
        - Useful when there are multiple pages of results
- Returns
    - Page list of experiment objects

```python
import mlflow
from mlflow import MlflowClient
from mlflow.entities import ViewType

experiments = client.search_experiments(
    view_type = ViewType.ALL,
    filter = "name = `Client` AND tags.`version` = `v1`"
    order_by = ["experiment_id ASC"]
) 

```
- This query orders the experiment objects based on experiment_id in ASC order and whose name is equal to client and the tags version is set to V1


# `create_run()`
```python
run = client.create_run(
    experiment_id = "123",
    tags = {
        "tag1": "abc",
        "tag2": "xyz"
    },
    run_name = "Name of the run"
)
# Tags
print(run.data.tags) 

# Experiment ID
print(run/info.experiment_id)

# Run ID
print(run.info.run_id)

# Run Name
print(run.info.run_name)

# Lifecycle Stage
print(run.info.lifecycle_stage)

# Status
print(run.info.status)
```
- This just creates the run and does not run any script
- This is not like start_run function where it creates the run and marks it as the active run
- In this case, we will need to explicitely call the run and use it as an active run
- The run created through this has to be manually terminated, which can be done using `update_run()` or `set_terminated()`
- The status of the run can be RUNNING, SCHEDULED, FINISHED, FAILED, and KILLED

# `update_run()`
```python
client.update_run(run.info.run_id, status = "FINISHED", name = "New run name")
```
- `update_run()` helps in changing the status of the run and also helps in changing the name of the run
- In this case the old run name will be updated with the new run name
- By default when used the status will be changed to FINISHED


# `set_terminated()`
```python
client.set_terminated(run.info.run_id, status = "FINISHED")
```
- Unlike `update_run()` this method cannot uypdate the name of the run
- This is just used to change the status of the run
- By default when used the status will be changed to FINISHED

# Logging parameters using client
```python

alpha = client.log_param(run.info.run_id, "alpha", alpha)

l1_ratio = client.log_param(run.info.run_id, "l1_ratio", l1_ratio)
```

# Logging metrics
```python

client.log_metric(run.info.run_id, "rmse", rmse)

```

# Logging Artifacts
```python
client.log_artifact(run.info.run_id, "path to the artifact")
```

# `get_metric_history()`
- Used to fetch all the metrics that were logged within a particular run
- This is usually used to in deep learning models as we will need to monitor the metric values after every epoch
```python
client = MlflowClient()

metrics = client.get_metric_history(run.info.run_id, "Name of the metric that you want to retrieve")
```
- This will contain a metric object list of the given metric
- This will contain information like step, timestamp, its value etc
```python
for metric in metrics:
    print(metirc.step, metric.timestamp, metric.value)
```
- When its a simple ML model then we will have only 1 set of metrics stored therefore the len of the metric object list will be one and the step will be 0
- But for Deep learning models there will be N no of steps

# `list_artifacts()`
- To fetch the information about the artifacts
```python
artifacts = client.list_artifacts(run.info.run_id)
```
- If the artifacts are stored in the default path then we need not pass the artifact path as an argument to the function else we will need to pass that
- Returns an list of srtifact objects thus to retrieve each we will need to run a for loop
```python
for artifact in artifacts:
    print(artifact.path, artifact.file_size)
```
- If we have 2 artifacts then the artifacts variable will be of length 2

# `delete_run()`
```python
run = client.get_run(experiment_id)
client.delete_run(run.info.run_id)
print(run.info.lifecycle_stage)
```
- It deletes the given run_id
- This will change the lifecycle stage to Deleted

# `restore_run()`
- Used to restrore the deleted run
```python
client.restore_run(run_id)
print(run.info.lifecycle_stage)
```
- This will change the lifecycle stage to Active


# `search_run()`
- Used to search run
- Works similar to search experiments
```python
from mlflow.entities import ViewType

runs = client.search_run(
    experiment_ids = ["id1" , "id2"],
    run_view_type = ViewType.ALL,
    order_by = ["run_id ASC"],
    filter_string = "run_name = `run1`"
)
```
- Returns all the run objects list which satisfies the given condition 


# `create_registered_model`
- Used to register the model
```python
client.create_registered_model(
    name = "name of the registered model,
    tags = {
        "tag1" : "value1",
        "tag2" : "value2"
    },
    description = "The description for the registered model"
)
```
- This will create a registered model in the model registery with no model inside it

# `create_model_version()`
- Used to create a version instead the registered model
```python
client.create_model_version(
    name = "Name of the registered model whose versions you want to create",
    source = "runs:/<run_id>/model",
    tags = {
        "tag1":"value1"
    },
    description = "The description of the new version"
)
```
- Now the registery will not be empty instead it would have created version 1

# `set_model_version_tag()`
- Helps in setting a tag to the model version
```python

client.set_model_version_tag(
    name = "Name of the registery",
    version = "Version of the model to which tag must be added",
    key = "Key value for the tag",
    value = "Value of the tag"
)
```

# `update_model_version()`
- Used to update the description of the model
```python 
client.update_model_version(
    name = "Registry Name",
    version =  "Version of the model whose decription has to be changed",
    description = "The new description"
)
```

# `transition_model_version()` 
- Setting the stage
- Different stages are Staging, Production, Archived
```python 
cliet.transition_model_version_stage(
    name = "Registry Model",
    version = "Version of the model whose stage must be changed",
    stage = "Name of the stage to which you want to update to",
)
```
- You can use the parameter `archive_existing_versions` and set it to True to archive all the existing versions present in that stage to Archived
- This will work only when the stage is stagging or production

# `get_latest_version()`
- This is to get the latest version of the model for a specific stage
```python
client.get_latest_version(
    name = "Registry Name",
    stages = ["production", "stagging"] # List of stages versions you want to retrieve
)
```
- If stage is not specified then it returns the latest version for each stage

# `get_model_version()`
- To get the model version for a specific model
```python
model = client.get_model_version(name = "registry name", version = "version1")

print(model.name)
print(model.version)
print(model.description)
print(model.current_stage)
print(model.tags)
```

# `get_model_version_by_alias()`
- Helps in fetching the model given the name and its alias
```python
client.get_model_version_by_alias(name = "Registry Name", alias = str)
```

# `search_model_versions()`
- Used to find the model versions
```python

result = client.search_model_versions(
    filter_string = "tags.framework = `sklearn`",
    max_results = 10,
    order_by = ["name ASC"]

)
```
- Returns the list of all the models which satifies the criteria

# `delete_model_version()`
- To delete the version of the model
- For this to happen first we will need to archieve the model
```python
client.transition_model_version_stage(
    name = "Registry Name",
    version = "version1",
    stage = "Archived",
    archieve_existing_versions = False
)

lclient.delete_model_version(
    name = "Registry Name",
    version = "version1"
)
```