"""
Frontend script without streaming enabled
So once the user provides a question, only after generating the full 
response from the LLM it will show up to the user
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

# Displaying the current user message and AI response
if user_input:
    with st.chat_message("user"):
        st.session_state["message_history"].append({"role": "user", "content": user_input})
        st.text(user_input)
    
    initial_state = {"messages": [HumanMessage(content = user_input)]}
    
    response = workflow.invoke(initial_state, config)
    ai_response = response["messages"][-1].content
    # Cleaning the AI response, as it has the <think> mode in the response
    cleaned_ai_response = re.sub(r"<think>.*?</think>", "", ai_response, flags=re.DOTALL).strip()

    with st.chat_message("assistant"):
        # The AI message must come from the graph build, thus the workflow must be imported
        
        st.session_state["message_history"].append({"role": "assistant", "content": cleaned_ai_response})
        
        st.text(cleaned_ai_response)