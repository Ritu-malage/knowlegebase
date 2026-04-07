# Introduction

## What is Generative AI?
Generative AI is a subset of AI that creates new content such as text, images, audio, or code.


## Traditional AI vs Generative AI
| Traditional AI | Generative AI |
| ----------| ---------- |
| Learns patterns in data| Learns the data distribution |
| Makes predictions | Generates new samples |
| Output is usually a label/value | Output is new content |
| Example: Traditional ML: Given image → predict “cat” |Example: Generative AI: Learns from many cat images → generates a new cat image |


# Normal AI Chatbot vs Agentic AI Chatbot
1. Normal AI Chatbot
- Reacts only to user input
- Requires explicit step-by-step instructions
- No autonomous planning (Cannot do it by its own)
- Example: User: First search X, then summarize, then send email. The chatbot follows exactly what is written.

2. Agentic AI Chatbot
- You provide only the end goal
- It decides how to achieve the goal
- Creates its own plan
- Executes multiple steps autonomously
- Maintains context across steps
- Can revise its strategy
- Example: 
    - User: “Hire a backend engineer in India”
    - The agent:
        - Creates hiring plan
        - Posts job
        - Screens resumes
        - Shortlists candidates


# Agentic AI
- Agentic AI is a subset of AI systems that:
    - Accept a goal
    - Plan actions
    - Execute steps
    - Adapt to changes
    - Minimize human intervention
- It only seeks human help when required.

# Key Characteristics of Agentic Systems
- How do we differentiate agentic vs non-agentic systems?
- An agentic system typically has:
1. Autonomy
    - Does not require step-by-step instructions
    - Proactively decides next actions
2. Goal-Oriented Behavior
    - Works toward a defined objective
    - Goals may include constraints
    - Example: “Hire a backend engineer” v/s “Hire a backend engineer in India”
3. Planning
    - Breaks high-level goal into smaller tasks
    - Generates multiple plans called candidate plans
    - Evaluates plans based on:
        - Cost
        - Efficiency
        - Tool availability (Whether all the tools required to achieve the plan exists or not)
        - Selects the optimal plan
4. Reasoning
    - Makes logical decisions
    - Evaluates intermediate results
5. Adaptability
    - Modifies plan if conditions change
    - Handles unexpected scenarios
    - Stays aligned with the final goal
6. Context Awareness
    - Maintains memory of previous steps
    - Understands conversation history


# Controlling Autonomy
- Autonomy can be dangerous, eg: An agent posting job openings without approval.

## Ways to Control Autonomy
1. Define scope
    - Specify what decisions agent can take independently
    - Specify when human approval is required
2. Guardrails & Policies
    - Define strict rules
    - Add validation checks
    - Restrict tool access
3. Human-in-the-Loop
    - Require manual approval for sensitive actions

# Components of an Agentic AI system
1. Brain
    - Brain usually will be the LLM
    - Iterprets the goals 
    - Creates plans
    - Selects tools
    - Heavy lifting is done by the brain
2. Orchestrator
    - Executes the plan created by the LLM
    - Manages the execution order
    - Handles 
        - Conditional routing
        - Loop
        - Retries
        - Delegation
3. Tools
    - Performs external calls
    - Extracting company specific information via RAG will also be considered as the tool
4. Memory
    - Short term memory, Long term memory, and state tracking
5. Supervisor
    - Human in the loop can be implemented using Supervisor


# LangChain
- LangChain is an open-source framework used to build LLM-based applications.
- Simple agents can also be created using LangChains


## Core Components of LangChain
1. Models
    - Any LLM model can be used
    - Migrating between LLMs will not be a hassle
2. Prompts
3. Retrievers
4. Chains
    - Helps in connecting multiple components together
    - The output of one component of the chain will be passed onto the next component of the chain


## Limitations of Building Agents Using LangChain
- Primarily known for linear workflow, thus implementing complex workflow will be difficult
- No native support for complex loops
- Conditional routing is limited
- State management must be handled manually
- Fault tolerance is limited (cannot resume from where it breaks)
- Hard to pause and resume long-running workflows. 
- Maintenance becomes complex for multi-step systems



