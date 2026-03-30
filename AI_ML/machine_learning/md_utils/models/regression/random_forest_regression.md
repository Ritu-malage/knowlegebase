# Random Forest Regression
- Its a type of ensemble learning i.e. using multiple models together to a stronger output
- In Random Forest Regression, instead of using 1 decision tree multiple decision trees are used to predict a continuous value




# Working of Random Forest Regression

1. **Sampling the data**
   - Randomly select K data points from the dataset 
   - This subset is used to train one regression tree 

2. **Building multiple trees**
   - Decide on the number of trees, say N.
   - Repeat the sampling process N times, creating N different datasets.
   - Train one regression tree on each dataset.

3. **Prediction phase**
   - For a new unseen data point, pass it through all N trees.
   - Each tree produces its own prediction.

4. **Aggregation**
   - Take the **average** of all predictions from the N trees.
   - This averaged result is the final prediction.

5. **Accuracy improvement**
   - Averaging across many trees reduces the impact of errors from any single tree.
   - The ensemble effect makes the model more robust and less prone to overfitting compared to a single decision tree.


# Why Ensemble Methods Produce More Accurate Results

- **Reduced reliance on a single model**  
	- Predictions are not determined by just one model, but by the collective output of many.

- **Robustness to data variations**  
	- Small changes in the dataset may heavily influence a single model, but ensembles are built on multiple subsets of the data, making them less sensitive to such fluctuations.

- **Balanced decision-making**  
	- The final prediction is an aggregate of several models, so it is not dominated by the errors or biases of any one model.

# Advantages
- Handles non-linear relationships
- Works well with large datasets
- Less prone to overfitting than a single tree
- Handles outliers and noise better
- No need for feature scaling

# Limitations
- Slower (many trees)
- Less interpretable than a single decision tree
- Can still overfit if trees are too deep


# Important Hyperparameters
- `n_estimators` → number of trees
- `max_depth` → depth of each tree
- `max_features` → number of features per split
- `min_samples_split` → minimum samples to split


# Implementation
- [Predicting the Salary of an individual given the level](./practicals/random_forest_regression.ipynb)