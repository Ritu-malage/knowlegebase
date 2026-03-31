---
title: Fault Tolerance
---




-   Workflow
    -   START -\> Node1 -\> Node2 -\> Node3 -\> END
-   Configure node2 to pause for 30 seconds, allowing us to manually
    interrupt the workflow at that stage and then resume execution from
    that point onward. This is to test how LangGraph supports fault
    tollerance


```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict
from langgraph.checkpoint.memory import MemorySaver

```


```python
class State(TypedDict):
    input: str
    node1: str
    node2: str
    node3: str
```


```python
import time

def node1(state: State)-> State:
    print("Node1 done")
    return {
        "node1": "done",
    }

def node2(state: State)->State:
    print("Node2 done")
    time.sleep(30)
    return {
        "node2": "done"
    }

def node3(state: State)->State:
    print("Node3 done")
    return {
        "node3": "done"
    }
```


```python
graph = StateGraph(State)

# Adding Nodes
graph.add_node("node1", node1)
graph.add_node("node2", node2)
graph.add_node("node3", node3)

# Adding edges
graph.add_edge(START, "node1")
graph.add_edge("node1", "node2")
graph.add_edge("node2", "node3")
graph.add_edge("node3", END)

# Defining checkpointer
checkpointer = MemorySaver()

# Workflow
workflow = graph.compile(checkpointer = checkpointer)
workflow
```

![](practice9_files/figure-markdown_strict/cell-5-output-1.png)


```python
# Defining the thread_id
thread_id = 1
config = {
            "configurable":{
                "thread_id": thread_id
            }
        }

initial_state = {"input": "Start"}
workflow.invoke(initial_state,config=config)
```

``` text
Node1 done
Node2 done
```

