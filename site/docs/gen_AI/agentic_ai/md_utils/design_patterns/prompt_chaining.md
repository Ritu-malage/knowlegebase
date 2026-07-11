# Prompt Chaining

- Complex tasks are divided into smaller prompts, where the output of one becomes the input for the next
- Instead of asking a language model to handle everything at once, the process guides it through a sequence of focused steps
- Breaking tasks into smaller prompts ensures each step is simpler and more reliable.

```
Task → Prompt 1 → Prompt 2 → Prompt 3 → Final output
```

- Example: Breaking down a large prompt into smaller ones
  - Large prompt:  Can you read the review, identify the problem and catgeorize it. Additionally suggest improvement and generate an email response.
  - Sequence of smaller prompts:
    - Prompt 1: Extract the main complaints from this review
    - Prompt 2: Categorize these complaints using the output of Prompt 1
    - Prompt 3: Suggest improvements based on the categorized complaints
    - Prompt 4: Generate an email response using the refined information


## Why avoid a single large prompt?

A single, oversized prompt often:

- Combines multiple objectives into one
- Becomes harder for the model to interpret
- Makes debugging more challenging
- Produces results that may vary or lack consistency



## When to use?

- The task has clear sequential steps
- Each step relies on the output of the previous one
- Predictable and consistent outputs are desired
