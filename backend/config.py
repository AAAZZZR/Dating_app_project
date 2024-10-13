# from dotenv import load_dotenv
# import os
# from model import db
# load_dotenv()
# class ApplicationConfig:
#     SECRET_KEY = os.environ['MY_SECERET_KEY']
#     SQL_ALCHEMY_TRACK_MODIFICATIONS = False
#     SQLALCHEMY_ECHO = True
#     SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    
#     SESSION_TYPE = "sqlalchemy"
#     SESSION_PERMANENT = False
#     SESSION_USE_SIGNER = True
#     SESSION_SQLALCHEMY = db
from dotenv import load_dotenv
import os
from model import db

# Load environment variables
load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.getenv('MY_SECRET_KEY', 'default-secret-key')  # Provide a default for safety
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    # Use DATABASE_URL from the environment, fallback to Docker connection if not set
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DEPLOY_DATABASE_URL',
        'postgresql+psycopg2://myuser:mypassword@db:5432/mydb'  # Default for Docker
    )

    SESSION_TYPE = "sqlalchemy"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_SQLALCHEMY = db
