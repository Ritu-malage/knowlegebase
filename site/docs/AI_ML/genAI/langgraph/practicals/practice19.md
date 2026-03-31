---
title: How to create Memory stores
---




-   Concept of stores are used while implementing long term memory (LTM)
-   1 method in which the LTM can be implemented is using
    `InMemoryStore`
-   This stores LTM in RAM, thus this is not persistant store, this is
    not used in production, its just for quick prototyping
-   This class is internally inherited from the `BaseStore` class, which
    is an abstract class


```python
from langgraph.store.memory import InMemoryStore
```


```python
store = InMemoryStore()
```

# Creating namespace

-   Its equivalent to folders in drive
-   Namespaces are used to organize the memory
-   Examples for namespaces
    1.  (users, user1)
        -   Under users folder, user1 folder is created, and all the
            memory of user1 will be stored here
    2.  (users, user1, profile)
        -   Under users/user1/ a profile folder is created
-   When you create a new memory it must be inside some namespace
-   Namespace must be defined as a tuple of strings


```python
namespace1 = ("users", "user1")
```

# Creating Memories within the namespace

-   This is done using the `put` method. It adds a new memory inside a
    namespace
-   Inputs to `put()`
    1.  Namespace
    2.  Key
        -   Key to the memory
        -   Must be unqiue
        -   If existing key is used, it will be overwritten
    3.  Value
        -   Value of the memory


```python
# Adding memory 1
store.put(
    namespace = namespace1,
    key= "1",
    value={"data": "user likes pizza"}
)

# Adding memory 2
store.put(
    namespace = namespace1,
    key= "2",
    value={"data": "user likes dark theme mode"}
)


```

# Creating memory for user2


```python
# Creating a new namespace for user2
namespace2 = ("users", "user2")

# Adding memory 1
store.put(
    namespace = namespace2,
    key= "1",
    value={"data": "user likes pasta"}
)

# Adding memory 2
store.put(
    namespace = namespace2,
    key= "2",
    value={"data": "user likes light theme mode"}
)

```

# Retrieving Memories

-   This is used to fetch the existing memories
-   Can be done using `get()`
-   Inputs to `get()`
    1.  Namespace
    2.  Key


```python
store.get(namespace= namespace1, key = 1)
```

``` text
Item(namespace=['users', 'user1'], key='1', value={'data': 'user likes pizza'}, created_at='2026-03-15T05:41:04.082506+00:00', updated_at='2026-03-15T05:41:04.082506+00:00')
```

# Retrieving all Memories

-   Done via `search()`
-   Input
    1.  namespace
-   It fetches all the memories that are created under the given
    namespace


```python
items = store.search(namespace1)
items
```

``` text
[Item(namespace=['users', 'user1'], key='1', value={'data': 'user likes pizza'}, created_at='2026-03-15T05:41:04.082506+00:00', updated_at='2026-03-15T05:41:04.082506+00:00', score=None),
 Item(namespace=['users', 'user1'], key='2', value={'data': 'user likes dark theme mode'}, created_at='2026-03-15T05:41:04.082528+00:00', updated_at='2026-03-15T05:41:04.082529+00:00', score=None)]
```

-   As 2 memories key = 1, 2 were created, `search()` returns 2 memories
    for namespace = namespace1

# Semantic searching

-   This is required because, LTM will contain various information
    related to multiple domains, as its a information thats stored
    across sessions, thus when user asks a specific question, it doesnt
    make sense to pass the whole memory as a context, instead we find
    the semantic similarity and send only relevant ones
-   For this an embedding model has to be passed into the
    `InMemoryStore` and the same `search()` method is used for semantic
    searching
-   The additional parameters passed are
    1.  Namespace
    2.  Query against whom the semantic search must be performed
    3.  limit: The no of related memories that must be fetched
-   Internally, the embedding model will embed the query and all the
    memories that exists in the stores, and find the closest matches to
    the query embeddings


```python
from langchain_huggingface import HuggingFaceEmbeddings
embedding_model = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en-v1.5"
)

# Passing the embedding model into the memory store
store1 = InMemoryStore(index = {"embed": embedding_model, "dims": 1536})
```

``` text
/Users/ritumalage/Documents/my_github/Notes/.venv_langgraph/lib/python3.13/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
Loading weights: 100%|██████████| 199/199 [00:00<00:00, 11881.88it/s]
BertModel LOAD REPORT from: BAAI/bge-small-en-v1.5
Key                     | Status     |  | 
------------------------+------------+--+-
embeddings.position_ids | UNEXPECTED |  | 

Notes:
- UNEXPECTED    :can be ignored when loading from different task/architecture; not ok if you expect identical arch.
```


```python
# Adding memories to store1
store1.put(namespace=namespace1, key="1", value={"data": "user likes pizza"})
store1.put(namespace=namespace1, key="2", value={"data": "user likes dark theme mode"})

items = store1.search(
    namespace1,
    query = "What does user prefer to eat pizza or pasta?",
    limit = 1
    )
items
```

``` text
[Item(namespace=['users', 'user1'], key='1', value={'data': 'user likes pizza'}, created_at='2026-03-15T05:41:10.885851+00:00', updated_at='2026-03-15T05:41:10.885856+00:00', score=0.6665426387478234)]
```

-   This returns the closest memory to the query
