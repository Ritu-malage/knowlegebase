# CrewAI

- Its a framework that helps in building multi agentic systems
- It provides high level abstractions while building the multi agent system, whereas LangGraph provides more love level control over maintaining the state, and the orchestration

# Building Blocks of CrewAI

- Agent
- Task
- Tool
- Crew
- Process
- Flow

# CrewAI Projects
- Its a project 
- Creating a project

```bash
crewai create crew <Project Name>
```
- During project creation, the CLI might ask N no of questions like
    - What is the role of your agent?
    - What is the goal?
    - What is the backstory?
    - What is the task?
    - What is the expected output?
- This will help you in creating initial agents and tasks 
- This is like a startup project that is getting created
```
crewai create crew project1
          │
          ▼
   CLI asks questions
          │
          ├── Agent
          │    ├── role
          │    ├── goal
          │    └── backstory
          │
          └── Task
               ├── description
               └── expected output
          │
          ▼
   Generated project files
```

- The answers to these question will be automatically be used to populate the projects configuration files


# How to run a crewai project
```bash
crewai run
```