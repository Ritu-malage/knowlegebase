# MLflow Models
- It helps in packaging the trained models into a standard format
- Before the model was packaged manually including its requirements and then deploying it into the production environment. This was time consuming and sometimes even error prone
    - Reproducing the same environment in which it was trained on is very difficult to be achieved
    - Deploying the models in different environment will be difficult
- It will help in packaging the model in a reusable format allowing models to be deployed in any environment
- It provides a central repository to manage models
- Also provides an API to deploy the models in different environments



# Advantages
- Helps in easy deployment of models in different environments
- Provides an UI to track model versions and share the models across teams
- We can evaluate the models using different metrics


# Components of the model
1. Storage format
2. Model Signature
3. Model API


# Storage format
- Specifies how the model artifacts are physically stored inside the model directory
- Its specifies the serializating and file format
- Includes the model, metadata of the model, hyper parameters, and the model versions
- It supports multiple storage formats like a directory of files, single file format, python functions or container images
- By default the storage format is directory of files i.e. inside the models folder there will be multiple model artifact files
- Eg: .pkl, .pt



# Model API
- Its a REST API which provides an interface for interacting with the models
- Supports both synchronous and asynchronous requests



# Flavors
- Specifies the way the model must be loaded and used
- Flavors exists because each ML framework (scikit lean, tensorflow ..) save the models differently
- EG: sklearn, pytorch, pyfunc etc


# Files present in the model directory
- input_example.json
    - Its an optional file that exists within the models directory
    - This contains the sample input data
    - This is the same structure thats expected during inference
- model.pkl
- requirements.txt
- conda.yml
    - Requirements file for conda environments
- python_env.yaml
- MLmodel
    - Its an YAML metadata file that tells MLflow on how to load the model, what falvors it has, where are the artifacts stored, and what environment is required

# Contents of MLmodel file
- It only contains metadata
- It does not contain the actual model weights
- It does not contain training data or large artifacts
- It provides full visibility on how the model was created, which can futher be used for testing and validating
```python
mlflow.sklearn.log_model(lr, "model1")
```


1. Flavors section
- Tells how to load the model
```yaml
flavors:
  sklearn:
    model_path: model.pkl
    serialization_format: cloudpickle
  python_function:
    loader_module: mlflow.sklearn
    python_version: 3.10.12
```
- This tells MLflow that its an sklearn model as it has an falvor called sklearn
- The artifact is at `model.pkl`
- It also supports python_function

2. Artifact Paths
- Specifies where the actual model is stored
```yaml
model_path: model.pkl
```

3. Environment Information
- Points to the environment dependency files
```yaml
conda_env: conda.yaml
python_env: python_env.yaml
```

4. Model Signature
- If provided will have the input and output schema
```yaml
signature:
  inputs: '[{"name": "age", "type": "integer"}]'
  outputs: '[{"type": "double"}]'

```
- This helps with:
    - Model validation
    - Safe deployment
    - Schema enforcement

5. Input Example
- Stores a sample input that was used during logging
```yaml
saved_input_example_info:
  artifact_path: input_example.json
```

6. mlflow_version
- Version of mlflow being used

7. model_uuid
- Unique identifier thats given for each model
- This is used by MLflow to track the experiments


# Model Signature
- Specifies the input, output schema, the data types, shape of the data that the model expects and returns
- This is used by MLflow to generate the REST API for the models, which will futher be used for inferencing
- This information will be logged when we will be logging the run
- Included as a part of the models metadata
- Model signature is automatically logged if we used autologging, as this parameter is by default set to True
```python
mlflow.autolog()
```
- `log_model_signature` can be set to False if you dont want the signature to be stored
- Storing signatures without autolog
```python
from mlflow.model.signature import ModelSignature
from mlflow.types.schema import Schema, ColSpec

input_schema = Schema([
    ColSpec("double", "age"),
    ColSpec("string", "city")
])

output_schema = Schema(ColSpec("double"))

signature = ModelSignature(inputs = input_schema, outputs = output_schema)

mlflow.log_model(lr, "model1", signature = signature)
```
- In this approach the model signature is created manual input and output schema creations 
- If we use `infer_signature` then it automatically generates model signature from the sample input and outputs
```python
from mlflow.models.signature import infer_signature

signature = infer_signature(X_train, model.predict(X_train))


mlflow.log_model(lr, "model1", signature = signature)
```


