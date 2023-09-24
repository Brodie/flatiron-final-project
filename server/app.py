from flask import request, session
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import app, db, api, ma
from models import User, Employee, Work


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        exclude = ("_password_hash",)

    placed_order = ma.Nested("WorkSchema", many=True, exclude=("requested_by",))


class EmployeeSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Employee
        exclude = ("_password_hash",)

    work_order = ma.Nested("WorkSchema", many=True, exclude=("assigned_to",))


class WorkSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Work

    requested_by = ma.Nested("UserSchema", only=("id", "name", "email"))
    assigned_to = ma.Nested("EmployeeSchema", only=("id", "name", "username"))


if __name__ == "__main__":
    app.run(port=5555, debug=True)
