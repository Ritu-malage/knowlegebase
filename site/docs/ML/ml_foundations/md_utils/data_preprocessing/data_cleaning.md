# Data Cleaning
- Fixes the problems in the dataset
- Handle missing values
- Remove duplicates
- Fix incorrect values

# Ways to handle missing values in the dataset
1. Drop those samples whose values are missing
- This works if the dataset is large and we have only 1% of missing data
- But if you have most of the values missing then it must be handled and this method will not work

2. Fill with a stastical value
- The missing values can be replaced by either mean, median, mode
- Implementation
```python
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy="mean")

imputer.fit_transform(df[["col1", "col2"]])
```
- This will replace NA values with the mean for col1 and col2
- This will work only for numerical columns
- 