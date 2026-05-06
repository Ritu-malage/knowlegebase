# PCA

- Principal component analysis
- It’s a feature extraction technique
- It is mostly used Dimensionality reduction technique
- It’s used in unsupervised learning algorithms
- It is an unsupervised learning algorithm
- It is a way to **reduce the number of features** in your data while keeping as much useful information (variance) as possible.
- The main goal of PCA is to identify patterns within the data and to detect the correlation between the variables
- If at all there is a strong relation between the two variables, then the dimension can be reduced
- In PCA, we reduce the dimension D of the data set  by projecting it onto a K dimensional subspace Where K is less than D
- PCA finds directions that maximize variances
- It is like viewing the same data, but in different perspectives, each perspective will result in a different  component
- The total possible number of  components is less than or equal to the total number of features
- Each of the principal components must be independent of the others. This property is known as orthogonal property.
- All preprocessing steps(scaling, train test split) must be done prior to PCA
- In PCA we are reducing the features and creating new features called principal components
- That is input features X1,X2,X3… will be converted to PC1,PC2,….. Where each Principal component is a linear relationship of individual features
- PCA must be applied before training as you want to reduce the no of features even before training
- The top most Principal Component will have the highest Variance
- So if n components is chosen as 10 then top 10 principal components with highest variances
- PCA must be fit only on train thus we use fit_transform on train and transform on test
- The data must be scaled before applied PCA

```python
from sklearn.decomposition import PCA
pca = PCA(n_components = 2) # No of top components you want to retain

# Fitting PCA on train set
X_train = pca.fit_transform(X_train)


# Transforming test set using PCA
X_test = pca.transform(X_test)
```

# How to decide the total number of principal components?

- After fitting the PCA model we analyse  how much variance each component results in

```python
pca.explained_variance_ratio_
```

- The output will be
    - PC1 → 50%
    - PC2 → 25%
    - PC3 → 15%
    - PC4 → 5%
- Then find the cumulative variance

```python
import numpy as np
np.cumsum(pca.explained_variance_ratio_)
```

- Choose the smallest **k** such that:
    - The cumulative variance is  90%–95% variance → common choice
    - Choose 99% cumulative variance → if you want minimal information loss
- For the above example the cumulative variance of PC1+PC2+PC3 = 90% thus the k value will be 3

# Option 2: **Scree Plot (visual method)**

- 
- X-axis → number of components
- Y-axis → explained variance
- Look for the **“elbow point”**: Where variance gain slows down sharply
- Keep components before that point

# **Use
n_components
as variance threshold**

- Simplest option

```python
PCA(n_components=0.95)
```

- Automatically picks optimal k

# **Based on model performance (very practical)**

- Train your model with different values of k and then measure the model performance
- Choose k that gives best performance

# Why PCA?

- To avoid overfitting
- To reduce the number of features


# Where is it used?

- For visualisation
- Stock market prediction
- Feature extraction
- Noise filtering
- Gene data analysis


# Covariance
- Finds the relationship between the variables
- $Cov(x,y) =\frac{1}{N} \sum((x_{i} - \bar{x}) (y_{i} - \bar{y}))$
- If Cov(x,y)
    - `>` 0 = As x increases y increases
    - `<` 0 = As x increases y decreases
    - `=` 0 = No relationship exists between the 2 variables x, y



# Steps Used in PCA

- Calculate the mean for every feature and standarize the data
- Compute Covariance matrix

    ```
    | Cov(x,x) = Var(x)      Cov(x, y)            |
    | Cov(y, x)              Cov(y,y) = Var(y)    |
    ```
    - Cov(x,y) is same as Cov(y, x)
    - Dimensions of Covariance Matrix = No of features x No of features
- Calculate Eigen Vectors and Eigen Values
- Choose the Principal components
- Project the data into Principal components

# Example working of PCA
- Assume we have 2 features x, y where x = hrs studied and y = marks scored
- Dataset

```
(x,y)
(2, 4)
(4, 8)
(6, 12)
(8, 16)
(10, 20)
```

- Find the Mean
    - Mean(x) = $\frac{2+4+6+8+10}{5}$ = 6
    - Mean(y) = $\frac{4+8+12+16+20}{5}$ = 12
- Find the Cov(x,x) = Variance of X
    |x|$x-\bar{x}$ <br /> x - 6| $(x-\bar{x})(x-\bar{x})$ |
    |---|---|---|
    |2|-4|16|
    |4|-2|4|
    |6|0|0|
    |8|2|4|
    |10|4|16|
    |||sum = 40  <br /> $\frac{\sum((x_{i}-\bar{x})^2)}{N}$ = Var(x)= 40/5 = 8|
- Find the Cov(y,y) = Variance of Y
    |y|$y-\bar{y}$ <br /> y - 12|$(y-\bar{y})(y-\bar{y})$ |
    |---|---|---|
    |4|-8|64|
    |8|-4|16|
    |12|0|0|
    |16|4|16|
    |20|8|64|
    |||sum = 160 <br /> $\frac{\sum((y_{i}-\bar{y})^2)}{N}$ = Var(y) = 160/5 = 32|
- Find Cov(x, y) = Cov(y, x)

    |$(x-\bar{x}) \times (y - \bar{y})$|
    |---|
    |32|
    |8|
    |0|
    |8|
    |32|
    |sum = 80 <br /> sum/n = 16|

- Construct covariance matrix
            
    ```
    | Var(x)      Cov(x, y) |
    | Cov(x, y)   Var(y)    |
    ```
    ```
    | 8 16 |
    |16 32 |
    ```

