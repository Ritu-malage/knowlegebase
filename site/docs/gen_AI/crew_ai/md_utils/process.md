# Process

- Determines how the tasks/ agents in a crew must be executed
- 2 modes
    - Sequential
    - Hierarchical

# Sequential Process

- Each task runs in the order that you have defined
- The order of execution of agents/ tasks are predefined
- You are saying do task1, then task2, then task 3
- The next task can use the output/context from the previous task
- Use this when the workflow is known
- How to configure?

```python
from crewai import Crew, Process

crew = Crew(
	agents = [
		agent1,
		agent2,
	],
	tasks = [
		task1,
		task2
	],
	process = Process.sequential,

)
```

# Hierarchical Process

- Instead of you defining the task by yourself you are introducing a manager
- The manager is responsible for delegating the work to the other agents
- It is also responsible for coordinating the task
- This is a manager driven workflow
- Its more dynamic than the sequential process, thus is less predictable
- How to configure?

```python
from crewai import Crew, Process

crew = Crew(
	agents = [
		agent1,
		agent2,
	],
	tasks = [
		task1,
		task2
	],
	process = Process.hierarchial,
	manager_llm = "gpt-4o-mini"
)
```

- We don’t have to create the manager agent, as CrewAI creates the manager agent internally
- We just provide the LLM model that must be used by the manager agent
- We can also customize the manager agent

```python
from crewai import Crew, Process, Agent

manager =  Agent(
	role="You are a Manager",
	goal="Coordinate and analyse the content and route it to the right agent",
	backstory="You delegate it to the right specialist",
	allow_delegation=True
)

# Give the manager to the Crew
crew = Crew(
	agents = [
		agent1,
		agent2,
	],
	tasks = [
		task1,
		task2
	],
	process = Process.hierarchial,
	manager_agent = manager
)
```