- Inputs can be 
  1. Column based 
    - Each column is treated as a separate feature
    ```yaml
    signature:
      inputs : '[{"name":"sepal len", "type": "double"},
                {"name":"sepal width", "type": "double"}
                ]'
      outputs: '[{"type":"integer"}]'
    ```
    - Column based signatures are supported by all flavors of MLflow
  2. Tensor based
    - Data is represented as a multi dimensional array i.e. tensor
    - Only supported by deep learning flavors of MLflow like tensorflow, keras, pytorch, onnx etc

# Model Signature Enforcement
- Process of defining & validating the input & output schema for ML Model
- This ensures only valid data is passed to the model 
- Helps in catching the errors faster
- 3 types
1. Signature enforcement
  - Also called schema enforcement
  - Checks if the inputs provided to the model match the expected signature
  - This is applied even before the model is called
2. Name ordering enforcement
  - Input names provided to the model matches the expected input names provides in the signature
  - If there are missing inputs then it will raise exception but if it has extra inputs it ignores
  - It also reorders the inputs based on the signature
  - if the data is extra then it orders them based on the position
3. Input type enforcement
  - Ensures if the input types provided to the model matches the expected input types present in the signature


# `save_model()`
- To save the model to the local path, instead of the server
- Produces model containing 2 flavors i.e. mlflow.sklearn and mlflow.pyfunc
- Parameters
  - sk_model
    - Scikit learn model object that must be saved
  - path
    - Local path where you want the model to be saved
  - code_paths
    - If you want to store the code file that was involved in the training then give the list of file paths whose code must be saved
  - mlflow_model
    - The flavor that is being added to the model
  - serialization_format
    - The format in which you want to save the model
  - signature
    - If the model signature must be created based on the dataframe instead of manually creating it
  - pip_requirements
    - List of all the requirements that was used in the training process
    - When theres a requirements file then you can pass its path
  - pyfunc_predict_fn
    - Name of the function that was used for predicting
  - Many more..

```python
mlflow.save_model(lr, "model1")
```
- This will save the model artifacts under the models directory on local, but on the tracking server/ UI you will not be able to see the model artifacts there, but if you use log_model then you can


# `log_model()`
- Logs the model as an artifact to the tracking server, thus making it accessible through MLflow UI
- Whereas `save_model` is used for local saving
- It produces model containing 2 flavors Mlflow.sklearn, mlflow.pyfunc
- This accepts a path where the model must be saved under the parameter called `artifact_path`, it can be a local path or a tracking server path
- Parameters
  - registered_model_name
    - To register the model with the specified name and version into the model registry
  - More..

# `mlflow.pyfunc.load_model(`
- To load the model using generic python interface
- Allows to load any MLflow model that has a pyfunc flavor

```python
import mlflow.pyfunc

model = mlflow.pyfunc.load_model("runs:/1234567890abcdef/model")

predictions = model.predict(data)

```
- `model_uri`: Path where the model is stored



# Model customization
- MLflow supports a few built int flavors
- But sometimes you might use an ML librabry that is not supported by MLFlows built in flavors in that case MLflow provides customization by leveraging Custom python models and custom flavors

# Custom python model
- Its a way to package any python logic as an MLflow Model using pyfunc flavor
- To achieve this we use the class `mlflow.pyfunc.PythonModel`
- Example 1:
```python 

class RAGModel(mlflow.pyfunc.PythonModel):

    def predict(self, context, model_input):
        docs = retriever.retrieve(model_input)
        response = llm.generate(docs)
        return response


mlflow.pyfunc.log_model(
  artifact_path = "path to where you want the artifacts to be stored"
  python_mode = "The object of the class which is of type mlflow.pyfunc.PythonModel, in this case its RAGModel()"
)
```
- Here the entire RAG system becomes a deployable MLflow model
- `mlflow.pyfunc.log_model` this will create a python function for the model
- When this method is used in the MLmodel file you will be able to see only 1 flavor i.e. python_function



# When to use custom models?
- When you combine multiple models
- Call an external API
- Wraps an LLM
- Use frameworks other than whats supported by MLflow


# Custom Flavor
- Instead of using standard way of serialization or packaging the model, if we want to customize and create a user defined model packaging format then custom flavors must be used
- This will be used when we want to build our own ML framework
- This involves lots of code
- Its a seperate topic as a whole
- We need to implement the serialization and deserialization logic
- Write scipts which shows how to load the model, save the model etc 
- Then we need to create a directory which contains all the files, and the metadata related to the serialization and deserialization and for serving the model
- Then finally Register the custom flavor
- Eg: sktime, is used for timeseries data, but this is not supported directly by MLflow thus if we want to use this then we will need to create a custom flavor
