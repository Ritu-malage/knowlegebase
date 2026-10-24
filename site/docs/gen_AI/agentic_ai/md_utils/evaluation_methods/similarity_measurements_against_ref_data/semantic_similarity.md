# Semantic Similarity
- Lexical similarity measures whether two texts look similar, not whether they have the same meaning.
- Consider the two sentences “What’s up?” and “How are you?” Lexi‐
cally, they are different—there’s little overlapping in the words and letters they use. However, semantically, they are close.
- Similarity similar looking texts can mean very differently. In this case lexical similarity will be high whereas semantic similarity will be less
- It requires transforming the text into numerical representation, which is called embedding
- Also called embedding similarity
- Similarity between 2 embeddings can be computed using cosine simlarity
- If 2 embeddings are exactly the same will have a similarity score of 1 
- Whereas 2 opposite embeddings have a similarity score of -1
- This similarity can be used for any data modality i.e. texts, images, audio etc
- Note: different embedding models can produce different embeddings for the same query
- An embedding algorithm is considered good if more-similar texts
have closer embeddings.

# Drawbacks
- Two texts with the same meaning can still have a low semantic similarity score if their embeddings are bad.
- Extra compute and time required to run the embedding model

# CLIP
- Contrastive Language–Image Pre-training.
- Measures how semantically similar an image and a text description are, using their vector embeddings.
- Input to this model is an image with its description
- The model uses image encoder to convert the image into vector and text encoder to convert text description into vector
- Then using the 2 vectors the similarity score is computed
- Higher similarity implies the text is highly correlated to the image
- It helps you find images closest to the text
