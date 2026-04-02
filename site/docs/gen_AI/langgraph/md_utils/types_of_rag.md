# Types of RAG
1. Simple RAG
2. CRAG
3. Self RAG

# Disadvatages of RAG
- In the RAG workflow we assume that the documents that are retrived are correct
- But if these documents are wrong the LLM will answer the question wrongly as its biased and forced to answer using the given context
- RAG retrieves even when its not necessary. For example to answer how much seconds is 1 min, RAG was not required, as LLM already knew the answer, the fetching of documents was unnecessary

# CRAG
- Corrective RAG
- In RAG the retrieved documents are directly passed to the LLM, but in CRAG is it not passed directly
- Instead the retrieved documents are passed to another model called retrieval evaluator
- The retrieval evaluator will evaluate and check if the retrieved documents are really helpful in answering the given query or not
- The result of this evaluation can be that the documents are  
    - Relevant
        - It works like a normal RAG
    - Not relevant
        - Then it relies on external knowledge sources like web search etc, to fetch relevant information
    - Ambiguious
        - Few documents will be relevant and a few will not be
        - In this case it will act as a RAG and also will go and fetch information from the web to fetch relevant information

# Knowledge refinement
- It is one of the steps thats undertaken in CRAG
- When the retrieved documents are relevant then it undergoes knowledge refinement
- Not all the parts in the retrieved document might be required to answer the given query so only the relevant part is extracted
- There are 3 steps in Knowlege refinement i.e.
    1. Decomposition
        - Breaking down the documents into smaller chunks
    2. Filteration
        - The a model is used to find which of the pairs of query and chunks are relevant
        - The relevant ones filtered 
    3. Recomposition
        - The filtered results are combined together
        


# Self RAG
- Self reflective RAG
- Here LLM will judge its own responses after each step, instead of blinding trusting the output
- It does this by answering 4 questions
    1. Should the retrieval happen or not
    2. Are the documents retrieved relevant?
    3. Are the responses to the question all from the provided document or has it halucinated any specific part. Sometimes it might additionally adds something what it knows and this will result in halucination as its out of the provided evidence of documents
    4. Does the response actually answers the users question
