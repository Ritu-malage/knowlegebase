---
title: Simple Parallel Workflow
---




-   Given runs, balls, No of 4s and 6s hit, you will need to compute the
    below 3 metrices
    -   Strike Rate
    -   Boundary Percentage
    -   Balls per boundary
-   All these 3 are independent tasks thus must be executed in parallel
-   Then aggregate these 3 quantities and then generate the summary
-   Workflow
    -   START -\> (Strike Rate, Boundary Percentage, Balls per boundary)
        -\> Summary -\> END


```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict
```


```python
class State(TypedDict):
    runs: int
    balls: int
    sixes: int
    fours: int

    strike_rate: float
    boundary_percentage: float
    balls_per_boundary: float
    summary: str
```

# Define Graph


```python
graph = StateGraph(State)
```

# Function definations


```python
def strike_rate(state: State) -> State:
    state["strike_rate"] = (state["runs"]/ state["balls"])*100
    return state

def balls_per_boundary(state: State)->State:
    state["balls_per_boundary"] = state["balls"]/(state["fours"]+state["sixes"])
    return state

def boundary_percentage(state: State)->State:
    state["boundary_percentage"] = (((state["fours"]*4 ) + (state["sixes"]*6))/state["runs"])*100
    return state


def summary(state: State) -> State:
    state["summary"] = f"""
        Strike Rate: {state["strike_rate"]}, 
        balls_per_boundary: {state["balls_per_boundary"]}, 
        boundary_percentage: {state["boundary_percentage"]}
    """
    return state
```

# Creating Nodes


```python
graph.add_node("summary", summary)
graph.add_node("strike_rate", strike_rate)
graph.add_node("balls_per_boundary", balls_per_boundary)
graph.add_node("boundary_percentage", boundary_percentage)
```

``` text
<langgraph.graph.state.StateGraph at 0x10ee9ecf0>
```

# Creating edges

-   Here the START Node goes to 3 other nodes i.e. strike_rate,
    balls_per_boundary and boundary_percentage
-   Each of the 3 nodes futher connect to summary Node
-   Finally the summary node connects to the END Node


```python
graph.add_edge(START, "strike_rate")
graph.add_edge(START, "balls_per_boundary")
graph.add_edge(START, "boundary_percentage")

graph.add_edge("strike_rate", "summary")
graph.add_edge("balls_per_boundary", "summary")
graph.add_edge("boundary_percentage", "summary")

graph.add_edge("summary", END)
```

``` text
<langgraph.graph.state.StateGraph at 0x10ee9ecf0>
```

# Compiling the graph


```python
workflow = graph.compile()
workflow
```

![](practice4_files/figure-markdown_strict/cell-8-output-1.png)

# Invoking the graph


```python
initial_state = {
    "runs": 100,
    "balls": 50,
    "fours": 6,
    "sixes": 4
}

final_state = workflow.invoke(initial_state)
final_state
```

