# Grid Search
- It is one of the methods that is used in the model selection to find the best combination of hyper parameters that must be used for a model
- Does it by trying out all possible combination from a predefined set
- Hyper parameters are those parameters which are not learnt during the training process, like number of trees, number of epochs etc
- Grid serach is applied only on the training set
- This is a part of the training process
- Instead of training on the single parameter, we are training the model will different combinations of hyperparameters and choosing the best model 


# Working

- First, defined the grid of all the hyper parameters
- Then creates all the possible combinations
- Trains and evaluate the model for each of the combination
- Pick the best combination, which results in the best performance


# Implementation
```python
from sklearn.model_selection import GridSearchCV

parameters =[
    {
        "C": [0.25, 0.5, 0.75],
        "kernel": ["linear", "rbf"]
    }
]

grid_search = GridSearchCV(
    estimator = model,
    param_grid = parameters,
    scoring = "accuracy", # Metric that must be used to evaluate the model for each combination 
    cv = 10, # No of k folds
    n_jobs = -1 # Use all the CPUs present (for faster execution)
)

grid_search.fit(X_train, y_train)

# Extract the value of the best accuracy obtained
best_accuracy = grid_search.best_score_

# Fetching the combination of hyperparameters that resulted in the best accuracy
best_parameters = grid_search.best_params_
```
- The key values will be the hyperparameter names, and the possible values that you want to test for the hyperparameter C are 0.25, 0.5, 0.75
- Lets say `gamma` is another parameter that you want to play around with different values, but this parameter is relevant only when the kernel is set to rbf then we create another dictionary 
```python
parameters =[
    {
        "C": [0.25, 0.5, 0.75],
        "kernel": ["linear"]
    },
    {
         "C": [0.25, 0.5, 0.75],
        "kernel": ["rbf"],
        "gamma": [0.1, 0.2, 0.3, 0.4, 0.5]
    }
]
```