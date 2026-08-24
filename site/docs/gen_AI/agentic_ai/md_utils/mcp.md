# MCP
- Model Context Protocol
- From Anthropic
- It’s not a framework for building tool
- It’s a standard protocol that is agreed upon.
- It’s like saying do thing’s in this manner
- Its a standard way for an AI Application to connect to the external tools.
- It’s like an USB C port for AI applications i.e. Multiple devices can connected to the same port
- Just like USB allows your laptop to connect to: Mouse, Keyboard, Hard drive, Phone etc. MCP Allows an AI Application to connect to GitHub, Slack, APIs, Jira etc
- To know the list of MCPs present/ marketplace of MCP servers you can refer to sites like glama.ai and smithery.ai

# Advantages of MCP

- It’s easy to integrate with the tools that are built by others
- There is a very huge ecosystem of MCP tools as there are so many tools being written everyday and these tools can be reused by our agents

# Why do we need MCP?

- AI agents can connect to many other tools which are built by others
- It reduces the need for building a custom integration for each and every tool
- For eg: If your AI Agent needs to work with Jira, Slack, GitHub etc, without MCP we will need to build a custom integration for each
- But with MCP we can have a single MCP Client defined which goes and talks to the MCP Server(GitHub, Slack, Jira)
- MCP has the ability to list the tools a particular MCP server has

# 3 pillars of MCP

- MCP Host
- MCP Client
- MCP Server

# MCP Host

- It’s the LLM, or the agent which has access to LLM, the harness(Codex, Claude Code, etc.) or your Application where AI is running
- Our AI application (MCP Host) wants to use the MCP Server.
- For every MCP tool there is a Client. So if you want to access 3 MCP servers then 3 MCP clients must be defined

# MCP Client

- If our agent wants to access the MCP tools then within our software or application we need to create an MCP Client
- The MCP Client creates the connection to an MCP Server.
- The Client talks to MCP Server using the MCP Protocol
- The Client is present inside the application(MCP Host)
- MCP client spawns another process which is MCP server
- 

# MCP Server

- The MCP client connects to MCP server
- MCP Server is the one which has the actual access to the MCP Tools
- This is written by the 3rd party
- MCP Servers have the ability to
    - List out the tools
    - Call the tools
- MCP servers describes the API endpoints in the natural language with a description.
- These descriptions can be used by LLMs to understand when to call which MCP tool
- Calling a tool is equivalent to making an API request
- MCP Server can be running on our local system or on the remote system

# Transport mechanism

- The MCP client connect to MCP Server
- It communicates using
    - MCP Protocol:  Defines what they are talking
    - Transport mechanism: Defines how the message is going to travel
