from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from config import db, bcrypt, ma
from sqlalchemy import CheckConstraint
from sqlalchemy.exc import IntegrityError


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String)
    placed_order = db.relationship("Work", back_populates="requested_by")


class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    username = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String)
    work_order = db.relationship("Work", back_populates="assigned_to")


class Work(db.Model):
    __tablename__ = "work_orders"

    id = db.Column(db.Integer, primary_key=True)
    requested_by = db.relationship("User", back_populates="placed_order")
    assigned_to = db.relationship("Employee", back_populates="work_order")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    # add way to have completed at column that updates when completed is updated

    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