``` text
KeyboardInterrupt: 
[31m---------------------------------------------------------------------------[39m
[31mKeyboardInterrupt[39m                         Traceback (most recent call last)
[36mCell[39m[36m [39m[32mIn[5][39m[32m, line 10[39m
[32m      3[39m config = {
[32m      4[39m             [33m"[39m[33mconfigurable[39m[33m"[39m:{
[32m      5[39m                 [33m"[39m[33mthread_id[39m[33m"[39m: thread_id
[32m      6[39m             }
[32m      7[39m         }
[32m      9[39m initial_state = {[33m"[39m[33minput[39m[33m"[39m: [33m"[39m[33mStart[39m[33m"[39m}
[32m---> [39m[32m10[39m [43mworkflow[49m[43m.[49m[43minvoke[49m[43m([49m[43minitial_state[49m[43m,[49m[43mconfig[49m[43m=[49m[43mconfig[49m[43m)[49m

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

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/main.py:2669[39m, in [36mPregel.stream[39m[34m(self, input, config, context, stream_mode, print_mode, output_keys, interrupt_before, interrupt_after, durability, subgraphs, debug, **kwargs)[39m
[32m   2667[39m [38;5;28;01mfor[39;00m task [38;5;129;01min[39;00m loop.match_cached_writes():
[32m   2668[39m     loop.output_writes(task.id, task.writes, cached=[38;5;28;01mTrue[39;00m)
[32m-> [39m[32m2669[39m [43m[49m[38;5;28;43;01mfor[39;49;00m[43m [49m[43m_[49m[43m [49m[38;5;129;43;01min[39;49;00m[43m [49m[43mrunner[49m[43m.[49m[43mtick[49m[43m([49m
[32m   2670[39m [43m    [49m[43m[[49m[43mt[49m[43m [49m[38;5;28;43;01mfor[39;49;00m[43m [49m[43mt[49m[43m [49m[38;5;129;43;01min[39;49;00m[43m [49m[43mloop[49m[43m.[49m[43mtasks[49m[43m.[49m[43mvalues[49m[43m([49m[43m)[49m[43m [49m[38;5;28;43;01mif[39;49;00m[43m [49m[38;5;129;43;01mnot[39;49;00m[43m [49m[43mt[49m[43m.[49m[43mwrites[49m[43m][49m[43m,[49m
[32m   2671[39m [43m    [49m[43mtimeout[49m[43m=[49m[38;5;28;43mself[39;49m[43m.[49m[43mstep_timeout[49m[43m,[49m
[32m   2672[39m [43m    [49m[43mget_waiter[49m[43m=[49m[43mget_waiter[49m[43m,[49m
[32m   2673[39m [43m    [49m[43mschedule_task[49m[43m=[49m[43mloop[49m[43m.[49m[43maccept_push[49m[43m,[49m
[32m   2674[39m [43m[49m[43m)[49m[43m:[49m
[32m   2675[39m [43m    [49m[38;5;66;43;03m# emit output[39;49;00m
[32m   2676[39m [43m    [49m[38;5;28;43;01myield from[39;49;00m[43m [49m[43m_output[49m[43m([49m
[32m   2677[39m [43m        [49m[43mstream_mode[49m[43m,[49m[43m [49m[43mprint_mode[49m[43m,[49m[43m [49m[43msubgraphs[49m[43m,[49m[43m [49m[43mstream[49m[43m.[49m[43mget[49m[43m,[49m[43m [49m[43mqueue[49m[43m.[49m[43mEmpty[49m
[32m   2678[39m [43m    [49m[43m)[49m
[32m   2679[39m loop.after_tick()

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/_runner.py:167[39m, in [36mPregelRunner.tick[39m[34m(self, tasks, reraise, timeout, retry_policy, get_waiter, schedule_task)[39m
[32m    165[39m t = tasks[[32m0[39m]
[32m    166[39m [38;5;28;01mtry[39;00m:
[32m--> [39m[32m167[39m     [43mrun_with_retry[49m[43m([49m
[32m    168[39m [43m        [49m[43mt[49m[43m,[49m
[32m    169[39m [43m        [49m[43mretry_policy[49m[43m,[49m
[32m    170[39m [43m        [49m[43mconfigurable[49m[43m=[49m[43m{[49m
[32m    171[39m [43m            [49m[43mCONFIG_KEY_CALL[49m[43m:[49m[43m [49m[43mpartial[49m[43m([49m
[32m    172[39m [43m                [49m[43m_call[49m[43m,[49m
[32m    173[39m [43m                [49m[43mweakref[49m[43m.[49m[43mref[49m[43m([49m[43mt[49m[43m)[49m[43m,[49m
[32m    174[39m [43m                [49m[43mretry_policy[49m[43m=[49m[43mretry_policy[49m[43m,[49m
[32m    175[39m [43m                [49m[43mfutures[49m[43m=[49m[43mweakref[49m[43m.[49m[43mref[49m[43m([49m[43mfutures[49m[43m)[49m[43m,[49m
[32m    176[39m [43m                [49m[43mschedule_task[49m[43m=[49m[43mschedule_task[49m[43m,[49m
[32m    177[39m [43m                [49m[43msubmit[49m[43m=[49m[38;5;28;43mself[39;49m[43m.[49m[43msubmit[49m[43m,[49m
[32m    178[39m [43m            [49m[43m)[49m[43m,[49m
[32m    179[39m [43m        [49m[43m}[49m[43m,[49m
[32m    180[39m [43m    [49m[43m)[49m
[32m    181[39m     [38;5;28mself[39m.commit(t, [38;5;28;01mNone[39;00m)
[32m    182[39m [38;5;28;01mexcept[39;00m [38;5;167;01mException[39;00m [38;5;28;01mas[39;00m exc:

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/pregel/_retry.py:71[39m, in [36mrun_with_retry[39m[34m(task, retry_policy, configurable)[39m
[32m     69[39m     task.writes.clear()
[32m     70[39m     [38;5;66;03m# run the task[39;00m
[32m---> [39m[32m71[39m     [38;5;28;01mreturn[39;00m [43mtask[49m[43m.[49m[43mproc[49m[43m.[49m[43minvoke[49m[43m([49m[43mtask[49m[43m.[49m[43minput[49m[43m,[49m[43m [49m[43mconfig[49m[43m)[49m
[32m     72[39m [38;5;28;01mexcept[39;00m ParentCommand [38;5;28;01mas[39;00m exc:
[32m     73[39m     ns: [38;5;28mstr[39m = config[CONF][CONFIG_KEY_CHECKPOINT_NS]

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/_internal/_runnable.py:656[39m, in [36mRunnableSeq.invoke[39m[34m(self, input, config, **kwargs)[39m
[32m    654[39m     [38;5;66;03m# run in context[39;00m
[32m    655[39m     [38;5;28;01mwith[39;00m set_config_context(config, run) [38;5;28;01mas[39;00m context:
[32m--> [39m[32m656[39m         [38;5;28minput[39m = [43mcontext[49m[43m.[49m[43mrun[49m[43m([49m[43mstep[49m[43m.[49m[43minvoke[49m[43m,[49m[43m [49m[38;5;28;43minput[39;49m[43m,[49m[43m [49m[43mconfig[49m[43m,[49m[43m [49m[43m*[49m[43m*[49m[43mkwargs[49m[43m)[49m
[32m    657[39m [38;5;28;01melse[39;00m:
[32m    658[39m     [38;5;28minput[39m = step.invoke([38;5;28minput[39m, config)

[36mFile [39m[32m~/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/langgraph/_internal/_runnable.py:400[39m, in [36mRunnableCallable.invoke[39m[34m(self, input, config, **kwargs)[39m
[32m    398[39m         run_manager.on_chain_end(ret)
[32m    399[39m [38;5;28;01melse[39;00m:
[32m--> [39m[32m400[39m     ret = [38;5;28;43mself[39;49m[43m.[49m[43mfunc[49m[43m([49m[43m*[49m[43margs[49m[43m,[49m[43m [49m[43m*[49m[43m*[49m[43mkwargs[49m[43m)[49m
[32m    401[39m [38;5;28;01mif[39;00m [38;5;28mself[39m.recurse [38;5;129;01mand[39;00m [38;5;28misinstance[39m(ret, Runnable):
[32m    402[39m     [38;5;28;01mreturn[39;00m ret.invoke([38;5;28minput[39m, config)

[36mCell[39m[36m [39m[32mIn[3][39m[32m, line 11[39m, in [36mnode2[39m[34m(state)[39m
[32m      9[39m [38;5;28;01mdef[39;00m[38;5;250m [39m[34mnode2[39m(state: State)->State:
[32m     10[39m     [38;5;28mprint[39m([33m"[39m[33mNode2 done[39m[33m"[39m)
[32m---> [39m[32m11[39m     [43mtime[49m[43m.[49m[43msleep[49m[43m([49m[32;43m30[39;49m[43m)[49m
[32m     12[39m     [38;5;28;01mreturn[39;00m {
[32m     13[39m         [33m"[39m[33mnode2[39m[33m"[39m: [33m"[39m[33mdone[39m[33m"[39m
[32m     14[39m     }

[31mKeyboardInterrupt[39m: 
```

