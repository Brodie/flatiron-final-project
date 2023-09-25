from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from config import db, bcrypt, ma
from sqlalchemy import CheckConstraint
from sqlalchemy.exc import IntegrityError
import re


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String)
    placed_order = db.relationship("Work", back_populates="requested_by")

    def __repr__(self):
        return f"<User:{self.name}, ID:{self.id}"

    @hybrid_property
    def password_hash(self):
        raise AttributeError("cannot access")

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode("utf-8"))

    # Validations
    @validates("name")
    def valid_name(self, key, name):
        pattern = r"^[A-Za-z]+ [A-Za-z]+$"
        if not re.match(pattern, name):
            raise ValueError("Invalid Name. Only letters and single space allowed")
        return name

    @validates("email")
    def valid_email(self, key, email):
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, email):
            raise ValueError("Invalid Email")
        return email


class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    username = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String)
    work_order = db.relationship("Work", back_populates="assigned_to")

    def __repr__(self):
        return f"<Emp:{self.name}, ID:{self.id}"

    @hybrid_property
    def password_hash(self):
        raise AttributeError("cannot access")

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode("utf-8"))
        self._password_hash = password_hash.decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode("utf-8"))

    @validates("name")
    def valid_name(self, key, name):
        pattern = r"^[A-Za-z]+ [A-Za-z]+$"
        if not re.match(pattern, name):
            raise ValueError("Invalid Name. Only letters and single space allowed")
        return name


class Work(db.Model):
    __tablename__ = "work_orders"

    id = db.Column(db.Integer, primary_key=True)
    info = db.Column(db.String, nullable=False)
    requested_by = db.relationship("User", back_populates="placed_order")
    assigned_to = db.relationship("Employee", back_populates="work_order")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    # add way to have completed at column that updates when completed is updated

    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    def __repr__(self):
        return f"<Work Order ID:{self.id}"
