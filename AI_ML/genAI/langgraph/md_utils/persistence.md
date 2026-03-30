# Persistence
- Every node in the workflow can access the state values and update the attributes defined in the state.
- Once the workflow execution completes, the state information is normally lost.
- If the state needs to remain accessible in the future, persistence must be enabled. This means the state must be stored somewhere, such as in a database or in memory (RAM).
- Persistence is the ability to save and restore the workflow state over time.
- It stores all intermediate versions of the state, not just the final state.
- Example: If Node1, Node2, and Node3 all update the "name" attribute in the state, the persisted state will contain the value of "name" at each stage (Node1, Node2, Node3).

# Advantages of Persistence
- If the system crashes at Point B, the workflow can resume from Point B instead of restarting from Point A because the state at that point is already stored. This makes LangGraph fault tolerant.
- It enables use cases like chatbots where conversations can be resumed from previous interactions. Without persistence, a "resume chat" feature would not be possible.
- Human in loop can be implemented
- Time travel can be performed i.e. once the workflow is executed, if we want to rerun from any particular state we can do that. This is mainly used for debugging purposes.

# Checkpointers
- Persistence in LangGraph can be implemented using checkpointers.
- A checkpoint is created at each step of the workflow.
- In parallel workflows (e.g., Node1 → Node2, Node3, Node4), one checkpoint is created at Node1, and another checkpoint is created for the group of nodes running in parallel.
- Each checkpoint will be associated with a unique id called "checkpoint_id"
- To know what is the checkpoint_id for each checkpoint
```python
workflow.get_state_history(config = config)
```


# Threads
- A thread acts like a session ID.
- It is a unique identifier used to retrieve the state of a specific workflow execution.
- Example: If a user starts a conversation today, a session ID (Thread1) is assigned. If the user starts another conversation tomorrow, a new session ID (Thread2) is created. To revisit yesterday’s conversation, the system retrieves the state associated with Thread1.

# Types of saving the memory
1. InMemory
2. Sqlite (For small projects, not used in production)
3. Postgres (Used in production)

# Short Term memory (STM)
- Its a temporary memory that is maintained for each session/thread, which implies STM is thread scoped
- Its fragile, as it is just maintained for that conversation, as this information is not stored in the database. Its like appending the conversations in the list and then when you restart the terminal, the conversations are lost
- It stores information only for the current conversation or session
- Usually its stored in RAM, i.e. In state memory
- Once the session ends its cleared
- Eg: 
```
User: My name is John
Assistant: Nice to meet you John!
User: What is my name?
Assistant: Your name is John.
```
- Next time when you come back and ask what is my name it will not remember as its not stored in any database



# Long Term Memory
- Contains informtion about what happened in the past
- Stores information across multiple sessions 
- Its a persistant storage
- Its usually stored in databases
- Even on restarting the application you will be able to retrive the data
- LTM is not directly used, instead the relevant information is fetched from the LTM and then that information is brought into Short ter memory and then as a part of context the information is passed to the LLM
- Instead of us building the entire LTM for LLM there are libraries which support maintaining of LTM like MemGraph, Mem0, supermemory
- In each thread user will be talking about multiple things, and if we need to customize the chat bot to tht users needs it is important to understand what user prefers across multiple threads, for which LTM is required
- Eg: If I have asked to generate a code in Python in multiple threads, to personalize it to the user, in the LTM it will store the users prefered language is Python. So next time you dont have to explicitely tell that generate the code in python
- To implement long term memory in langraph the abstract class called `BaseStore` is used
- `MessageState` is used for short term memory and `BaseStore` is used for long term memory
- Its used to remember information across sessions
- `BaseStore` can create a new memory store, search for existing memory store, edit and delete memeory stores
- It can be implemented 
    - InMemoryStore - in RAM this is just used for testing purpose, and POCs, as this will not be persistant
    - PostgresStore
    - RedisStore
    


# Types of LTM in LLMs
1. Episodic Memory
    - Stores the past conversations, experiences, events
    - Answers what happened before
2. Semantic Memory
    - Stores the facts, knowledge and general information of the users world
    - Eg: What are the likes and dislikes of the user, what is the user into..
3. Procedural Memory
    - Stores instructions, workflows, and how to perform a task
    - It answers How do I do this?


# Context Window Problem
- When the context gets filled with maintaining the history of messages
- When you are passing to the LLM the context we will be passing the entire conversation, and that will start growing and growing and at one point the entire context window will get filled, this is when the LLM starts halucinating and starts loosing context

# Ways to avoid context window problem
1. Trimming
- You trim the past messages
- Instead of sending all the past conversation you decide to pass on past N messages
- Problems with Trimming
    - Assumption: Trimming assumes that only the latest *N* messages are useful, while older messages are ignored.  
    - Issue: This approach completely discards the initial context of the conversation.  
    - Example: If you begin by stating your name, and then continue with *N* conversations, trimming will eventually remove the starting message. Later, if you ask the system to recall your name, it will fail because that information was trimmed.  
    - In practical scenarios, losing early context can cause serious issues


2. Summarized
- Pass the entire past conversation to an LLM and get the summary of it and then pass the summarized version as the context
- Here the previous messages will be deleted, and will be appended with the summary. This can be done using `RemoveMessage` from langchain
- This is done so that duplicate messages are not stored


3. Hybrid
- You pass both the summary and last N messages as context to the LLM


#