# LangGraph
- LangGraph is an orchestration framework built on top of LangChain.
- It uses a graph-based execution model. Due to which its easier to implement complex non linear workflows
- In LangGraph there are helper constructs for running loops, running conditional branches etc. but in LangChain its not present
- Using LangGraph we can create a single or a multi agent system

## Core components
1. Nodes
    - Each task (python function) is a node
    - Every node will have the state input 
    - Every node will output a state
    - Every node will have access to the state and can update the state
2. Edges
    - Connect nodes
    - Defines the execution flow
    - Support:
        - Loops
        - Conditional branches
        - Parallel paths
3. State
    - Its a shared memory that flows through your entire workflow
    - It stores all the data that is passed between nodes and maintains the execution context of the system.
    - It can be of typedict or a pydantic model
    - Every node takes state as an input, modifies it and returns the updates state as an output
    - Its like a shared memory that every node can read and update
    - It is represented as key–value pairs.
4. Reducers
    - Reducers define how updates to the state should be applied when multiple nodes modify the same key.
    - By default, state updates may overwrite previous values. However, in many workflows, overwriting can cause loss of important information.
    - Reducers help control whether values should:
        - Overwrite
        - Append
        - Merge
        - Combine in a custom way
    - Consider a state key called message.
    - Scenario Without Reducer
        - Node 1 updates: message -> Hi my name is John
        - Node 2 updates: message → "Sup, how are you?"
        - The second update overwrites the first message.
        - Now if: node 3 asks "What is my name?"
        - The system cannot answer correctly because the earlier message was overwritten.
    - How reducers solve this?
        - Instead of overwriting, a reducer can:
        - Append messages to a list
        - Merge previous and new values
        - Maintain full conversation history
        - This ensures no loss of context.
    - Each key in the state can have its own reducer.
    - Different keys may require different update strategies.
    

## Why LangGraph is Better for Agents?
LangGraph provides
- Built-in loop handling
- Conditional routing
- Stateful execution
- Checkpointing
- Fault tolerance
- Pause and resume capability
- Human-in-the-loop support
- Subgraphs (nested reusable workflows)
- Multi-agent system support



# Difference between LangChain and LangGraph
| LangChain                  | LangGraph                        |
| -------------------------- | -------------------------------- |
| Linear execution           | Graph-based execution            |
| Stateless                  | Stateful                         |
| Limited loop support       | Native loop constructs           |
| Manual state handling      | Shared state object              |
| Limited fault tolerance    | Checkpointing & recovery         |
| Hard to pause & resume     | Supports pause & resume          |
| Nested workflows difficult | Supports subgraphs               |
| Best for simple workflows  | Best for complex agentic systems |


# When to use LangChain and when to use LangGraph?
Use LangChain When:
- Building simple LLM pipelines
- Basic RAG applications
- Single-step workflows
- No complex loops required
Use LangGraph When:
- Building agentic systems
- Need loops and conditional paths
- Multi-agent workflows
- Human-in-the-loop
- Long-running workflows
- Production-grade orchestration


# LLM Workflows
- Workflow: Series of tasks executed in a structured manner to achieve a specific goal.
- LLM Workflow: An LLM Workflow is a structured sequence of tasks that involve one or more Large Language Models (LLMs) to accomplish a goal.
- Each step in the workflow will be executing different sets of tasks like prompting, tool cooling, decision making etc
- Workflows can be linear, parallel, branched, looped etc
- There can exist common workflows

# Common workflows
1. Prompt chaining
    - An LLM Workflow is a structured sequence of tasks that involve one or more Large Language Models (LLMs) to accomplish a goal.
    - Input -> LLM1 -> LLM2 -> LLM3 
2. Routing
    - The system decides which LLM (or tool) should handle the request based on the input.
    - A decision LLM (or classifier) analyzes the input and routes it to the appropriate model.
    - Input → Router LLM → Selected LLM → Output