-   Now I have interupted the workflow while the node2 was being
    executed
-   This is to test fault tollerance


```python
workflow.get_state(config=config)
```

``` text
StateSnapshot(values={'input': 'Start', 'node1': 'done'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, metadata={'source': 'loop', 'step': 1, 'parents': {}}, created_at='2026-03-05T15:59:44.082018+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, tasks=(PregelTask(id='99fee93c-6cc3-5d4f-3264-67f511dcc7ab', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result=None),), interrupts=())
```

-   It shows that the next node to be executed is node2


```python
list(workflow.get_state_history(config=config))
```

``` text
[StateSnapshot(values={'input': 'Start', 'node1': 'done'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, metadata={'source': 'loop', 'step': 1, 'parents': {}}, created_at='2026-03-05T15:59:44.082018+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, tasks=(PregelTask(id='99fee93c-6cc3-5d4f-3264-67f511dcc7ab', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result=None),), interrupts=()),
 StateSnapshot(values={'input': 'Start'}, next=('node1',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, metadata={'source': 'loop', 'step': 0, 'parents': {}}, created_at='2026-03-05T15:59:44.081354+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, tasks=(PregelTask(id='46f012e8-459f-2a4b-ca6f-e0a43b9158d6', name='node1', path=('__pregel_pull', 'node1'), error=None, interrupts=(), state=None, result={'node1': 'done'}),), interrupts=()),
 StateSnapshot(values={}, next=('__start__',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, metadata={'source': 'input', 'step': -1, 'parents': {}}, created_at='2026-03-05T15:59:44.080610+00:00', parent_config=None, tasks=(PregelTask(id='2aeb98eb-d82c-69d1-e7e0-b34ed5ea7c3f', name='__start__', path=('__pregel_pull', '__start__'), error=None, interrupts=(), state=None, result={'input': 'Start'}),), interrupts=())]
```

