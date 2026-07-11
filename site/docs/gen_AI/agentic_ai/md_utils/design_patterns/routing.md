# Routing


- First identify the type of task, then direct it to the appropriate agent or workflow
- Routing determines which agent should handle the entire task, while orchestration decides how to divide the task among multiple agents and assign each part accordingly

```jsx
            User Query
                 │
                 ▼
           Routing Decision
        ┌────────┼────────┐
        ▼        ▼        ▼
   Math Agent  Coding  Travel
```

- The router decides which path to follow
- Example: In a hospital, a patient first meets the receptionist, who routes them to the correct department based on the issue without performing the treatment themselves
    - Router: Receptionist
    - This implies that Router does not do any task on its own it just deligates

# Use this approach when:
- Different requests require distinct expertise
- Specialized prompts or agents are available for specific tasks
