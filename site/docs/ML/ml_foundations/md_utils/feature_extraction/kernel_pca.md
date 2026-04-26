# Kernel PCA

- Kernel Principal Component Analysis
- Its a non linear extension of PCA
- It helps in performing dimensionality reduction when the data is not linearly separable
- The normal PCA works only when the data is linearly seperable, that is when the features have linear relationships
- Instead of explicitly transforming the data into a higher dimenstional space which can be expensive kernel PCA uses the kernel function 

# Implementation
- Similar to how PCA is implemented, just the KernelPCA class is used instead of PCA class and kernel parameter is passed to the function along with n_components
```python
from sklearn.decomposistion import KernelPCA

kernel_pca = KernelPCA(n_components = 2, kernel = "rbf")

X_train = kernel_pca.fit_transform(X_train)

X_test = kernel_pca.transform(X_test)
```