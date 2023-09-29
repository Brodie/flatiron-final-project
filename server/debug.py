import ipdb
from config import app, db
from models import Work, User, Employee

with app.app_context():
    if __name__ == ("__main__"):
        ipdb.set_trace()
