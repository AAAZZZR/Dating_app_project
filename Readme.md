# INFS 3208 Final project - DatingApp
### Description:
User can create activities, post it on website and let people join your activity.
### Tech
- Flask
- Nginx
- React
- PostgreSQL (account management)
- mongoDB (chat)
- redis (real time chat)
### Flow
``` mermaid
graph TD;
    UserRequest["User Request (Browser or Client)"] --> NGINX["NGINX (Reverse Proxy, Ports 80/443)"];
    
    NGINX --> ReactApp["React Application (Port 3000)"];
    NGINX --> FlaskApp1["Flask Application (app.py on Port 5000)"];
    NGINX --> FlaskApp2["Flask Application (chat.py on Port 5001)"];

    FlaskApp1 --> PostgreSQL["PostgreSQL (Port 5432)"];
    FlaskApp2 --> MongoDB["MongoDB (Port 27017)"];
    FlaskApp2 --> Redis["Redis (Port 6379)"];

    PostgreSQL --> RelationalData["Relational Data"];
    MongoDB --> ChatMessages["Chat Messages"];
    Redis --> RealTimeQueue["Real-time Message Queue"];

    ReactApp --> StaticContent["Static Content (HTML/CSS/JS)"];
```



