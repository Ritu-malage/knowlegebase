# Lexical Similarity
- Measures how much two texts overlap with each other
- It measures whether 2 texts look similar
- There are different ways of computing Lexical Similarity
- Metrics used for lexical similarity are BLEU, ROUGH, METEROR++, TER, CIDEr
- Each of these differ in the way the overlap is calculated



# Ways of computing Lexical Similarity
1. Exact overlapping tokens
    - Simplest form of computing is to find the no of words that are overlapping or are in common
    - For example, consider the reference response “My cats scare the mice” and two generated responses: “My cats eat the mice”  and “Cats and mice fight all the time”.
    - Assume that each token is a word.
    - If you count overlapping of individual words only, response A contains 4 out of 5 words in the reference response (the similarity score is 80%), whereas response B contains only 3 out of 5 (the similarity score is 60%).
    - Response A is, therefore, considered more similar to the reference response.
2. Fuzzy Matching
    - Also known as approximate string matching
    - Fuzzy matching is a technique used to measure how similar two pieces of text are, even when they are not exactly the same.
    - Measures the similarity between 2 texts by counting how many edits is required to convert from 1 text to another. This distance is called edit distance
    - Unlike exact matching it can handle spelling mistakes, extra spaces, missing characters etc
    - Example if the word is "car" and predicted word is "cat" then one letter needs to change this edit distance is 1 this similarity will be higher but if the word is "elephant", then the number of edits needed will be higher due to which the similarity reduces
    - Edit operations can be anything few of them are deletion, insertion, substitution
3. N Gram similarity
    - Measure the similarity based on sequences of tokens in N grams instead of single token
    - uni gram is 1 token, bi-gram is 2 tokens, tri-gram is 3 tokens etc
    - We measure what is the percentage of N grams present in the response against the reference response

# Drawbacks
- This method requires curating a comprehensive set of reference responses.
- A good response can get a low similarity score if the reference set
doesn’t contain any response that looks like it.
- Even references can be wrong