# Linear Discriminant Analysis LDA

- Used as dimensionality reduction technique
- The goal is to project the dataset into a lower dimensional space
- Used as a pre processing steps for pattern recognition
- It’s a supervised algorithm whereas PCA is an unsupervised learning algorithm
- PCA ignores labels, whereas LDA tries to: Project data in a way that best separates different classes
- It finds a new axis (or axes) such that:
    - **Between-class distance is maximized**
    - **Within-class spread is minimized**
- The maximum possible no of output components that can be generated in PCA is ≤ no of features whereas in LDA it is ≤ no of classes-1
- Use PCA when no label(unsupervised) exists
- Use `fit_transform()` on the train dataset and `transform()` on the test dataset to avoid leakage
- In LDA we need to provide both dependent and independent variable as it uses labels but in the case of PCA only independent variable is passed

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
lda = LDA(n_components = 2) # No of components that you want to generate

X_train = lda.fit_transform(X_train, y_train)

X_test = lda.transform(X_test) # y_test is not passed as this is the unseen data
```