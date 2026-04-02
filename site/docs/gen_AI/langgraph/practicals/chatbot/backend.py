import os
import dotenv
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage


from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from langgraph.checkpoint.memory import InMemorySaver


from dotenv import load_dotenv

load_dotenv()
# GROQ_API_KEY = os.get

class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def chat_node(state: State):
    model = ChatGroq(model = "qwen/qwen3-32b")

    response = model.invoke(state["messages"])
    
    return {"messages": [response]}
    


checkpointer = InMemorySaver()


# Defining the graoh
graph = StateGraph(State)

# Adding Nodes
graph.add_node("chat_node", chat_node)

# Adding edges
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

# Worklfow creation
workflow = graph.compile(checkpointer =  checkpointer)
