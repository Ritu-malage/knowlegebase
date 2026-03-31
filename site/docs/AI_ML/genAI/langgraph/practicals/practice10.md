---
title: Streaming
---





```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
```


```python
# Define State
class State(TypedDict):
    number: int
    result: int
```

# Defining the function definations


```python

def add_one(state: State):
    print("Running Node: add_one")
    return {"number": state["number"] + 1}


def multiply_by_two(state: State):
    print("Running Node: multiply_by_two")
    return {"result": state["number"] * 2}

```


```python
graph = StateGraph(State)

# Adding Modes
graph.add_node("add_one", add_one)
graph.add_node("multiply", multiply_by_two)

# Adding edges
graph.add_edge(START, "add_one")
graph.add_edge("add_one", "multiply")
graph.add_edge("multiply", END)

# Compiling
workflow = graph.compile()


```


```python
initial_state = {"number": 5}


workflow.invoke(initial_state)
```

``` text
Running Node: add_one
Running Node: multiply_by_two
```

``` text
{'number': 6, 'result': 12}
```

-   You can see that the final state is printed, but when node1 was
    executed the state did not get printed, similar with node2 as well
    ..

# Streaming

-   To stream the results i.e. intermediate results/ states of the graph
    then instead of `.invoke()` use `.stream()`
-   `.invoke()` waits until the full workflow is completed, and then
    after completion prints the final state
-   When `stream_mode` = “update” is set it implies it shows only the
    state attributes which underwent an update
-   Possible values for `stream_mode`
    -   checkpoints
    -   custom
    -   debug
    -   messages
    -   tasks
    -   updates
    -   values


```python

for event in workflow.stream(initial_state, stream_mode="updates"):
    print("Streamed Event:", event)
```

``` text
Running Node: add_one
Streamed Event: {'add_one': {'number': 6}}
Running Node: multiply_by_two
Streamed Event: {'multiply': {'result': 12}}
```

-   Since in node = add_one only attribute modified is number only
    number is streamed, and in the 2nd node only result attribute was
    changed so streams only that


```python

for event in workflow.stream(initial_state, stream_mode="checkpoints"):
    print("Streamed Event:", event)
```

``` text
Running Node: add_one
Running Node: multiply_by_two
```


```python

for event in workflow.stream(initial_state, stream_mode="values"):
    print("Streamed Event:", event)
```

``` text
Streamed Event: {'number': 5}
Running Node: add_one
Streamed Event: {'number': 6}
Running Node: multiply_by_two
Streamed Event: {'number': 6, 'result': 12}
```
