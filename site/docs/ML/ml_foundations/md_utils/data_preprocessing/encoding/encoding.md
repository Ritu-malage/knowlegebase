# Encoding

- Encoding refers to **converting categorical or non-numeric data into numerical** vectors that a model can process.  
- Machine learning models can only train on **floating-point values**, not raw strings like "dog" or "cat".  
- Each category is treated as a separate feature, and during training, the model assigns **different weights** to each category.  

# Types of Encoding
1. [Ordinal Encoding](ordinal_encoding.md)
2. [One-Hot Encoding](one_hot_encoding.md)
3. Multi-Hot Encoding
	- Similar to one-hot encoding, but **multiple positions can be set to 1**.  
4. Embeddings
5. [Binary encoding](binary_encoding.md)
6. [Dummy Variable Encoding](dummy_variable_encoding.md)
7. [Label Encoding](label_encoding.md)


# Benefits of using encoding
- It reduces the number of dimensions/categories/unqiue values under a feature.
- This will help the model train faster.

# Column Tranformer
- Its a tool in scikit-learn that allows us to apply different preprocessing steps to different columns of your dataset in one unified pipeline. 
- Useful when you have mixture of different types of features that will need different kinds of transformations

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Suppose your dataset has numeric and categorical columns
numeric_features = ["Age", "Fare"]
categorical_features = ["Sex", "Embarked"]

# Define transformations
preprocessor = ColumnTransformer(
    transformers=[
		# (name of the transformer, transformer, list of columns on which the transformation must be applied)
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(), categorical_features)
    ],
    remainder="passthrough"   # keep other columns unchanged
)

# Fit and transform training data
X_train_processed = preprocessor.fit_transform(X_train)
X_test_processed = preprocessor.transform(X_test)
```

# Questions
## Can you apply 2 different transformations on the same column using `ColumnTransformer`?
- No. Column transformer applies all the transformations in parallel. 
```python
transformer = ColumnTransformer(transformers = 
                            [
                                ("mean_imputer", SimpleImputer(strategy = "mean"), ["Age"]),
                                ("unknown_class_imputer", SimpleImputer(strategy = "constant", fill_value = "Unknown"), ["Sex", "Colour"]),
                                ("encoder", OrdinalEncoder(),["Sex", "Colour"]) ,
                                ("scaler", StandardScaler(), ["Age", "Fare"]),
                                
                            ], 
                            remainder = "passthrough"
                           )
```
- Here the columns Age is undergoing 2 transformation i.e. Simple imputations for imputing the NANs with the mean and to scale the values using StandardScaler. 
- In this case even after applying the transformations we might get to see non scaled values or NAN values, as both are running in parallel
- Instead you will have to use `Pipeline` which will help in running all the steps specified within the pipeline in the sequential manner

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder, StandardScaler

# Pipelines for each type of column
num_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="mean")),
    ("scaler", StandardScaler())
])

cat_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
    ("encoder", OrdinalEncoder())
])


# Combine everything
transformer = ColumnTransformer(
    transformers=[
        ("numerical_transformer", num_pipeline, ["Age", "Fare"]),
        ("categorical_transformer", cat_pipeline, ["Sex", "Colour"]),
    ],
    remainder="passthrough"
)

```
- So in this case numerical_transformation is applied on columns Age and Fare by first imputing the NANs with the mean and then applies Scaling to it
