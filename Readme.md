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
```mermaid
graph TD;
    A[User Request (Browser or Client)] --> B[NGINX (Reverse Proxy, Ports 80/443)];
    
    B --> C[React Application (Port 3000)];
    B --> D[Flask Application (app.py on Port 5000)];
    B --> E[Flask Application (chat.py on Port 5001)];

    D --> F[PostgreSQL (Port 5432)];
    E --> G[MongoDB (Port 27017)];
    E --> H[Redis (Port 6379)];

    F --> I[Relational Data];
    G --> J[Chat Messages];
    H --> K[Real-time Message Queue];

    C --> L[Static Content (HTML/CSS/JS)];
```



