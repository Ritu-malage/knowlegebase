# MLflow Model Evaluation
- Measures how well the models are performing with the unseen data


# `mlflow.evaluate()`
- Its an API
- Used to evaluate the MLflow models performance
- It evaluates the models based on the N no of metrices that it computes
- Eg: for classification tasks it will compute Accuracy, precision, Recall, F1 etc
- Eg: For regression it will be MSE, MAE
- It can generate various model performance graphs like confusion matrix, precision-recall curve, ROC curve etc
- Provides model explanations which will help us to analyze the results better and also identify he factors driving the prediction results for instance, SHAP, Feature importance etc
- All of the computed results, plots, explainations are all stored in MLflow tracking
- This should be used after the model is saved or logged
- Parameters
    - model
        - Model to be evaluated
        - Can be the model object or an URI pointing to the model
    - data
        - The data that must be used for evaluation
        - Can be a numpy array, pandas dataframe, spark dataframe, list of values etc
    - model_type
        - Type of the model
        - Eg: regressor, classifier, question-answering, text, text-summarization
    - targets
        - These are the list of evaluation labels
        - The type of this must be similar to the type which was passed in the data parameter
    - dataset_path
        - Optional
        - Path to the dataset
    - feature_names
        - The names of the columns
    - evaluators
        - List of evaluator names that must be used to evaulate the model
        - If we provide `mlflow.models.list_evaluators()` it will list down all the evaluators
        - If default is passed then all evaluation metrics that is supported by the model that you are using will be utilized
    - custom_metrics 
        - When you want to define your own metric then pass the name of your custom metric
    - baseline_model
        - Optional
        - If you want evaluate the models performance against a baseline model then we need to specify this attribute
    - And more...
```python

mlflow.evaluate(
    artifact_uri,
    test_dataset,
    targets = "Name of the target variable",
    model_type = "regressor",
    evaluators = ["default"]
)
```
- If we use `log_metric()` and also use `evaluate()` then the metric might be stored 2 times
- 



# `make_metric()`
- Method used to create custom metrics
- It is similar to how we create a function
- Custom metrics can also be passed to the `evaulate()` method

```python
from mlflow.models import make_metric

def metric1(y_pred, y_true):
    return y_pred - y_true

custom_metric1 = make_metric(
    eval_fn = metric1,
    greater_is_better = False,
    name = "Name of the metric"
)

result = mlflow.evaulate(
    model = model,
    data = evaluation_dataset,
    target = "label",
    model_type = "regressor",
    custom_metrics = [custom_metric1]
)
```
- Where,
    - greater_is_better is a boolean
    - If its True it implies if the metric value is higher it implies the model is better
    - Else its bad



# Custom Artifacts
- Artifacts can be user defined and can be saved 
- Lets say you want to save some extra plot as an artifact, then define the function for the plot and pass the function name in custom_artifacts parameter in `evaluate()`

```python
def plot(evaulation_dataset, artifacts_dir):
    # Code
    plt.scatter(evaluation_dataset.index, evaluation_dataset["accuracy"])
    plot_path = os.path.join(artifact_dir, "new_plot.png")
    plot.savefig(plot_path)

result = mlflow.evaulate(
    model = model,
    data = evaluation_dataset,
    target = "label",
    model_type = "regressor",
    custom_artifacts = [plot]
)

```
- This will save the plot in the artifacts directory as new_plot.png


# Setting validation thresholds for evaluating the model
- You can set the threshold value for each metric, so that while comparing between the models and the baseline model it checks for the threshold values

```python
from mlflow.models import MetricThreshold

# Defining the threshold
thresholds = {
    "mse" : MetricThreshold(
        threshold = 0.6, # The min mse threshold that must be satisfied
        min_absolute_change = 0.1, # Minimum absolute improvement compared to the baseline model
        min_relative_change = 0.05, # Minimum relative improvement compared to baseline
        greater_is_better = False # Lower the metric value better the model is
    )
}
```
- Multiple metric thresholds can be defined
- The key will be the name of the metric
- The value must be of type MetricThresholds, which has 4 parameters i.e. threshold, min_absolute_change, min_relative_change, and greater_is_better
- In this case as `greater_is_better` is set to False it implies lower the MSE then better will be the model
- So the models MSE must be less than 0.6 for it to be 
- min_absolute_change: Minimum absolute improvement that must exist between the baseline model and the current model
- min_relative_change: The minimum relative improvement that must exist for this metric between the baseline model and the current model
- This thresholds must be passed to the evaulate function
```python
mlflow.evaluate(
    model = model,
    data = evaluation_dataset,
    target = "label",
    model_type = "regressor",
    custom_artifacts = [plot],
    validation_thresholds = thresholds,
    baseline_model = "path to where the model is stored
)
```
- When you run this script and if the mse value is greater than 0.6 then it will throw an error, it implies we need to fine tune the model and perform hyperparameter tuning

