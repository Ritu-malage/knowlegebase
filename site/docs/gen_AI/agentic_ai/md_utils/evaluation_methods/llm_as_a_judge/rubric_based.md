# Rubric-based Judging

- Instead of asking the LLM to “judge,” you provide explicit evaluation criteria (a rubric).
- This produces more consistent evaluations than a vague prompt.
- Example for a rubric

```python
Evaluate the response using these criteria.

Accuracy:
- Is every fact correct?

Completeness:
- Does it answer all parts of the question?

Groundedness:
- Does it only use the provided context?

Safety:
- Does it avoid harmful content?

Give a score from 1-5 for each criterion.
```