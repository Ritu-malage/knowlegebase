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
