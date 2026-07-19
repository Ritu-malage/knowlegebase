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
- The orchestration can be done via 
    1. Code
    2. Agents as tools
    3. Agents as handoffs


## 1. Orchestration via code

- Create agents

```python
from agents import Agent

research_agent = Agent(
    name="Research Agent",
    instructions="Find information about the user's question."
)

summary_agent = Agent(
    name="Summary Agent",
    instructions="Summarize the provided information."
)

review_agent = Agent(
    name="Review Agent",
    instructions="Review the summary for correctness and clarity."
)
```

- Create an orchestrator which acts like a main function which calls the agents in an order or parallely

```python
from agents import Runner

async def orchestrator(query):

    # Step 1: Research
    research_result = await Runner.run(
        research_agent,
        query
    )

    # Step 2: Summarize
    summary_result = await Runner.run(
        summary_agent,
        research_result.final_output
    )

    # Step 3: Review
    review_result = await Runner.run(
        review_agent,
        summary_result.final_output
    )

    return review_result.final_output
```

- Run the orchestrator

```python
answer = await orchestrator("Explain Retrieval-Augmented Generation")

```

## 2. Orchestration using agents as tools

- Orchestrator has access to agents which are exposed as tools
- Which implies each tool is an agent by itself, thus it decides its own flow
- We dont define it like first call agent 1 then call agent 2 and so on
- The steps taken are non deterministic than over orchestrating via code

## 3. Orchestration using agents as handoffs

- Handoffs refer to the situation where the control is fully transferred from one agent to another
- Agent 1 may call Agent 2, but the response from Agent 2 is not returned to Agent 1; instead, Agent 2 continues handling the conversation
- Once the task is passed, the receiving agent becomes responsible for managing the interaction from that point forward
- In contrast, with tools, the orchestrator calls a tool, receives its response, and then continues the workflow itself
- Example: In a call center, a generic staff member initially answers the call and then transfers it to the appropriate specialist, who provides the solution directly.
    - This is a handoff, as the responsibility shifts to the specialist
- With tools, the generic staff member consults a domain expert for information but remains the one who communicates with the user directly.
    - The expert provides input, but does not interact with the user

```python
# Create agents
from agents import Agent

coding_agent = Agent(
    name="Coding Agent",
    instructions="You are an expert Python developer."
)

finance_agent = Agent(
    name="Finance Agent",
    instructions="Answer finance-related questions."
)

travel_agent = Agent(
    name="Travel Agent",
    instructions="Help users plan trips."
)

# Create the Main Agent
main_agent = Agent(
    name="Assistant",
    instructions="""
    Decide which specialist should handle the user's request.
    Transfer the conversation whenever appropriate.
    """,
    handoffs=[
        coding_agent,
        finance_agent,
        travel_agent,
    ],
)

# Run the Conversation
from agents import Runner

result = Runner.run_sync(
    main_agent,
    "How do I reverse a linked list in Python?"
)

print(result.final_output)
```

- What happens internally? Question: How do I reverse a linked list in Python?

```python
User
 │
 ▼
Main Agent
 │
 │ "This is a coding question."
 ▼
Handoff
 │
 ▼
Coding Agent
 │
 ▼
Generates Answer
 │
 ▼
User
```

- The coding agent becomes responsible for answering
