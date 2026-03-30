# Feature scaling

- When training a model with multiple features, it is important that all features are within the **same range and unit** so they can be meaningfully compared.  
- For instance, we cannot directly compare 60 minutes with 70 seconds and conclude that 70 is greater than 60. This is incorrect because the two values are expressed in different units.  
- To compare them meaningfully, they must first be converted to the same scale and this is what feature scaling does  
- It transforms features so that the dataset is placed on a **consistent scale**.  
- If a feature is normalized during training, it must also be normalized during prediction to ensure consistency.  
- Without normalization, the model may struggle to **converge**.  
- Normalization generally helps the model train **faster and more efficiently**.  
- Even when performing a **train-test split**, normalization should be applied **only on the training set**. The same scalar must then be used to transform the test set to avoid data leakage. 
- Its always applied to the columns of the dataset and not on rows
- **Note: Feature scaling must be applied only after splitting the dataset into train and test**
- Only continuous variables must be scaled, dont scaled those features which are one hot encoded as they are already brought down to a range.
- Dont scale the features which are label encoded as they already have some order maintained, as index values, so scaling them will not remove the order dependency


# Why Feature scaling must be applied only after splitting the dataset into train and test?
- Test set is used for evaluation, it must not be exposed during the training the process
- So if its done even before the split, we are exposing our test set thus causing data leakage


# Advantages of Feature Scaling
- Helps the model to **converge faster** during training
- When different features have **different ranges the gradient descent can bounce** thus resulting in slower convergence. But this can be overcome by using advanced optimizers like Adagrad and Adam as they change the learning rate over time
- **Predictions** will be **better**
- With different ranges the model will **pay attention to higher range values** over the smaller range values. For eg: If the range of feature1 is -0.5 to 0.5 and feature2 is between -5 to +5. If these features are passed as it is to the model, the model will interpret it as feature2 is 10 times more important than feature1.


# Why is feature scaling not applied for all the ML models?
- Because some machine learning models are inherently insensitive to the scale of features, while others rely heavily on it. 
- Scaling is crucial for distance-based and gradient-based models, but tree-based models generally don’t need it.
- Skip scaling for: Decision Trees, Random Forests, Gradient Boosted Trees.
- Always scale for: KNN, K-Means, PCA, SVM, Logistic Regression, Neural Networks.

# Types of Feature Scaling
1. [Normalization](normalization.md) (Min Max Normalization)
2. [Standardization](standardization.md) (Z-score Scaling)
3. [Robust Scaling](robust_scaling.md)



