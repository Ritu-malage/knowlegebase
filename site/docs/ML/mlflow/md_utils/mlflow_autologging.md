# MLFlow Auto Logging
- MLFlow Automatically logs a very certain parameters, metrics, artifacts without explicitly writing code for the same
- No manual logging like `mlflow.log_metrics()`, `mlflow.log_artifacts` etc is required. 
- Manual logging will be time consuming when there is so much to log. This also makes the code very lengthly
- Autologging captures information during the run time itself


# Ways to use auto logging
1. `mlflow.autolog()`
2. `mlflow.<lib>.autolog()`
    - Its a library specific auto logging
    - When you dont want to log everything thats used and is supported by MLFlow autologging then use library specific auto logging
    
# `autolog()`
- Based on the libraries you are using it will log its specific information
- Its like a generic function that can be used across various libraries
- When you want to log for all the libraries that "mlflow autologging" supports, use this
- Parameters
    - log_models 
        - Boolean flag to specify if the model must be logged or not
        - Default: True
    - log_input_examples 
        - Boolean flag to state if the input examples thats used during the training along with artifacts must be stored or not
        - Default: False
        - If this parameter is set to True then log_models must also be set to True
        - When set to True it will create a new file under the artifacts/models directory called input_examples.json, this will contain sample rows from the input dataset
    - log_model_signatures
        - Boolean flag indicating whether the model signature — i.e., the input schema (format and data types of inputs) and the output schema (format and data types of predictions) — should be logged.
        - Default: True
        - If this is set to True then log_models must also be set to True
    - log_datasets
        - Set to True if the dataset(test, train) related information must be logged
        - Default: True
    - disable
        - If you want to disable all the auto logging functionalities then set this to True
        - Default: False
    - exclusive
        - The exclusive parameter controls whether MLflow should log ONLY what autologging captures, or also allow your manual logging to be added.
        - Default: False
    - disable_for_unsupported_versions
        - Set to True to disable auto logging for those libraries MLFlow is not compatible with
        - Default: False
    - silent
        - Set to True to supress all the warnings that comes up while logging the errors
        - Defaults: False
- Input dataset cannot be logged automatically thus we will need to manually log it if required, but it can autolog train and test dataset
- Autologging will work best for standard models, but if you create your own customized model, and change its behaviour of logging then use customized logging over autologging
- Autologging will not work if its written after `model.fit()`. This is because tracking happens during the fitting of the model
- Even if included after fitting the model then it will successfully run but no logging would have happened. 

```python
mlflow.autolog()
lr = ElasticNet()
lr.fit(train_X, train_y)
```
- If you open this run in the UI you will be able to see datasets, parameters, metrics etc being logged
- It also logs all the default parameters with its default name


# `sklearn.autolog()`
- Enables auto logging for sklearn library
- Parameters
    - max_tuning_runs
        - Controls how many child MLflow runs can be created
        - Usually used when we are doing hperparameter tuning, small changes in values will result in N no of runs, this might be very difficult to maintain, so we can limit the no of sub runs that are being created
        - Hyper parameter tuning can easily create 1000+ combinations and for each of these combinations MLFlow will create a new run 
        - Default = 5
    - log_post_training_metrics
        - Set tot True to log post training metrices like MAE, RMSE, MAP etc
        - Default: True
    - serialization_format
        - Controls how the trained model from sklearn must be serialized(file format - eg: .pkl) when it logs as an artifact
        - Different serialization formats effects the file size, loading speed, compatibility, portibility, performanace etc
        - Few possible values are:
            - pickle
            - joblib
            - cloudpickle
    - registered_model_name
        - Name of the model to be registered
        - Tells MLflow to automatically register the logged model into the MLflow Model Registry with a given name.
        - It creates if it does not exist
        - A new model version is created everytime the model is logged
    - pos_label
        - Used in binary classififcation problems
        - Specifies the positive label
        - If this is used for other type of problems then logging will fail, but for regression models this parameter will be ignore
```
mlflow.sklearn.autolog()
lr = ElasticNet()
lr.fit(train_X, train_y)
```
- In the UI you will be able to see the logged results in the specific run



