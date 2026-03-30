"""
Frontend script with streaming enabled

"""

import streamlit as st
import re
from backend import workflow
from langchain_core.messages import HumanMessage

config = {"configurable": {"thread_id": "1"}}

# If message_history is not present in the session_state we create it. If a normal dictionary was used to maintain the history then when we press enter it erases the entire history
if "message_history" not in st.session_state:
    st.session_state["message_history"] = []



# To display all the messages in the chat_history we run a loop
for message in st.session_state["message_history"]:
    with st.chat_message(message["role"]):
        st.text(message["content"])

user_input = st.chat_input("Type Here")


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
        
    
    
    