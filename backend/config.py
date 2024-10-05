from dotenv import load_dotenv
import os
from model import db
load_dotenv()
class ApplicationConfig:
    SECRET_KEY = os.environ['MY_SECERET_KEY']
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    
    SESSION_TYPE = "sqlalchemy"
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_SQLALCHEMY = db