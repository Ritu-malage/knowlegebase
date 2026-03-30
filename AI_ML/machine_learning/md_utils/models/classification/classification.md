# Classification
- Classification is used to predict the category whereas regression is used to predict a continuous value
- **Supervised learning** algorithm. Thus the model learns from the output labels.
- The output labels can be numeric or non numeric
- More than 1 feature can be given to the model
- The **output range is finite** unlike in the case of regression model.
- Eg: Breast cancer detection (Whether the tumor is malignant or benign, output label will have maligant = 0, or benign = 1), Cat v/s Dog classification
- Classification models include linear models like Logistic Regression, SVM, and nonlinear ones like K-NN, Kernel SVM and Random Forests.


# Differences between Classification and Regression

| Classification | Regression |
| --- | --- |
| The output label is finite | Output labels are infinite |
| Output lables can be categorical or numerical | Output labels are always numerical |

# Multi Class classification

- **More than 2 classes**/ labels are present
- The **classes are mutually exclusive**. Which implies that a same sample cannot have 2 labels.
- For eg: Digit classification. Each image will be classified as either of the one classes between 0-9.

# Multi Label Classification

- When a sample can be **assigned to more than 1 label**/ class
- The **classes** are **not mutually exclusive**.
- For eg: Checking if the image has dog, cat, man, ball etc. Here the same image can have all of these present

# Logistic Regression

- Predicts a categorical variable
- It’s a type of classification model
- Logistic curve is called as the sigmoid curve
- Logistic regression gives a pro ability
- Feature scaling must be applied

# Formula

$\frac{p}{1-p} = b + w_1*X_{1} + w_2*X_{2}… + w_{n}*X_{n}$


# Types of classification models
- [KNN](./knn.md)
- [Support Vector Classifier](./support_vector_classifier.md)
- [Naive Bayes](./naive_bayes.md)

# Confusion Matrix
- A confusion matrix is a table used to evaluate the performance of a classification model by comparing actual vs predicted labels.
- It tells you not just how many predictions are correct, but also what kinds of mistakes the model is making.
- Accuracy only tells how many were correct, whereas confusion matrix tells exactly where the model went wrong
- Helps in predicting important metrics like Accuracy, Recall, F1 score, and Precision
- For a Binary classification

||Predicted as Positive| Predicted as Negative|
|---|---|---|
|Actual Positive|TP|FN|
|Actual Negative|FP|TN|

- Where, 
    - True Positive (TP) → Correctly predicted positive
    - True Negative (TN) → Correctly predicted negative
    - False Positive (FP) → Incorrectly predicted positive (Type I error)
    - False Negative (FN) → Incorrectly predicted negative (Type II error)
- Example of a model predicting whether the mail is spam or not. Here mail being a spam is a positive class
    - TP → Spam mail identified as spam
    - TN → A non spam mail was predicted correctly as not a spam
    - FP → A non spam mail detected as spam
    - FN → A spam mail was predicted incorrectly as not a spam

# When is confusion matrix used?
- Only in classification problems, it is not used in regression
- For evaluating the model