``` text
InvalidUpdateError: At key 'runs': Can receive only one value per step. Use an Annotated key to handle multiple values.
For troubleshooting, visit: https://docs.langchain.com/oss/python/langgraph/errors/INVALID_CONCURRENT_GRAPH_UPDATE
[31m---------------------------------------------------------------------------[39m
[31mInvalidUpdateError[39m                        Traceback (most recent call last)
[36mCell[39m[36m [39m[32mIn[8][39m[32m, line 8[39m
[32m      1[39m initial_state = {
[32m      2[39m     [33m"[39m[33mruns[39m[33m"[39m: [32m100[39m,
[32m      3[39m     [33m"[39m[33mballs[39m[33m"[39m: [32m50[39m,
[32m      4[39m     [33m"[39m[33mfours[39m[33m"[39m: [32m6[39m,
[32m      5[39m     [33m"[39m[33msixes[39m[33m"[39m: [32m4[39m
[32m      6[39m }
[32m----> [39m[32m8[39m final_state = [43mworkflow[49m[43m.[49m[43minvoke[49m[43m([49m[43minitial_state[49m[43m)[49m
[32m      9[39m final_state

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/main.py:3094[39m, in [36mPregel.invoke[39m[34m(self, input, config, context, stream_mode, print_mode, output_keys, interrupt_before, interrupt_after, durability, **kwargs)[39m
[32m   3091[39m chunks: [38;5;28mlist[39m[[38;5;28mdict[39m[[38;5;28mstr[39m, Any] | Any] = []
[32m   3092[39m interrupts: [38;5;28mlist[39m[Interrupt] = []
[32m-> [39m[32m3094[39m [43m[49m[38;5;28;43;01mfor[39;49;00m[43m [49m[43mchunk[49m[43m [49m[38;5;129;43;01min[39;49;00m[43m [49m[38;5;28;43mself[39;49m[43m.[49m[43mstream[49m[43m([49m
[32m   3095[39m [43m    [49m[38;5;28;43minput[39;49m[43m,[49m
[32m   3096[39m [43m    [49m[43mconfig[49m[43m,[49m
[32m   3097[39m [43m    [49m[43mcontext[49m[43m=[49m[43mcontext[49m[43m,[49m
[32m   3098[39m [43m    [49m[43mstream_mode[49m[43m=[49m[43m[[49m[33;43m"[39;49m[33;43mupdates[39;49m[33;43m"[39;49m[43m,[49m[43m [49m[33;43m"[39;49m[33;43mvalues[39;49m[33;43m"[39;49m[43m][49m
[32m   3099[39m [43m    [49m[38;5;28;43;01mif[39;49;00m[43m [49m[43mstream_mode[49m[43m [49m[43m==[49m[43m [49m[33;43m"[39;49m[33;43mvalues[39;49m[33;43m"[39;49m
[32m   3100[39m [43m    [49m[38;5;28;43;01melse[39;49;00m[43m [49m[43mstream_mode[49m[43m,[49m
[32m   3101[39m [43m    [49m[43mprint_mode[49m[43m=[49m[43mprint_mode[49m[43m,[49m
[32m   3102[39m [43m    [49m[43moutput_keys[49m[43m=[49m[43moutput_keys[49m[43m,[49m
[32m   3103[39m [43m    [49m[43minterrupt_before[49m[43m=[49m[43minterrupt_before[49m[43m,[49m
[32m   3104[39m [43m    [49m[43minterrupt_after[49m[43m=[49m[43minterrupt_after[49m[43m,[49m
[32m   3105[39m [43m    [49m[43mdurability[49m[43m=[49m[43mdurability[49m[43m,[49m
[32m   3106[39m [43m    [49m[43m*[49m[43m*[49m[43mkwargs[49m[43m,[49m
[32m   3107[39m [43m[49m[43m)[49m[43m:[49m
[32m   3108[39m [43m    [49m[38;5;28;43;01mif[39;49;00m[43m [49m[43mstream_mode[49m[43m [49m[43m==[49m[43m [49m[33;43m"[39;49m[33;43mvalues[39;49m[33;43m"[39;49m[43m:[49m
[32m   3109[39m [43m        [49m[38;5;28;43;01mif[39;49;00m[43m [49m[38;5;28;43mlen[39;49m[43m([49m[43mchunk[49m[43m)[49m[43m [49m[43m==[49m[43m [49m[32;43m2[39;49m[43m:[49m

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/main.py:2679[39m, in [36mPregel.stream[39m[34m(self, input, config, context, stream_mode, print_mode, output_keys, interrupt_before, interrupt_after, durability, subgraphs, debug, **kwargs)[39m
[32m   2669[39m [38;5;28;01mfor[39;00m _ [38;5;129;01min[39;00m runner.tick(
[32m   2670[39m     [t [38;5;28;01mfor[39;00m t [38;5;129;01min[39;00m loop.tasks.values() [38;5;28;01mif[39;00m [38;5;129;01mnot[39;00m t.writes],
[32m   2671[39m     timeout=[38;5;28mself[39m.step_timeout,
[32m   (...)[39m[32m   2674[39m ):
[32m   2675[39m     [38;5;66;03m# emit output[39;00m
[32m   2676[39m     [38;5;28;01myield from[39;00m _output(
[32m   2677[39m         stream_mode, print_mode, subgraphs, stream.get, queue.Empty
[32m   2678[39m     )
[32m-> [39m[32m2679[39m [43mloop[49m[43m.[49m[43mafter_tick[49m[43m([49m[43m)[49m
[32m   2680[39m [38;5;66;03m# wait for checkpoint[39;00m
[32m   2681[39m [38;5;28;01mif[39;00m durability_ == [33m"[39m[33msync[39m[33m"[39m:

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/_loop.py:542[39m, in [36mPregelLoop.after_tick[39m[34m(self)[39m
[32m    540[39m writes = [w [38;5;28;01mfor[39;00m t [38;5;129;01min[39;00m [38;5;28mself[39m.tasks.values() [38;5;28;01mfor[39;00m w [38;5;129;01min[39;00m t.writes]
[32m    541[39m [38;5;66;03m# all tasks have finished[39;00m
[32m--> [39m[32m542[39m [38;5;28mself[39m.updated_channels = [43mapply_writes[49m[43m([49m
[32m    543[39m [43m    [49m[38;5;28;43mself[39;49m[43m.[49m[43mcheckpoint[49m[43m,[49m
[32m    544[39m [43m    [49m[38;5;28;43mself[39;49m[43m.[49m[43mchannels[49m[43m,[49m
[32m    545[39m [43m    [49m[38;5;28;43mself[39;49m[43m.[49m[43mtasks[49m[43m.[49m[43mvalues[49m[43m([49m[43m)[49m[43m,[49m
[32m    546[39m [43m    [49m[38;5;28;43mself[39;49m[43m.[49m[43mcheckpointer_get_next_version[49m[43m,[49m
[32m    547[39m [43m    [49m[38;5;28;43mself[39;49m[43m.[49m[43mtrigger_to_nodes[49m[43m,[49m
[32m    548[39m [43m[49m[43m)[49m
[32m    549[39m [38;5;66;03m# produce values output[39;00m
[32m    550[39m [38;5;28;01mif[39;00m [38;5;129;01mnot[39;00m [38;5;28mself[39m.updated_channels.isdisjoint(
[32m    551[39m     ([38;5;28mself[39m.output_keys,)
[32m    552[39m     [38;5;28;01mif[39;00m [38;5;28misinstance[39m([38;5;28mself[39m.output_keys, [38;5;28mstr[39m)
[32m    553[39m     [38;5;28;01melse[39;00m [38;5;28mself[39m.output_keys
[32m    554[39m ):

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/_algo.py:296[39m, in [36mapply_writes[39m[34m(checkpoint, channels, tasks, get_next_version, trigger_to_nodes)[39m
[32m    294[39m [38;5;28;01mfor[39;00m chan, vals [38;5;129;01min[39;00m pending_writes_by_channel.items():
[32m    295[39m     [38;5;28;01mif[39;00m chan [38;5;129;01min[39;00m channels:
[32m--> [39m[32m296[39m         [38;5;28;01mif[39;00m [43mchannels[49m[43m[[49m[43mchan[49m[43m][49m[43m.[49m[43mupdate[49m[43m([49m[43mvals[49m[43m)[49m [38;5;129;01mand[39;00m next_version [38;5;129;01mis[39;00m [38;5;129;01mnot[39;00m [38;5;28;01mNone[39;00m:
[32m    297[39m             checkpoint[[33m"[39m[33mchannel_versions[39m[33m"[39m][chan] = next_version
[32m    298[39m             [38;5;66;03m# unavailable channels can't trigger tasks, so don't add them[39;00m

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/channels/last_value.py:64[39m, in [36mLastValue.update[39m[34m(self, values)[39m
[32m     59[39m [38;5;28;01mif[39;00m [38;5;28mlen[39m(values) != [32m1[39m:
[32m     60[39m     msg = create_error_message(
[32m     61[39m         message=[33mf[39m[33m"[39m[33mAt key [39m[33m'[39m[38;5;132;01m{[39;00m[38;5;28mself[39m.key[38;5;132;01m}[39;00m[33m'[39m[33m: Can receive only one value per step. Use an Annotated key to handle multiple values.[39m[33m"[39m,
[32m     62[39m         error_code=ErrorCode.INVALID_CONCURRENT_GRAPH_UPDATE,
[32m     63[39m     )
[32m---> [39m[32m64[39m     [38;5;28;01mraise[39;00m InvalidUpdateError(msg)
[32m     66[39m [38;5;28mself[39m.value = values[-[32m1[39m]
[32m     67[39m [38;5;28;01mreturn[39;00m [38;5;28;01mTrue[39;00m

[31mInvalidUpdateError[39m: At key 'runs': Can receive only one value per step. Use an Annotated key to handle multiple values.
For troubleshooting, visit: https://docs.langchain.com/oss/python/langgraph/errors/INVALID_CONCURRENT_GRAPH_UPDATE
```

