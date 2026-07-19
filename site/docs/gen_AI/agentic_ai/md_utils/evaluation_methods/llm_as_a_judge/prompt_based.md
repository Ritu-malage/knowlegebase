# Prompt based evaluation

- Workflow

```python
            User Query
                 │
                 ▼
        ┌────────────────┐
        │ Generator LLM  │
        └────────────────┘
                 │
          Generated Answer
                 │
                 ▼
        ┌────────────────┐
        │  Judge LLM     │
        └────────────────┘
                 │
      Score + Explanation
```

- Example:
    - Suppose the user asks: What is the capital of France?
    - The generator outputs: Paris is the capital of France.
    - Now we ask another LLM: whose prompt is
    - 
    
    ```python
    You are an expert evaluator.
    
    Question:
    What is the capital of France?
    
    Candidate Answer:
    Paris is the capital of France.
    
    Evaluate the answer on:
    
    1. Correctness (1-10)
    2. Completeness (1-10)
    3. Clarity (1-10)
    
    Return JSON.
    ```
    
- Output

```python
{
  "correctness": 10,
  "completeness": 10,
  "clarity": 10,
  "overall": 10,
  "reason": "The answer is factually correct and concise."
}
```