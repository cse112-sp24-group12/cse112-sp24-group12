# Source
This folder houses all the code for both the client (frontend) and server (backend), located under `./client/` and `./server/` respectively. 

## Frontend
The production deployment of the frontend is housed on Netlify. To deploy the frontend locally, you should run a local server (to avoid CORS issues). For VS Code users, the easiest way to achieve this is to install the Live Sever extension. Other than that, there are no special commands necessary.

## Backend
The production deployment of the backend is housed on Render. To deploy the backend locally, use `npm run dev`.

## Other
### Detailed CI/CD write-up
A more detailed write-up of the exact CI/CD procedures running on this repo can be found at [`design/architecture/ci/PIPELINE.md`](https://github.com/cse112-sp24-group12/cse112-sp24-group12/blob/main/design/architecture/ci/PIPELINE.md)
### Environmental variable note
The file [`./client/scripts/env.js`](https://github.com/cse112-sp24-group12/cse112-sp24-group12/blob/main/source/client/scripts/env.js) houses environmental variables used by the client. Namely, the file currently houses the URL of the WebSocket (i.e., backend). Any movement of hosting services should keep this in mind and ensure that they re-construct said environmental variables through build processes.
