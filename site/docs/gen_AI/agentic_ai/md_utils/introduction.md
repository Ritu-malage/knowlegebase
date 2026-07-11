# Introduction


## Agents

- An LLM can be invoked repeatedly in a loop, with access to external tools, to accomplish a task.  
- Agents are autonomous systems, meaning they can take actions independently without direct human intervention.  
- These systems can perform work on your behalf without requiring continuous human involvement.  
- A human provides input, the LLM acts on the environment, receives feedback, and continues iterating until the task is completed, ultimately producing the final output.


# Workflow
- Workflow is the sequence of steps that an AI agent follows to complete a task.  
- It defines what happens first, what happens next, what decisions are made, and when the task is finished.

# Risks of Agentic Frameworks

- Responses may be non-deterministic, leading to unpredictable outcomes
- Costs can fluctuate and are difficult to anticipate
- Execution paths may vary, making behavior less predictable


# Ways to Mitigate Risks in Agentic Systems

- System monitoring through observability tools to track performance and behavior
- Evals
  - Assessing the product’s effectiveness and reliability
  - Checking whether the framework contributes to revenue generation
  - Leveraging large language models as evaluators
- Guardrails to enforce boundaries and prevent undesired actions