-   This error is occuring as the same state parameters i.e. runs,
    sixes, fours, and balls are being used parallely by the 3 parallely
    running nodes(although no edit is done on these parameters), the
    summary node will not know which state to use as all 3 nodes will
    return a state
-   So instead of returning the entire state, just return only partial
    state i.e. strike_rate() must just return “strike_rate” and not
    return complete state


```python
def strike_rate(state: State) -> State:
    strike_rate = (state["runs"]/ state["balls"])*100
    return {"strike_rate":strike_rate}

def balls_per_boundary(state: State)->State:
    balls_per_boundary = state["balls"]/(state["fours"]+state["sixes"])
    return {"balls_per_boundary":balls_per_boundary}

def boundary_percentage(state: State)->State:
    boundary_percentage = (((state["fours"]*4 ) + (state["sixes"]*6))/state["runs"])*100
    return {"boundary_percentage":boundary_percentage}


def summary(state: State) -> State:
    summary = f"""
        Strike Rate: {state["strike_rate"]}, 
        balls_per_boundary: {state["balls_per_boundary"]}, 
        boundary_percentage: {state["boundary_percentage"]}
    """
    return {"summary": summary}
```


```python
# Defining the graph
graph = StateGraph(State)

# Create Nodes
graph.add_node("summary", summary)
graph.add_node("strike_rate", strike_rate)
graph.add_node("balls_per_boundary", balls_per_boundary)
graph.add_node("boundary_percentage", boundary_percentage)

# Adding edges
graph.add_edge(START, "strike_rate")
graph.add_edge(START, "balls_per_boundary")
graph.add_edge(START, "boundary_percentage")

graph.add_edge("strike_rate", "summary")
graph.add_edge("balls_per_boundary", "summary")
graph.add_edge("boundary_percentage", "summary")

graph.add_edge("summary", END)

# Compiling the graph to create a workflow
workflow = graph.compile()

# Invoking the workflow
final_state = workflow.invoke(initial_state)
final_state
```

``` text
{'runs': 100,
 'balls': 50,
 'sixes': 4,
 'fours': 6,
 'strike_rate': 200.0,
 'boundary_percentage': 48.0,
 'balls_per_boundary': 5.0,
 'summary': '\n        Strike Rate: 200.0, \n        balls_per_boundary: 5.0, \n        boundary_percentage: 48.0\n    '}
```
