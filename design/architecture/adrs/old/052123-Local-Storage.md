# Decision: Local Storage
## status: accepted
## date: 05-21-23 when the decision was last updated
## deciders: all team members
## consulted: Professor Powell, TA Akshay
## informed: all team members 
## Context and Problem Statement: We need to decide on how to store out database which include 22 tarot cards (name, image, fortune intepretation,..)

# Why this decision?

## Considered Options

- Local Storage Json
- Local Storage Array
- API Call


## Decision Outcome

### Chosen option: Local Storage Jason

### Details

- We choose to use local storage instead of any cloud, hub or server. For details, we store our tarot card inside the json file, which include all the card name, image of the card, fortune intepretation of each card and more. 

- Json will also be the space where we store any data that we collect during the game process or user input. We will transfer and use the data between files also through json by parsing and adding into the json file. 

### Consequence 
- Good, becuase we able to handle the data locally offline and without worry about server shutdown. 
- Bad, because data need to input manually. 


## Pros and Cons of the Options


### Local Storage Json

- Good, because using local storage allow us to have a practice of implement local first software, which is a set of principles for software that enale both collaborattion and ownership for the user. This will give us as developers more power and flexibility over data, as we don't have to go through any server when modidify our data. It will also easier to access the data locally since there is no restrictions that might be required from the host server, such as certain server will limit number of api calls in a day or you will have to pay them to get more calls. 
- Good, because if a server is shut down, the software stop function and all data might be lost. By using local storage, we can avoid this flaw and make sure that there will be no lost of data or worry the fact that our software might be break down unpredictably and we have no control over it. Because if we use a server and the server break down, then your team will be in a passive prosisiton where you can only count on the main server to be fixed in the meantime. 
- Good, because you can run your software while offline. This function will make it easier for both the user and the developer. 
- Bad, because the database can't be too big because we have to handle it manually so it will take a lot of efforts to input data. 

### Local Storage Array

- Good, because using local storage allow us to have a practice of implement local first software, which is a set of principles for software that enale both collaborattion and ownership for the user. This will give us as developers more power and flexibility over data, as we don't have to go through any server when modidify our data. It will also easier to access the data locally since there is no restrictions that might be required from the host server, such as certain server will limit number of api calls in a day or you will have to pay them to get more calls. 
- Good, because if a server is shut down, the software stop function and all data might be lost. By using local storage, we can avoid this flaw and make sure that there will be no lost of data or worry the fact that our software might be break down unpredictably and we have no control over it. Because if we use a server and the server break down, then your team will be in a passive prosisiton where you can only count on the main server to be fixed in the meantime. 
- Good, because you can run your software while offline. This function will make it easier for both the user and the developer. 
- Bad, because the database can't be too big because we have to handle it manually so it will take a lot of efforts to input data. 
- Bad becuase it won't give as much flexibility like the json file and it is very hard to handle the data. 

### API Call
- Good, because there is a big data base that can be used. If we use cloud or a server then we can store a lot of data in it and can use it easily. There is also a lot of existed database for tarot cards that can be used online. 
- Good, because it will take less efforts when handling data because the cloud or the server will do everything for us. 
- Bad, because there might be some restrictions in API, such as  as certain server will limit number of api calls in a day or you will have to pay them to get more calls. 
- Bad, because if the server is shut down, then all data that we stored will be lost and there is nothing we can do about it becuase the server is no something we are in control of. 
- Bad, because users and developers can't run it offline. 
## More Information
 - None
