# MLFlow Model Registry
- After trying multiple models for a project, the best model will be stored in the model registry
- Its a centralized system to manage the lifecycle of ML models after they are trained
- It also maintains the version of the model along with the metadata
- Its like GitHub (version control) but for the lifecycle of ML models
- The model name will be fixed for an experiment and then version will be added as the metadata. This will help us in rolling back to the previous version if accuracy drops or something breaks
- Each version will have its own artifacts, metadata information etc
- For model registry a database is required, as it stores model versions, metadata, timestamps etc
- The model registry will not contain the model files, it just stored the metadata but not the model weights
- The actual model will still be stored in the artifact store
- Only when the model is logged you will be able to register that model
- All the registered models will be present under the "Models" section in the UI
- When tags are mentioned for the registered models, it will help us filter the required models
- At version level also tags can be included



# Ways to register a model
1. UI
2. API

# How to register a model through UI
- Run the tracking server
- Then choose the run whose model you want to register
- Then you will see the button called "Register Model"
- Create new model (if you dont want to create a new version to the existing model, else choose existing)
- Once its pressed the model gets registered

# Stages
- Depicts which phase is your model in i.e. stagging, production environment etc
- There are 3 possible stages in which the model can be in 
    1. Stagging
        - Model under consideration
    2. Production
        - Model thats ready for deployment
    3. Archive
        - Model is no longer used
        - This still is present in the resistry
- We can change the stages of the model
- Once you choose the model in the UI, you can choose the stage
- Once the model is registered as the stage is set to either production or staging we cant delete the model. For deleting we need to put the model into archive and then delete the model
- This is also called Aliases in new versions
- Instead of fixed stages, you can custom your stages in Aliases by given the name of your choice


# How to register the model using API
- In UI we could register a model only after the model was logged
- In API method you can either log the model during the logging process or later
- This can be done using `log_model()` or `register_model()`

# Registering a model using `log_model()`
```python
mlflow.log_model("model1", registered_model_name = "registered_model1")
```
- This will tell MLFlow after logging the model artifact, register it in the model registry
- This will work only when MLFlow is connected to a tracking server that has a backend store configured
- This is because all the model artifacts can be stored locally , but to register a model there is a need to a database to store its metadata
- If the registered_model_name had existed before then it will create a new version of it

# Registering a model using `register_model()`
- When we register a model using `log_model()` the model is registered while logging
- But when the model is registered using `register_model()` its registered after the model logging
- Parameters
    - model_uri
        - Path to the model
    - name
        - Name of the registered model
        - If this name is already existing then it will create a new model else creates a version of that model
    - await_registeration_for
        - Determines the duration of time the model should wait for to reach the READY state
    - tags
        - Dictionary of key value pairs that will be used to identify the model easily and to apply filters
```python
# Train the model
import mlflow
import mlflow.sklearn
from sklearn.linear_model import LogisticRegression

with mlflow.start_run() as run:
    model = LogisticRegression()
    model.fit(X_train, y_train)

    mlflow.sklearn.log_model(model, "model")

    # Fetches the current run id
    run_id = run.info.run_id
```
- Now the model will be stored as an artifact under `runs:/<run_id>/model`
- Now register the model
```python
model_uri = f"runs:/{run_id}/model"

registered_model = mlflow.register_model(
    model_uri = model_uri,
    name = "registered_model1"
)

print(registered_model.version)
print(registered_model.status)
 ```

# How to use registered model for predictions
- We will need to use model URI i.e. `models:/<model_name>/<stage_or_version>`
- If you registered model was "registered_model1" and has a version of 1 and stage is set to Production then 
```python
import mlflow.pyfunc

# Loading the registered model by stage
model = mlflow.pyfunc.load_model(
    "models:/registered_model1/Production"
)

# OR
# Loading the registered model by version
model = mlflow.pyfunc.load_model(
    "models:/registered_model1/1"
)

predictions = model.predict(input_data)
```
- This same script will work in production too, just that trackng uri will not be a local host URI instead will be the host URI of MLFlow


# How to register an external model
- External model is a model that was trained using a seperate code and was not logged using MLFlow
- First start the MLFlow tracking server
```python
import pickle
import mlflow
import mlflow.sklearn

# Model that was created externally
filename = "model1.pkl"
loaded_model = pickle.load(open(filename, "rb"))

# Setting the tracking URI 
mlflow.set_tracking_uri(uri = "http://127.0.0.1:5000")
experiment = mlflow.set_experiment(experiment_name = "experiment1")

mlflow.start_run()

mlflow.log_model(
    loaded_model,
    "model1",
    serialization_format = "cloudpickle",
    registered_model_name = "registered_model1"
)

mlflow.end_run()
```