- This communication can happen in multiple ways
    - STDIO
        - Standard Input and Output
        - Most commonly used
        - Here MCP Server runs as a local process on the same machine as that of the MCP Client
        - Here the Client starts the MCP Server as a process
        - The client passes the inputs via standard input and the output from the server is returned as a standard output which will be used as the response given by the MCP server
        - We need to provide the parameters to the MCP server. When its running locally the parameters will describe a local process that you want to spawn (Command thats used to run the server/ process locally)
        - Example 1: If the MCP server is a python process then the parameters to the server would look like {command: uvx, args :[mcp-server-fetch]}
        - Example 2: If it’s Java then {command: npx , args:[@playwritr/mcp@latest]}
        - So `uvx` is used for python servers, `npx` is used for node and Javascript servers and docker for servers packaged as a container
    - Streamable HTTP
        - Used when MCP server is running on the remote server
        - Here the messages between the client and the server will travel over HTTP
        - The server is already running as a HTTP service
        - The client sends out a HTTP request to that endpoint
        - When the MCP server is running on remote machine/cloud we cannot use stdio as the server is not running locally on the machine
        - But if the MCP server is running locally we can communicate with the server using stdio or streamable HTTP
        - The parameters of MCP server would contain the remote URL. Eg: {url:https://abc.com/mcp, timeout:60}

# Steps to connect to an MCP Server (Already built) using OpenAI SDK

- Aim is to understand how to connect to the MCP server which has been built by some 3rd party
- We are not building the MCP Server
- Example for the 3rd party MCP server is Fetch. This is responsible to fetch information from the web given the URL
- This MCP server has only 1 tool which is the fetch tool
- The below code shows how to connect to the MCP server using the OpenAI SDK

```python
import agents.mcp.server
from agents.mcp import MCPServerStdio
import subprocess

# Parameters of the Fetch MCP Server
server_params = {
	"command": "uvx",
	"args": ["mcp-server-fetch"]
}

async with MCPServerStdio(params = server_params, client_session_timeout_seconds = 60) as server:
	# List out all the tools that the MCP server supports
	tools = await server.list_tools()
	
	# Call the fetch tool
  result = await server.call_tool(
        "fetch",
        {
            "url": "https://en.wikipedia.org/wiki/Sachin_Tendulkar"
        }
    )

	
```

- Each tool will have its
    - Name
        - Unique identifier that is used during tool calling
    - Title
        - Human readable display name
    - Description
        - Explains what the tool does. This is used by the LLM to decide when to call what tool
    - Input Schema
        - Defines the arguments the tool accepts
        - Its a JSON Blob
        - It defines each of the input arguments in the natural language
    - Output Schema
        - Defines the structured output returned by the tool, if provided
    - Annotations
        - Metadata/hints about the tool's behavior
    - Execution
        - Execution-related metadata
- When you use an agentic framework such as the OpenAI Agents SDK, you normally do not implement the MCP client yourself. The framework provides the MCP client functionality and manages the connection, tool discovery, and tool invocation for you.
- We dont have to use `list_tools` `call_tool` functions. This is just for our understanding. When agents come into picture the server is directly passed as mcp_servers

```python
async with MCPServerStdio(
    params={
        "command": "uvx",
        "args": ["mcp-server-fetch"]
    }
) as server:

    agent = Agent(
        name="Research Agent",
        instructions="Use the MCP tools when necessary.",
        mcp_servers=[server]
    )

    result = await Runner.run(
        agent,
        "Fetch https://example.com and summarize it."
    )
```

# Giving the agent access to more than 1 MCP Server

```python
# MCP Server 1
server_1 = MCPServerStdio(
    params={
        "command": "...",
        "args": [...]
    }
)

# MCP Server 2
server_2 = MCPServerStdio(
    params={
        "command": "...",
        "args": [...]
    }
)

async with server_1, server_2:

    agent = Agent(
        name="My Agent",

        instructions="""
        Use the available MCP tools whenever appropriate.
        """,

        mcp_servers=[
            server_1,
            server_2
        ]
    )

    result = await Runner.run(
        agent,
        "Do something that requires tools from both servers."
    )

    print(result.final_output)
```

- The agent SDK will handle the routing of the tool call to the right MCP server. We dont have to write the logic for routing

# Connecting to a Remote MCP Server using OpenAI SDK

```python
from agents.mcp import MCPServerStreamableHttp

server_params = {
	"url": "https://mcp.context7.com/mcp", 
	"timeout":60
}

server = MCPServerStreamableHttp(
	name = "Context7", 
	params = server_params
)

async with server:
	agent = Agent(
		name = "expert", 
		instruction="Use Context7 to answer the questions",
		mcp_servers = [server],
		model = "gpt-4o-mini"
	)
	
	result = await Runner.run(agent, question)

```

# Pros and Cons of Building Your Own MCP Server

## Pros

- Enables others to access and use your tools
- Tools become reusable across multiple agents

## Cons

- Adds another service that must be maintained
- If the tool is intended only for personal use, exposing it as an MCP server introduces unnecessary complexity and performance overhead (since it requires spinning up another process)
- For personal tools, it is better to use them directly as tools rather than converting them into MCP
- MCP is more suitable when integrating third-party tools
- Scalability considerations must be addressed while building our own MCP servers

# How to create our own MCP

- Fast MCPs `@mcp.tool` decorator registers a python function as an MCP tool
- Initially we will have a service, a simple python file with N functions

```python
# employee_service.py

employees = [
    {
        "id": 1,
        "name": "Ritu",
        "department": "AI/ML",
        "role": "AI Engineer",
        "leave_balance": 18,
    },
    {
        "id": 2,
        "name": "Rahul",
        "department": "Engineering",
        "role": "Software Engineer",
        "leave_balance": 12,
    },
]

# Function to get information of the employee given the ID
def get_employee_by_id(employee_id: int):
    for employee in employees:
        if employee["id"] == employee_id:
            return employee

    return None

# Function to search information of the employee by department
def search_employees_by_department(department: str):
    return [
        employee
        for employee in employees
        if employee["department"].lower() == department.lower()
    ]
```

- This is a simple python service. It does not have any information about the MCP
- Create MCP Server

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
	name = "Name of the MCP Server",
	instruction = """This is MCP server around so and so service. This provides
	tools such as tool1, tool2, and tool3 """, # This instruction is used by teh LLM to understand what this MCP server does
	json_response = True, # Returns the response in the JSON format
	
)
```

- Final Script

```python
# server.py

from mcp.server.fastmcp import FastMCP

from employee_service import get_employee_by_id, search_employees_by_department

# Create an MCP server
mcp = FastMCP(name = "Employee MCP Server")

@mcp.tool
def get_employee(employee_id: int) -> dict:
	"""
	Get employee details using the employee ID
	"""
	
	employee = get_employee_by_id(employee_id)

    if employee is None:
        return {
            "error": f"Employee {employee_id} not found"
        }

    return employee

@mcp.tool
def search_employees(department: str) -> list[dict]:
    """
    Search employees by department.
    """

    return search_employees_by_department(department)
    

if __name__ == "__main__":
    mcp.run()
```

- After using `@mcp.tool` decorator on the function get_employee, it is now an MCP tool rather than it being a simple python function
- FastMCP internally derives these informations
    - Tool Name: get_employee
    - Description: Get employee details using the employee ID
    - Input: employee_id → int
    - Output: Dictionary
- MCP client can figure out that get_employee tool exists
- The LLM will not directly call the employee_service.py Instead the LLM calls the MCP Client, then client talks to the MCP Server then it talks to the employee_service
- The employee MCP Server will exposes 2 tools i.e. get_employee and serach_employee
- When we run python server.py FastMCPs `run()` will internally use stdio as the transport
- But if you want to connect to a remote MCP server then it will be

```python
if __name__ == "__main__":
	mcp.run(
		transport="http",
		host="127.0.0.1",
		port=8000
	)
```

- So if you run `python server.py` the MCP Server will be present at http://127.0.0.1:8000/mcp
- To test our MCP Server we can connect to the FastMCPs client

```python
# client.py

import asyncio

from fastmcp import Client

async def main():
	client = Client("http://localhost:8000/mcp")
	
	async with client:
		# Discover tools
		tools = await client.list_tools()
		
		# Tool call
		result = await client.call_tool(
			"get_employee",
			{
				"employee_id": 1
			}
		)
		
if __name__ == "__main__":
    asyncio.run(main())
```