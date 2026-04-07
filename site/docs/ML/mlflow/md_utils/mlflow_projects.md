# MLflow Projects
- Helps in packaging the scripts, so that the experiments can be reproduced even in different environments
- Helps in sharing the codes and dependencies
- It provides a command line interface
- Supports different project templates making it easier for the users to begin with
- MLflow has defined some rules, to structure the code in a particular format
- A new file called "MLproject" must be created in your projects folder. The naming convention must be exactly the same. If its not maintained then MLflow will not be able to recongise the same.
- There is no extention for this file
- The content within the MLproject will be in YAML
- MLflow tracking will help in logging the runs, while MLflow projects helps in execution packaging
- 3 parts in the MLflow Project i.e. name, environment, and entry_points. Each of them is explained in detail below


# MLproject environments
- MLproject supports 4 environments i.e. 
1. System environment
    - The system environment must have all the projects dependencies installed and configured properly
    - Not preferable, as might result in conflicts
    - Here we dont specify the environment. If nothing is specified it means it has to use the systems environment
2. Virtual environment
    - It will create a virtualenv on the fly and install on the dependencies in that virtual environment and then run the code within that
    - You will need to include `python_env` config in the MLproject file
```python
# MLproject
name : "Project Name"

python_env: path/to/python_env.yaml
```

```yaml
python_env.yaml

python: "3.9.11"

build_dependencies:
    - pip
    - setuptools
    - wheel == 0.37.1

dependencies:
    - mlflow==2.3
    - scikit-learn==1.0.2
```

3. Conda environment
    - Most widely used
    - You need to specify the conda_env config in the MLproject file
    - You need to pass the path of conda.yaml in MLproject file
```python
# MLproject
name : "Project Name"

conda_env: path/to/conda.yaml
```

4. Docker environment
    - These are used in the real projects
    - MLflow can run your code using the dependencies specified via a Docker image
    - The docker image will contain your entire projects dependencies
```yaml
# MLproject
name : "Project Name"

docker_env:
    image: "Name of the docker image"
``` 
- You can also specify the mouting volumns and other environment variables that must be provided to your docker image
```yaml
docker_env:
    image: "Name of the image"
    volumes: ["/local/path:/container/mount/path"]
```
- You can even create a new image
```yaml
docker_env:
    image: python:3.8
```


# Entry Points
- Define different tasks or operations that can be executed as a part of your project
- Eg: if your code has training, inference, monitoring then each of these will be a different endpoint
- Simple projects will usually have a single entry point whereas complex projects will have many entry points
- Each entry point will have
1. Name:
    - Name of the entry point
    - Will be unique
2. Command
    - The command that must be run when that entry point is invoked
    - The file to be executed can be any executable like .py, .sh file etc
3. Parameters
    - Inputs that must be passed to the entry point
    - These parameters can be passed inside the MLproject file or can even be passed on command line
4. Environment
    - The environment in which the entry point must be executed
- Steps to create an entry point
```yaml
name: "Name of the Project"

conda_env: "path/to/conda.yaml"

entry_points:
    <Entry Point Name>:
        command: "python main.py --arg1={arg1} --arg2={arg2}"
        parameters:
            arg1:
                type: float
                default: 0.4
            arg2:
                type: string
                default: "xyz"

```
- Any parameter which is not declared under the parameters field are treated as strings
- Each entry point will have a single command and can have more than 1 parameter


# Running MLflow project
- You can run the MLflow project either by using CLI or an API
- This can be run on local machine or on the remote machine

1. CLI
    - `mlflow run [PARAMETERS OR OPTIONS] URI`
    - URI: URI of the MLflow project 
    - First tracking URI must be set
    - `set MLFLOW_TRACKING_URI=<link to the tracking server>`
    - Then execute mlflow run command
    - `mlflow run --entry-point <Entry point name> -P arg1=0.5 -P arg2="xyz --experiment-name = <"Project Name">" . `
    - . here allows the MLflow to search for the MLProjects file to begin the execution


2. API

```python
import mlflow

parameters = {
    "arg1" : 0.5,
    "arg2" : "xyz    
}

experiment_name = "Name of the experiment"
entry_point = "Entry Point Name"

mlflow.projects.run(
    uri = ".", # Fetches the MLProject file
    entry_point = entry_point,
    parameters = parameters,
    experiment_name = experiment_name
)

```
- We can run it as a simple python file




# List of a few Run command options while running MLflow projects is given below

1. To run an entry point
```bash
mlflow run -e < entry point name > < project URI >
```
- Where -e refers to running the specified entry point
- If entry point is not specified it defaults to main

2. Pass parameters to the run
```bash
mlflow run -P < param1 = value1 > -P < param2 = value 2 > < project URI >
```

3. Passing arguments to the docker image
```bash
mlflow run -A < param1 = value 1 > -A < param2 = value 2 > < project URI >
```



# MLproject File
- Each ML project directory will have a file called MLproject file.
- Its a YAML file
- Its like a guide book which explains your projects to others
- Helps in standardizing the ML projects
- Defines the overall project and its execution steps
- It tells MLflow on what environment to use, what parameters are accepted, how to run the code etc
