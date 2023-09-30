from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from config import db, bcrypt, ma
from sqlalchemy import CheckConstraint
from sqlalchemy.exc import IntegrityError
import re
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String)
    placed_order = db.relationship("Work", back_populates="requested_by")
    comments = db.relationship("Comment", back_populates="user")

    def __repr__(self):
        return f"<User:{self.name}, ID:{self.id}>"

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
    admin = db.Column(db.Boolean, default=False)
    _password_hash = db.Column(db.String)
    work_order = db.relationship("Work", back_populates="assigned_to")
    comments = db.relationship("Comment", back_populates="employee")

    def __repr__(self):
        return f"<Emp:{self.name}, ID:{self.id}>"

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
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    images = db.relationship("Image", back_populates="work_order")
    comments = db.relationship("Comment", back_populates="work_order")

    @hybrid_property
    def complete(self):
        return self.completed

    @complete.setter
    def complete(self, complete):
        if complete == True and not self.complete:
            self.completed = True
            self.completed_at = db.func.now()
            db.session.commit()
        if complete == False and self.complete:
            self.completed = False
            self.completed_at = None
            db.session.commit()

    def __repr__(self):
        return f"<Work Order ID:{self.id}>"


class Image(db.Model):
    __tablename__ = "Image"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    file_path = db.Column(db.String, nullable=False)
    work_order = db.relationship("Work", back_populates="images")
    work_id = db.Column(db.Integer, db.ForeignKey("work_orders.id"))

    def __repr__(self):
        return f"<ImageID: {self.id}"


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    comment_text = db.Column(db.String, nullable=False)
    emp_id = db.Column(db.Integer, db.ForeignKey("employees.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    work_id = db.Column(db.Integer, db.ForeignKey("work_orders.id"))

    work_order = db.relationship("Work", back_populates="comments")
    user = db.relationship("User", back_populates="comments")
    employee = db.relationship("Employee", back_populates="comments")
