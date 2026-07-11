# Parallelization

- Multiple independent tasks are executed at the same time, and their results are later combined
- Instead of waiting for one task to finish before starting another, several tasks run concurrently

```jsx
          User Request
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
 Research   Search   Summarize
      │        │        │
      └────────┼────────┘
               ▼
         Combine Results
```

- This approach reduces latency by overlapping execution
- It is effective when tasks do not rely on each other’s outputs

## When to use it?

- Tasks are independent and can run simultaneously
- Faster response time is desired by reducing waiting periods