# Evaluator–Optimizer

- Idea: Generate a result, evaluate it, improve it if needed, and repeat until it meets the desired quality.

```jsx
Generate
    │
    ▼
Evaluate
    │
 Good?
 ┌──┴──┐
 │     │
Yes    No
 │      │
 ▼      ▼
Done  Improve
         │
         └──────► Evaluate
```

- Introduces feedback loop
- **Example**
    - Generate code:
        1. Write the code.
        2. Run tests.
        3. If tests fail, fix the code.
        4. Run tests again.
        5. Stop when all tests pass.