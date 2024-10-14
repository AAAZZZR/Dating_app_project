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
                              +---------------------+
                              |     User Request     |
                              | (Browser or Client)  |
                              +---------------------+
                                       |
                         +-----------------------------+
                         |            NGINX             |
                         |  (Reverse Proxy, Ports 80/443)|
                         +-----------------------------+
                          /                    \
          Frontend Requests                  Backend Requests (/api/)
                 |                                    |
   +---------------------------+         +-------------------------------+
   |      React Application     |         |       Flask Application       |
   |   (Frontend on Port 3000)  |         |     (Backend on Ports 5000,   |
   +---------------------------+         |       5001 for chat.py)       |
            |                            +-------------------------------+
            |                                    /       \
   Static Content                     +-----------------+   +-----------------+
      (HTML/CSS/JS)                   |    PostgreSQL   |   |     MongoDB      |
                                      | (Port 5432)     |   |  (Port 27017)    |
                                      +-----------------+   +-----------------+
                                               |                     |
                                       Relational Data          Chat Messages
                                             (app.py)               (chat.py)

                              +-----------------------------+
                              |            Redis             |
                              |    (Message Queue, Port 6379)|
                              +-----------------------------+
                                   (Enables Real-time Chat)


