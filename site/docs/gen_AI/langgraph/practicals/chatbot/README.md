---
title: ChatBot Implementation
---
# Simple ChatBot using Streamlit

## Codebase
- [CLICK HERE](https://github.com/Ritu-malage/knowlegebase/blob/main/site/docs/gen_AI/langgraph/practicals/chatbot) to access the codebase

## Steps to run the chatbot
- Simple chatbot with no memory
```bash
streamlit run frontend.py
```

- Chat with streaming of responses
```bash
streamlit run frontend_with_streaming.py
```

- Maintaining multiple threads within a single run using InMemorySaver
```bash
streamlit run frontend_with_threading.py
```

- Maintaining multiple threads using SqliteSaver and tool integration
```bash
streamlit run frontend_with_db.py
```