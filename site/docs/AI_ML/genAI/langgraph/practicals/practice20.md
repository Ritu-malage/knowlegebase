---
title: Personalizing the chatbot by using the existing prefilled memory
---




-   Workflow
    -   START -\> Chat Node -\> END
-   Before replying to the questions first it checks whether there
    exists some memory related to the question, if yes it fetches that
    and passes it as a context to the LLM
-   Note this does not create new memories, it just uses the existing
    memories as context to provide personalization


```python

from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_groq import ChatGroq
from langchain_core.messages.utils import trim_messages, count_tokens_approximately
from langgraph.store.memory import InMemoryStore
from langgraph.store.base import BaseStore
from langchain.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
```

``` text
/Users/ritumalage/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
```

# Creating a memory store

-   An existing prefilled memory store will be used


```python
store = InMemoryStore()

namespace = ("user", "user1", "details")

# Creating memory manually 
store.put(namespace=namespace, key="profile1", value = {"data": "Name: John"})
store.put(namespace=namespace, key="profile2", value = {"data": "He is a Computer science professor"})
store.put(namespace=namespace, key="preference1", value = {"data": "He likes python"})
store.put(namespace=namespace, key="preference2", value = {"data": "He wants an example to be associated while explaining"})
store.put(namespace=namespace, key="subject", value = {"data": "Good at DSA, DAA"})
```

# Defining the system prompt


```python
SYSTEM_PROMPT_TEMPLATE = """
You are an assistant with memory capabilities. If user specific memory is available, use it to personalize the response based on what you know about the user

Your goal is provide relevant, friendly, tailored assistance, that reflects users preferences and past interactions
If the users name or any personal information is available, personalize the response by 
- Always addressing the user by Name when appropriate like (Hi John,..)
- Try providing examples using the existing working projects so that the user will be able to grasp even better

The users memory is {user_memory}. This may be empty
"""
```


```python
model = ChatGroq(model = "qwen/qwen3-32b") 
```

# Building the Chat Node

-   Usually chat Node would have only 1 input i.e. the state but now 3
    inputs have to be passed
    1.  state
    2.  config
        -   Type: RunnableConfig
        -   As while fetching the memory user id is required and this is
            stored in the config
    3.  store
        -   Type: BaseConfig
        -   This is needed so that the node has the information about
            the memory


```python
def chat_node(state: MessagesState, config: RunnableConfig, store: BaseStore):

    user_id = config["configurable"]["user_id"]

    # Fetching the memory realted to the user
    users_namespace = ("user", user_id, "details")
    items = store.search(users_namespace)


    # If memory exists then convert all the memories into a single str blob so that it can be directly passed to the LLM
    if items:
        users_context = ""
        # The values of the memory is stored inside value.data
        # If there are N memories its values are seperated by a newline
        for item in items:
            users_context = users_context + "\n" + item.value.get("data")
        
    else:
        users_context = ""

    # .format is used to replace the placeholders with the actual value
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(user_memory = users_context)

    system_message = SystemMessage(content = system_prompt)


    # Pass both the memory and the messages
    response = model.invoke([system_message] + state["messages"])

    return {"messages": [response]}
```

# Building the graph

-   While compiling the graph the store must be passed


```python
graph = StateGraph(MessagesState)

graph.add_node("chat_node", chat_node)


graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)


workflow = graph.compile(store=store)
workflow
```

![](practice20_files/figure-markdown_strict/cell-7-output-1.png)


```python
config = {"configurable": {"user_id": "user1"}}

workflow.invoke({"messages": [HumanMessage(content="Can you explain what is LangGraph?")]},
    config
)

```

