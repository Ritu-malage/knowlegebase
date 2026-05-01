# Label Encoder
- Coverts categorical labels into numerical codes
- Its mainly used for encoding the target variable y and not feature columns X
- For encoding of the categorical features you should use the other encoders

# Can you use the same label encoder for encoding multiple columns
- No because if you use `LabelEncoder` on multiple columns, you need a separate encoder instance for each column, otherwise the mappings get overwritten.
- Example
    - Say the 2 categorical columns were Sex (Male, Female) and Colours (Red, Blue, Green)

```python
from sklearn.preprocessing import LabelEncoder

# Defining the encoder instance
encoder = LabelEncoder()

# Encoding the Sex column
X_train["Sex"] = encoder.fit_transform(X_train["Sex"])
print(encoder.classes_) # array(["Male", "Female"])

# Encoding the Colour Coloumn using the same encoder results in overwriting the previously encoded results
X_train["Colour"] = encoder.fit_transform(X_train["Colour"])
print(encoder.classes_) # array(["Red", "Blue", "Green"])
```
- After this if we try to apply the transformation on the test set it will throw an error saying "y contains previously unseen labels: 'male' or 'female'"

```python
X_test["Sex"]= encoder.transform(X_test["Sex"]) # Error

X_test["Colour"]= encoder.transform(X_test["Colour"]) # No error 
```

# Implementation
```python 
from sklearn.preprocessing import LabelEncoder

encoder = LabelEncoder()

y_encoded = encoder.fit_transform(y)
print("Encoded Value", y_encoded)
print("Classes encoded", encoder.classes_)
```
