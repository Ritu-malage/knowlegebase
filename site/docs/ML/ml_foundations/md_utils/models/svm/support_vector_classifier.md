# Support Vector Classifier
- It is a classification algorithm based on the concept of [Support Vector Machines (SVM)](../svm/svm.md)
- It is used to separate data into different classes using an optimal boundary.
- Objective of SVC is to maximize the error where in SVR it is to fit as many points as possible inside the margin of error tub

# Implementation
```python
from sklearn.svm import SVC

model = SVC(kernel = "linear")
model.fit(X_train_scaled, y_train)

```
- By default the kernel = "rbf"
