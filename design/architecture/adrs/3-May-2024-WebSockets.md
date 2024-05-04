# Decision: Use of WebSockets for backend
### Status: Accepted ✅
### Date: 3 May 2024
### Deciders: All team members
### Consulted: TA Gagan

## Context and Problem Statement: We need to decide how we want to implement the backend for multiplayer features

# Why this decision?

## Considered Options
We also considered just using HTTP polling or long polling, but deemed that would incur unnecessary server strain without substantial benefit. WebRTC seemed it could be promising as it is designed for peer-to-peer connections, but we thought that WebSockets would be simpler to implement (especially when we want to implement metrics and server-side analytics later on). Instead of Node, we considered a Java backend but thought that keeping everything in the JavaScript ecosystem would lead to better developer experience without significant loss of performance.

## Decision Outcome

### Chosen option: Use WebSockets to implement multiplayer features on the backend

### Details
- We will use Node.js and the [websocket](https://www.npmjs.com/package/websocket) library to implement the WebSocket infrastructure
- We will host the backend on [render](https://render.com)

### Consequence 
- Good, because it enables fast streaming of content from one user to another
- Good, because it enables server-side oversight of user actions (e.g., to prevent potential exploiting)
- Good, because it leads to an easier conceptual model for developers
- Good, because the use of the websocket library allows us to not have to re-invent the wheel
- Bad, because we will have some dependencies (i.e., one direct dependency, but also the its child dependencies) that we will have to monitor
- Bad, because it leads to higher server strain as opposed to occassional polling with high in-between

## More Information
 - None