-   It has the state stored till node1
-   To resume from Node2, or from where it crashed just dont pass
    initial_state instead pass None in the invoke function


```python
workflow.invoke(None, config=config)
```

``` text
Node2 done
Node3 done
```

``` text
{'input': 'Start', 'node1': 'done', 'node2': 'done', 'node3': 'done'}
```

-   Now we can see that the execution is starting from Node2 and not
    from Node1

# Running from a particular checkpoint

-   Get the checkpoint_id from where you want to begin the execution by
    running `get_state_history()`
-   Then run `workflow.invoke()` by passing checkpoint_id in the config
    and None as the initial state


```python
list(workflow.get_state_history(config=config))
```

``` text
[StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done', 'node3': 'done'}, next=(), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d975-6116-8003-d682ec562583'}}, metadata={'source': 'loop', 'step': 3, 'parents': {}}, created_at='2026-03-05T16:02:15.101254+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d973-6b7c-8002-97c807cdea4c'}}, tasks=(), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done'}, next=('node3',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d973-6b7c-8002-97c807cdea4c'}}, metadata={'source': 'loop', 'step': 2, 'parents': {}}, created_at='2026-03-05T16:02:15.100686+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, tasks=(PregelTask(id='df3d5b0e-f73a-b166-ce7c-ef9a6c5e1978', name='node3', path=('__pregel_pull', 'node3'), error=None, interrupts=(), state=None, result={'node3': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, metadata={'source': 'loop', 'step': 1, 'parents': {}}, created_at='2026-03-05T15:59:44.082018+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, tasks=(PregelTask(id='99fee93c-6cc3-5d4f-3264-67f511dcc7ab', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result={'node2': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start'}, next=('node1',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, metadata={'source': 'loop', 'step': 0, 'parents': {}}, created_at='2026-03-05T15:59:44.081354+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, tasks=(PregelTask(id='46f012e8-459f-2a4b-ca6f-e0a43b9158d6', name='node1', path=('__pregel_pull', 'node1'), error=None, interrupts=(), state=None, result={'node1': 'done'}),), interrupts=()),
 StateSnapshot(values={}, next=('__start__',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, metadata={'source': 'input', 'step': -1, 'parents': {}}, created_at='2026-03-05T15:59:44.080610+00:00', parent_config=None, tasks=(PregelTask(id='2aeb98eb-d82c-69d1-e7e0-b34ed5ea7c3f', name='__start__', path=('__pregel_pull', '__start__'), error=None, interrupts=(), state=None, result={'input': 'Start'}),), interrupts=())]
```


```python
workflow.invoke(
    None, 
    config = {
        "configurable":{
            "thread_id":"1", 
            "checkpoint_id":"1f118ac5-3938-623e-8000-ed5ec4c28d56"
            }
        }
    )
```

``` text
Node1 done
Node2 done
Node3 done
```

``` text
{'input': 'Start', 'node1': 'done', 'node2': 'done', 'node3': 'done'}
```

-   Since I used the checkpoint of node1 the execution starts from node1

# Updating the state at a particular checkpoint


```python
workflow.update_state(
    {
        "configurable":{
            "thread_id":"1", 
            "checkpoint_id":"1f118ac5-3939-6c1a-8001-0a8f8f022ed0",
            "checkpoint_ns": ""
            }
    },
    {
        "node1": "reupdated_node1"}
    
)
```

``` text
{'configurable': {'thread_id': '1',
  'checkpoint_ns': '',
  'checkpoint_id': '1f118bab-2500-6e74-8002-8ee796b97ae4'}}
```


