"""
- Replacing the InMemorySaver with persistant memory i.e. SqliteSaver
- This ensures that even on reload the chat history is not lost
- For this we will need to create an SQL database and then pass it to our checkpointer function. 
- The database can be created in python using sqlite3 library
- To view the database, you can install the extension called Sqlite viewer and then on clicking the database created you will be able to see the content of DB
- Tool integration - calculator and duckduckGo
"""
from dotenv import load_dotenv
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition


load_dotenv()

# Inbuilt tool
search_tool = DuckDuckGoSearchRun()

# Custom tool
@tool
def calculator(no1: float, no2: float, operation:str)-> dict:
    """
    Performs basic arthimetic operation on the given 2 nos
    Supported operations are add, multiply, divide and subtract
    """
    try:
        if operation == "add":
            result = no1+no2
        elif operation =="multiply":
            result = no1*no2
        elif operation == "subtract":
            result = no1 - no2
        elif operation == "divide":
            if no2 == 0:
                return {"error": "Division by 0 error"}
            result = no1/no2
        
        return {
            "no1": no1,
            "no2": no2,
            "operation": operation,
            "result": result
        }
    except Exception as e:
        return {"error": str(e)}

# List of tools
tools = [calculator, search_tool]

model = ChatGroq(model = "qwen/qwen3-32b")
model_with_tools = model.bind_tools(tools)

class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


def chat_node(state: State):
    
    response = model_with_tools.invoke(state["messages"])
    
    return {"messages": [response]}

tool_node = ToolNode(tools)

# Creating SQL database
# sqlite3.connect(database = "Database name", check_same_thread = "Boolean")
# If database does not exist it will create it in the current project directory. 
# If check_same_thread is set to False, then the information about all threads will be stored in the same db else for each thread a different db will exist
conn = sqlite3.connect(database = "chatbot.db", check_same_thread=False)

# Now pass the SQL database connection object to the SqliteSaver
checkpointer = SqliteSaver(conn = conn)


# Defining the graoh
graph = StateGraph(State)

# Adding Nodes
graph.add_node("chat_node", chat_node)
graph.add_node("tools", tool_node)

# Adding edges
graph.add_edge(START, "chat_node")
graph.add_conditional_edges("chat_node", tools_condition)
graph.add_edge("tools", "chat_node")

# Worklfow creation
workflow = graph.compile(checkpointer = checkpointer)


def retrieve_all_threads():
    """
    Retrieves all the threads thats stored in the database
    """
    all_threads = set()
    # checkpointer.list(None) returns all the checkpoints information thats stored in the database, you can also specify the thread_id and it fetches only checkpoints related to that thread ID
    for checkpoint in checkpointer.list(None):
        all_threads.add(checkpoint.config["configurable"]["thread_id"])

    return list(all_threads)