# XGBoost
- eXtreme Gradient Boosting
- Can be used for both regression and classification
- It is a widely used machine learning algorithm
- It builds a model by combining many small   one after the other to improve predictions step-by-step
- Each  tree aims at correcting the errors made by the previous trees
- It’s an advanced implementation of
- Models are built sequentially


# How it works

- Start with the initial value
- Calculate the errors
- Train a new decision tree to predict those errors
- Add this tree to the model with a small weight
- Repeat this many number of times


# Implementation of XGBoost for classification
```python
from xgboost import XGBClassifier
model = XGBClassifier()

model.fit_transform(X_train, y_train)
```

# Implementation of XGBoost for regression
```python
from xgboost import XGBRegressor
model = XGBRegressor()

model.fit_transform(X_train, y_train)
```