```python
list(workflow.get_state_history(config=config))
```

``` text
[StateSnapshot(values={'input': 'Start', 'node1': 'reupdated_node1'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118bab-2500-6e74-8002-8ee796b97ae4'}}, metadata={'source': 'update', 'step': 2, 'parents': {}}, created_at='2026-03-05T17:42:35.977060+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, tasks=(PregelTask(id='71b182e8-af74-e2c5-bc6d-2ceb1d1e64d6', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result=None),), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done', 'node3': 'done'}, next=(), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118b9a-a9fa-6ed8-8003-d267a38d0b69'}}, metadata={'source': 'loop', 'step': 3, 'parents': {}}, created_at='2026-03-05T17:35:13.580385+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118b9a-a9f7-6602-8002-27f39eb61391'}}, tasks=(), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done'}, next=('node3',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118b9a-a9f7-6602-8002-27f39eb61391'}}, metadata={'source': 'loop', 'step': 2, 'parents': {}}, created_at='2026-03-05T17:35:13.578917+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118b99-8bce-6fbe-8001-4a66c66ed9ce'}}, tasks=(PregelTask(id='80915326-17a8-2e5b-5aca-130256df3421', name='node3', path=('__pregel_pull', 'node3'), error=None, interrupts=(), state=None, result={'node3': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118b99-8bce-6fbe-8001-4a66c66ed9ce'}}, metadata={'source': 'loop', 'step': 1, 'parents': {}}, created_at='2026-03-05T17:34:43.573127+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, tasks=(PregelTask(id='da2ab741-0345-53d9-80f2-6e331a73c0d6', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result={'node2': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done', 'node3': 'done'}, next=(), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d975-6116-8003-d682ec562583'}}, metadata={'source': 'loop', 'step': 3, 'parents': {}}, created_at='2026-03-05T16:02:15.101254+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d973-6b7c-8002-97c807cdea4c'}}, tasks=(), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done', 'node2': 'done'}, next=('node3',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118aca-d973-6b7c-8002-97c807cdea4c'}}, metadata={'source': 'loop', 'step': 2, 'parents': {}}, created_at='2026-03-05T16:02:15.100686+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, tasks=(PregelTask(id='df3d5b0e-f73a-b166-ce7c-ef9a6c5e1978', name='node3', path=('__pregel_pull', 'node3'), error=None, interrupts=(), state=None, result={'node3': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start', 'node1': 'done'}, next=('node2',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3939-6c1a-8001-0a8f8f022ed0'}}, metadata={'source': 'loop', 'step': 1, 'parents': {}}, created_at='2026-03-05T15:59:44.082018+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, tasks=(PregelTask(id='99fee93c-6cc3-5d4f-3264-67f511dcc7ab', name='node2', path=('__pregel_pull', 'node2'), error=None, interrupts=(), state=None, result={'node2': 'done'}),), interrupts=()),
 StateSnapshot(values={'input': 'Start'}, next=('node1',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3938-623e-8000-ed5ec4c28d56'}}, metadata={'source': 'loop', 'step': 0, 'parents': {}}, created_at='2026-03-05T15:59:44.081354+00:00', parent_config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, tasks=(PregelTask(id='46f012e8-459f-2a4b-ca6f-e0a43b9158d6', name='node1', path=('__pregel_pull', 'node1'), error=None, interrupts=(), state=None, result={'node1': 'done'}),), interrupts=()),
 StateSnapshot(values={}, next=('__start__',), config={'configurable': {'thread_id': '1', 'checkpoint_ns': '', 'checkpoint_id': '1f118ac5-3936-652e-bfff-8c20d70338cf'}}, metadata={'source': 'input', 'step': -1, 'parents': {}}, created_at='2026-03-05T15:59:44.080610+00:00', parent_config=None, tasks=(PregelTask(id='2aeb98eb-d82c-69d1-e7e0-b34ed5ea7c3f', name='__start__', path=('__pregel_pull', '__start__'), error=None, interrupts=(), state=None, result={'input': 'Start'}),), interrupts=())]
```

-   Now you can see that a new state is added i.e. node1 =
    reupdated_node1
