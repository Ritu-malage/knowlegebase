# One Hot Encoding
- Represents categorical data as a **binary vector**.  
- Each unique category corresponds to a vector of length `N` (where `N` = number of unique categories).  
- Exactly **one element is set to 1**, and the rest are 0.  
- For instance if the feature "skill level" contains 3 categories then its one hot encoding would be
  - beginner → [1, 0, 0]  
  - intermediate → [0, 1, 0]  
  - professional → [0, 0, 1]  
- Each vector element is treated as a separate feature with its own weight i.e. the dimension of the vector is 3 and in the dataset it will be stored as 3 different columns/ features


# When to Use One-Hot Encoding
- Works well when the **number of categories is small**.  
- Not efficient when categories are numerous, since vector length increases with categories.  
- High dimensionality leads to **greater memory usage** and **higher training costs**.  
- Dimensionality reduction techniques may be needed before training.  

# Implementation

```python
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

from sklearn.impute import SimpleImputer

column_transformer = ColumnTransformer(
    transformers=[
        ("num", SimpleImputer(strategy="mean"), ["age", "salary"]),   # numeric columns
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"])     # categorical columns
    ],
    remainder="passthrough"  # keep other columns unchanged
)

df = column_transformer.fit_transform(df)

```
- The above script will apply Simple Imputer for the columns age and salary and One hotencoder is applied to the city column
- Note: When OneHotEncoder is applied on the city column it will create additional columns which will be equal to the no of classes/ categories that exists in the City column
- `ColumnTransformer()` is a scikit-learn tool which allows you to apply different preprocessing or transformations steps to different columns of your dataset 
- It takes 2 arguments
	- transformers
		- Takes 3 arguments
			1. Name
				- Name that you want to assign to your transformer
				- This is just an identifier
			2. Transformer
				- The actual transformation you want to apply
				- Eg: StandardScaler(), OneHotEncodder() etc
			3. Columns
				- List of column Names for which the transformation must be applied


# Sparse Representation of a Vector

- Many categorical features are **sparse** (most values are 0).  
- Sparse representation stores only the **indices of non-zero values** instead of the full vector.  
- Example:  
  - One-hot encoding for *intermediate* → [0, 0, 1] → Sparse representation = {2}.  
  - Multi-hot encoding [1, 0, 0, 1, 0] → Sparse representation = {0, 3}.  
- Sparse representation saves **memory** compared to full vectors.  
- However, it cannot be directly fed into the model, since the model may incorrectly infer **numerical relationships** between categories.  