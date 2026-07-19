# Pairwise Comparison

- Rather than scoring one answer, the judge compares two responses.
- This is commonly used in model benchmarking because humans and LLMs often find comparisons easier than assigning absolute scores.
- Example
- 

```python
Question:
Explain RAG.

Answer A:
...

Answer B:
...

Choose the better answer.

Explain why.

Output:
Winner: A
Reason: ...
```

- The 2 answers can come from
    - 2 different LLMs → When you want to judge which LLM is better at giving responses
    - Same LLM but different prompts→ To evaluate the accuracy of the prompt
    - Same LLM with different perpetrators