``` text
{'messages': [HumanMessage(content='Can you explain what is LangGraph?', additional_kwargs={}, response_metadata={}, id='667d31f4-03df-4302-b332-5b1ab33319a4'),
  AIMessage(content='<think>\nOkay, John is asking about LangGraph. Let me start by recalling what LangGraph is. It\'s a framework for building stateful, workflow-based applications for LLM agents. Since John is a computer science professor who likes Python and is good with DSA/DAA, I should connect it to concepts he\'s familiar with.\n\nHe wants an example associated with his projects. Maybe I can use a Python-based example. LangGraph allows creating graphs where nodes are functions, so comparing it to a graph data structure he\'s taught could help. I should mention state management since that\'s part of LangGraph\'s features. Also, since he likes Python, highlighting integration with Python tools or libraries would be good. Need to explain how it helps in structuring complex workflows for LLMs, maybe with a simple example. Make sure the example is relatable to his work, like a research workflow or a data processing pipeline. Avoid jargon, but since he\'s an expert, keep it technically accurate. Check if there\'s any existing project he\'s mentioned that could use this framework. Since his memory doesn\'t specify projects, maybe just a general example. Alright, structure the response with a clear definition, key features, an example related to Python or DSA, and maybe a code snippet if it\'s simple enough. Ensure it\'s tailored to his background and interests.\n</think>\n\nHi John, given your background in computer science and Python, you might find **LangGraph** particularly interesting as a tool for structuring complex workflows involving large language models (LLMs). Let me break it down with an example.\n\n### What is LangGraph?\nLangGraph is a **framework for building stateful, graph-based workflows** for LLM agents. It allows you to define directed acyclic graphs (DAGs) where nodes represent functional components (like tools, LLMs, or custom functions), and edges define the flow of data or control between them. This is especially useful for tasks that require multi-step reasoning, decision-making, or integration with external tools.\n\n---\n\n### Key Concepts (with Python/CS Connections)\n1. **Nodes as Functions**: Each node is a Python function (e.g., a custom `search_wikipedia()` or an LLM call). This aligns with your DSA/DAA expertise—think of it as a graph traversal algorithm where each node performs a specific operation.\n2. **State Management**: LangGraph maintains a shared state (like a dictionary) that persists across nodes. This is similar to maintaining a global context in a recursive algorithm.\n3. **Conditional Edges**: You can define logic to route to different nodes based on conditions (e.g., "if the answer is unclear, retry").\n\n---\n\n### Example: Academic Research Workflow\nImagine you’re building a system to answer questions about recent advancements in quantum computing. The workflow could look like this:\n\n```python\n# Pseudocode (LangGraph-style)\ngraph = langgraph.Graph()\n\ndef search_arxiv(query):\n    # Custom function to query arXiv for papers\n    return ["Paper1", "Paper2"]\n\ndef summarize_papers(papers):\n    # Use an LLM to generate a summary\n    return "Summary of key findings..."\n\ndef refine_query(context):\n    # Conditional step: if summary is too vague, refine the search\n    if "needs refinement" in context:\n        return search_arxiv(context["refined_query"])\n    return context["summary"]\n\ngraph.add_node("search", search_arxiv)\ngraph.add_node("summarize", summarize_papers)\ngraph.add_node("refine", refine_query)\n\ngraph.add_edge("search", "summarize")\ngraph.add_conditional_edge("summarize", refine_query, ["refine", "search"])\n\ngraph.set_entry_point("search")\ngraph.set_finish_point("summarize")\n```\n\n**How it works**:\n1. **User Query**: "Explain recent advancements in quantum computing."\n2. **Step 1**: The `search_arxiv` node fetches relevant papers.\n3. **Step 2**: The `summarize_papers` node uses an LLM to condense the findings.\n4. **Step 3**: If the summary is unclear, the `refine_query` node adjusts the search terms and loops back.\n\n---\n\n### Why This Matters for You\nSince you’re into Python and DSA, LangGraph’s graph-based approach mirrors algorithm design patterns you’ve taught (e.g., BFS/DFS on workflows). It’s also a great way to integrate LLMs into research pipelines or educational tools — for instance, automating literature reviews or grading code submissions.\n\nWould you like to dive deeper into any specific part of this example? 😊', additional_kwargs={}, response_metadata={'token_usage': {'completion_tokens': 959, 'prompt_tokens': 166, 'total_tokens': 1125, 'completion_time': 2.3500157440000002, 'completion_tokens_details': None, 'prompt_time': 0.00650704, 'prompt_tokens_details': None, 'queue_time': 0.04647227, 'total_time': 2.356522784}, 'model_name': 'qwen/qwen3-32b', 'system_fingerprint': 'fp_5cf921caa2', 'service_tier': 'on_demand', 'finish_reason': 'stop', 'logprobs': None, 'model_provider': 'groq'}, id='lc_run--019cf037-551b-78d3-a643-dc2321a09790-0', tool_calls=[], invalid_tool_calls=[], usage_metadata={'input_tokens': 166, 'output_tokens': 959, 'total_tokens': 1125})]}
```

-   Now you can see that the response is tailored with respect to the
    users preferences and there is personalization
