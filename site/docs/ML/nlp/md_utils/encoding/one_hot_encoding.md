# One Hot Encoding

- Abbreviated as OHE
- It helps in converting the given corpus into a vector form.
- Given the corpus **find the unique set of words** (called the vocabulary)
- The **length of the vector** will be **equal** to the **no of unique words** present in the vocabulary
- Let say your corpus is "her name is maya, her dogs name is mico", then the dictionary will be ['her', 'name', 'dogs', 'is', 'maya,', 'mico']. Though words like 'name', 'her' appears 2 times in the dictionary its captured only once
- The length of the vector will be 6 as the dictionary size is 6
- Vector for the word "her" will be [1,0,0,0,0,0], only that word will have 1 and the rest will be filled with 0. For the word "name" the vector will be [0,1,0,0,0,0]
- The one hot encoding representation for the entire corpus will look like [[1,0,0,0,0,0], [0,1,0,0,0,0], [0,0,0,1,0,0]....]
- In sklearn we use `OneHotEncoder`, and in pandas we use `pd.get_dummies()`
- Each number in the vector will result in a seperate column i.e. since the vector length is 6 it implies 6 columns will be created and these will be acting as 6 features

# Advantages of One hot encoding

- Very easy to implement
- It does not introduce an false ordering as in the case of label encoding


# Disadvantages of One hot encoding

- For an ML algorithms the input size for all inputs passed must be fixed. But one hot encoding will **result in vectors of dyanmaic sizes** for example if the corpus was "her name is Maya" the vector size will be 4xlen(vocabulary), if the corpus was "her name is" then the vector size will be 3xlen(vocabulary)
- One hot encoding will result in **sparse matrix**(Mostly filled with 0's). This results in **overfitting**
- **Semantic meaning is not captured** i.e. whats the relationship between word1 and word2 in the given corpus. These are not independent words
- **Out of vocabulary** problem (When unseen word was not a part of dictionary)
- It increases dimentionality