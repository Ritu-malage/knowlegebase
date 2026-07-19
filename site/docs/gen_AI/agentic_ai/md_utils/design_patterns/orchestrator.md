# Orchestrator

- Router decides who should do the whole task whereas orchestrator decides how to break the task amongst different agents and give it to the respective agents
- Example: If the manager is asked to collect all the information
    - Then manger himself will not have the full information
    - So he goes and gets updates from each of the team leads and then club all the information them give the result
- 
    
```jsx
              User Task
                  │
                  ▼
            Orchestrator
            ┌─────┼─────┐
            ▼     ▼     ▼
         Worker Worker Worker
            └─────┼─────┘
                  ▼
           Final Assembly
```
    
- The orchestrator continuously coordinates the work.