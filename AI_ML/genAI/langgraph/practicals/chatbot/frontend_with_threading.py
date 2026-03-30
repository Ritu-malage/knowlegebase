"""
Frontend script with threads enabled
- You can create multiple chats
- Dyanamic thread IDs will be created instead of a hardcoded thread ID
- For each session a new thread ID will be assigned
- Thread ID will be displayed 
- When the chat is refreshed all the history is lost as we are using InMemory persistence. To avoid this we will need to store the history in the database

"""
import streamlit as st
import re
from backend import workflow
from langchain_core.messages import HumanMessage
import uuid

def generate_thread_id():
    """
    Function to dyanamically generate new thread IDs
    """
    thread_id = uuid.uuid4()
    return thread_id

def reset_chat():
    # Generate a new thread ID
    thread_id = generate_thread_id()

    # Store this thread ID in the session state
    st.session_state["thread_id"] = thread_id

    # Add the thread into the session state
    add_thread(thread_id= thread_id)

    # We need to clear up the message history 
    st.session_state["message_history"] = []

def add_thread(thread_id):
    """
    Adds threads into the session_state
    """
    if thread_id not in st.session_state["chat_threads"]:
        st.session_state["chat_threads"].append(thread_id)


def load_conversation(thread_id):
    """
    Loads all the HumanMessages and AIMessages associated with that specific thread ID
    """
    config = {"configurable":{"thread_id": thread_id}}

    # Only if the state is not Null we load the conversations within that state
    if "messages" in workflow.get_state(config).values:
        return workflow.get_state(config).values["messages"]
    else:
        return []


def filter_streaming_response(initial_state, config):
    """
    It processes the response and sometimes if it has a think block it removes the content within that and prints only whats required
    """
    inside_think = False
    for message_chunk, metadata in workflow.stream(
        initial_state,
        config,
        stream_mode = "messages"
    ):
        token = message_chunk.content
        if "<think>" in token:
            inside_think = True
            continue
        if "</think>" in token:
            inside_think = False 
            continue
        if not inside_think:
            yield token


# def filter_response(response):
    
# ********** SETUP ****************

# If message_history is not present in the session_state we create it. If a normal dictionary was used to maintain the history then when we press enter it erases the entire history
if "message_history" not in st.session_state:
    st.session_state["message_history"] = []

# Maintains the list of all the threads - so that the chat is not lost
if "chat_threads" not in st.session_state:
    st.session_state["chat_threads"] = []

# Generating thread_id
if "thread_id" not in st.session_state:
    st.session_state["thread_id"] = generate_thread_id()
    add_thread(thread_id=st.session_state["thread_id"])


config = {"configurable": {"thread_id": st.session_state["thread_id"]}}

# *********** SIDEBAR ************
st.sidebar.title("ChatBot")

# When new chat button is clicked we need to reset the chat
if st.sidebar.button("New Chat"):
    reset_chat()

# Displaying all the thread IDs
for thread_id in st.session_state["chat_threads"][::-1]: # Reverse is done so that the latest chat is displayed on the top rather than bottom, in list if we append it goes to the end, so we are reversing it
    # Creating a button for each chat thread
    if st.sidebar.button(f"Thread ID: {thread_id}"):
        # Current thread must be set as the thread_id
        st.session_state["thread_id"] = thread_id

        # When the button is clicked the whole conversation associated with that thread must be loaded
        messages = load_conversation(thread_id = thread_id)

        # Bringing the messages into the format thats stored in message_history
        message_history_format = []
        for message in messages:
            if isinstance(message, HumanMessage):
                role = "user"
            else:
                role = "assistant"
            
            # As the messages have <think> </think> Block, cleaning that up and then displaying all the messages
            cleaned_message = re.sub(r"<think>.*?</think>", "", message.content, flags=re.DOTALL)

            message_history_format.append({"role": role, "content": cleaned_message})
        

        st.session_state["message_history"] = message_history_format


# To display all the messages in the chat_history we run a loop
for message in st.session_state["message_history"]:
    with st.chat_message(message["role"]):
        st.text(message["content"])

user_input = st.chat_input("Type Here")



# Displaying the current user message and AI response
if user_input:
    with st.chat_message("user"):
        st.session_state["message_history"].append({"role": "user", "content": user_input})
        st.text(user_input)
    
    initial_state = {"messages": [HumanMessage(content = user_input)]}
    
    with st.chat_message("assistant"):
        # The streaming generator object i.e. workflow.stream() returns message_chunk and metadata. Extracting only the message_chunk.content from message_chunk.
        response = st.write_stream(filter_streaming_response(initial_state=initial_state, config=config))
        print(response)
        st.session_state["message_history"].append({"role": "assistant", "content": response})
        
    
    