3. Parallelization
    - A single large task is broken into multiple smaller independent subtasks.
    - Each subtask is processed in parallel by different LLM calls.
    - After completion, the results are aggregated into the final output.
4. Orchestrator Workers
    - Its similar to parallelization workflows
    - Just that the parallel LLMs tasks are not fixed
    - Here the parallel LLMs tasks are dynamically assigned based on the nature of the task
    - Input -> Orchestrator -> Parallel LLM calls are made -> Aggregate the results -> Output
5. Evaluator Optimizer
    - The response provided by LLM at first go will not be the best one
    - 2 LLMs are involved one is the generator LLM which generates the results and the other is the evalutor LLM which will evaulate the results
    - So there will be an Evaluator LLM, which evaultes the response, and sends the generator LLMs a feedback, and the LLM generator will process the feedback and regenerate the results again
    - This process will go on in loop until the generated results is accepted by the evaluator LLM

# Observability
- Observability refers to the ability to monitor and analyze what happens at each step of a workflow or system.
- Responses generated by LLMs are non-deterministic, meaning that the same question asked multiple times may produce different answers.
- The observability platform that works with both LangChain and LangGraph is LangSmith.
- The following four environment variables must be configured(`.env` file). Once they are set, the traces will automatically appear in the LangSmith dashboard under the project name specified in the `LANGSMITH_PROJECT` variable.
- Using LangSmith, you will be able to monitor details such as:
    - The query that was asked
    - The response generated by the model
    - The time taken to produce the response
    - The number of tokens consumed
    - The steps on how the tool calling is happening
```
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="KEY"
LANGSMITH_PROJECT="Name of the project"
``` 
- This will store all the sessions information in a single project
- But if you want to see how must each thread is consuming then we will need to pass metadata in the config variable so that in LangGraph under the projects> Threads you will be able to see thread specific information
```python
config = {
    "configurable": {"thread_id": st.session_state["thread_id"]},
    "metadata": {"thread_id": st.session_state["thread_id"]},
}

```

# Sub‑Graphs
- A node within a graph can itself represent another graph.
- When adding a subgraph we need to define how the parent graph and sub graph communicate. This can be done in 2 ways
1. Invoke a graph from a node
    - The sub graphs are independent
    - They are not connected
    - Instead one node will call/ invoke another sub graph
    - In this method each sub graph can maintain a seperate state
2. Add a graph as a node
    - The sub graphs are connected to the main graph
    - There is a shared state that has to be maintained
    

## Benefits of Sub‑Graphs
- **Modularity**  
    - Break down a large workflow into smaller, manageable sub‑graphs instead of building one massive graph. 
    - This makes complex systems easier to design and understand.

- **Reusability**  
    - Sub‑graphs can be reused across multiple workflows.  
    - Example: A RAG (Retrieval‑Augmented Generation) sub‑graph might include nodes for embedding queries and retrieving documents.  
    - This same RAG sub‑graph can then be integrated into a chatbot, search engine, or other applications.

- **Maintainability**  
    - Debugging a huge graph with 100+ nodes is difficult
    - Smaller sub‑graphs can be tested and debugged independently, improving reliability.

- **Team Collaboration**  
    - Different teams can work on separate sub‑graphs or sub‑agents, enabling parallel development and specialization.

- **State Management**  
    - Each sub‑graph can maintain its own state. 
    - Managing a single state across a massive graph is complex, but sub‑graphs simplify this process.

- **Observability**  
    - The execution and performance of each sub‑graph can be traced individually, making monitoring and analysis more effective.


# MessageState
- Its a prebuilt state schema that is used to manage the conversational messages in a graph workflow
- It is a A state class containing a `messages` attribute, which stores a list of different message types (e.g., `HumanMessage`, `AIMessage`). 
- Its mainly designed for chat based agentic workflows
- Instead of manually defining the state for chatbots, you can directly use:
```python
from langgraph.graph import MessageState`
graph = StateGraph(MessageState)
```