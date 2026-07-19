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


# AI Builder

- Platforms that enable creating AI applications with minimal coding
- Examples: N8N, Crew AI Studio
- Known as low-code or no-code systems
- Components are assembled through a visual interface rather than traditional programming
- Useful for building proofs of concept, experimenting, quick demonstrations, and for non-coders

# Runtime

- A platform that executes agents
- When an agent is built with an LLM, tools, memory, guardrails, and human-in-the-loop, the runtime coordinates all these components
- Runtime responsibilities include:
  - Managing state
  - Executing workflows
  - Calling tools
  - Handling memory
  - Managing errors
  - Supporting human-in-the-loop
  - Enforcing guardrails
- The LLM only provides answers and indicates which tool to use; the runtime performs the actual execution
- Example:
  - Query: Summarize today’s AI-related news
  - User sends the request
  - Runtime gathers necessary context
  - Orchestrator decides the first step is a web search
  - Runtime executes the web search
  - Results are returned to the runtime
  - Runtime passes results to the LLM
  - LLM summarizes the information and provides the final answer to the user
- Runtime is not making the decisions it is carrying out a particular task
- Example:
  - GPS says turn left -> LLM
  - You actually turn left -> Executing the task told -> Runtime
- LLM can just take input, think, and then give out an output
- LLM cannot call tools, save memory, execute code by itself. Someone else has to do it, i.e. nothing but the runtime
- Available Runtimes: AutoGen, CrewAI Rutime, OpenClaw runtime, LangGraph
- Runtime manages execution and orchestration whereas LLM focuses on reasoning and language.

# Tools
- Also called function calling
- You are giving new capabilities
- Its a simple function that an LLM can ask runtime to execute
- A tool allows an LLM to interact with the outside world.
- Without tools, an LLM can only generate text.
- With tools, it can:
  - Search the web
  - Read files
  - Query databases
  - Send emails
  - Execute python code
- Example: If the user asks "whats the weather in Bangalore?". The LLM will answer this question from its training data, which might be outdated. But if we give access to weather tool then query -> LLM -> Use weather tool -> Runtime executes the weather tool -> Returns the answer to the runtime -> Runtime gives the response to the LLM -> Regenerates output
- The description of a tool helps the LLM understand when it should be invoked

# Working of an LLM with Access to Tools

- User submits a query → Example: What’s the weather in Bangalore
- Runtime provides the LLM with context about available tools, memory, and history along with the query
- LLM interprets the query, identifies intent, and outputs an instruction such as “call the weather tool”
- Runtime executes the tool call on behalf of the LLM
- Tool returns the result to the runtime
- Runtime passes the tool’s output back to the LLM
- LLM processes the result and generates the final answer for the user


# System Prompt

- Provides the LLM with instructions on how it should behave, including its role, rules, and response style
- Typically hidden from the user
- Sent before the user’s message
- Does not make the LLM smarter or add new knowledge, but guides it on how to use the knowledge it already has


# LLM is stateless

- An LLM does not remember anything from previous requests unless you explicitly send that information again.
- Example:
    - Conversation 1: Hi I am Ritu; Response: Hi Ritu
    - Conversation 2: What is my name; Response: I don’t know your name
- Instead we will need to send information about conversation 1 both the query and the response as a part of context to conversation 2 in order to get the answer for query 2

# Context Engineering
- Context engineering is about giving the model the right information at the right time.
- Prompt engineering is about writing better prompts
- Context: Everything the LLM sees before generating an answer.
- Context includes
  - Instructions
  - System & User prompt
  - Long term memory - Information that is stored based on previous conversations and interactions
  - Short term memory - Conversational history
  - Information of the available tools
  - RAG
  - Information on how the output should be structured

# Steps to Vibe Coding

- Begin with brainstorming alongside the LLM to clarify ideas
- Ask clarifying questions to remove ambiguity
- Finalize on the problem statement
- Define both functional and non-functional requirements
- Avoid proceeding blindly; ensure proper understanding
- Provide the agent with the task once requirements are clear
- Supply step-by-step instructions for execution
- Break the task into smaller milestones for easier progress tracking

# Structured Output

- Asking the LLM to generate an output in a specific manner and structure
- Returns in the JSON format