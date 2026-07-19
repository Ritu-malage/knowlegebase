# Reference-based Evaluation

- Here, the judge also receives the expected (gold) answer.
- This is useful for evaluating question-answering systems.
- Prompt

```python
Question:
...

Expected Answer:
...

Candidate Answer:
...

Compare the candidate with the expected answer.

Evaluate:

- Correctness
- Missing information
- Extra hallucinated information
```