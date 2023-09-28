from flask import request, session
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError

from config import app, db, api, ma
from models import User, Employee, Work
from random import choice as rc


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User

    id = ma.auto_field()
    name = ma.auto_field()
    email = ma.auto_field()
    _password_hash = ma.auto_field()
    placed_order = ma.Nested("WorkSchema", many=True, exclude=("requested_by",))


single_user_schema = UserSchema(only=("id", "name", "email", "placed_order"))
plural_user_schema = UserSchema(only=("id", "name", "email", "placed_order"), many=True)


class EmployeeSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Employee

    id = ma.auto_field()
    name = ma.auto_field()
    username = ma.auto_field()
    admin = ma.auto_field()
    _password_hash = ma.auto_field()
    work_order = ma.Nested("WorkSchema", many=True, exclude=("assigned_to",))


single_emp_schema = EmployeeSchema(
    only=("id", "name", "username", "admin", "work_order")
)
plural_emp_schema = EmployeeSchema(
    only=("id", "name", "username", "admin", "work_order"), many=True
)


class WorkSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Work

    id = ma.auto_field()
    info = ma.auto_field()
    requested_by = ma.Nested("UserSchema", only=("id", "name", "email"))
    assigned_to = ma.Nested("EmployeeSchema", only=("id", "name", "username"))
    created_at = ma.auto_field()
    completed = ma.auto_field()
    completed_at = ma.auto_field()
    employee_id = ma.auto_field()
    user_id = ma.auto_field()


single_work_schema = WorkSchema()
plural_work_schema = WorkSchema(many=True)

# ######## #
# DA VIEWS #
# ######## #


class Signup(Resource):
    def post(self):
        json = request.get_json()

        if not json.get("email"):
            return {"message": "invalid email"}, 422

        user = User(name=json.get("name"), email=json.get("email"))

        if json.get("password") == json.get("passConfirm"):
            user.password_hash = json.get("password")
        else:
            return {"error": "passwords do not match"}, 422

        if not user:
            return {"message": "invalid user info"}, 422

        try:
            db.session.add(user)
            db.session.commit()

            session["user_id"] = user.id
            return single_user_schema.dump(user), 201
        except IntegrityError as e:
            # Error handling

            errors = []
            keys = ["name", "password", "passConfirm"]

            for key in keys:
                if not json[key]:
                    errors.append(f"{key} is required")

            if isinstance(e, (IntegrityError)):
                for err in e.orig.args:
                    errors.append(str(err))

            return {"errors": errors}, 422


class Login(Resource):
    def post(self):
        user_info = request.get_json()

        #  check if employee is sending request
        if user_info.get("username"):
            emp = Employee.query.filter(
                Employee.username == user_info["username"]
            ).first()
            if not emp:
                return {"error": "employee does not exist"}
            if emp and emp.authenticate(user_info.get("password")):
                session["user_id"] = emp.id
                return single_emp_schema.dump(emp), 200
            else:
                return {"error": "password incorrect"}, 401

        # user sending request
        user = User.query.filter(User.email == user_info.get("email")).first()

        if not user:
            return {"error": "user not found"}, 404

        if user and user.authenticate(user_info.get("password")):
            session["user_id"] = user.id
            return single_user_schema.dump(user), 200
        else:
            return {"error": "password incorrect"}, 401


class Logout(Resource):
    def delete(self):
        session["user_id"] = None

        return {}, 401


class WorkOrders(Resource):
    def get(self):
        work_orders = [single_work_schema.dump(work) for work in Work.query.all()]
        return {"work_orders": work_orders}, 200

    def post(self):
        data = request.get_json()

        emps = Employee.query.all()
        user = User.query.filter(User.id == session["user_id"]).first()

        wo = Work(info=data.get("info"), created_by=user, assigned_to=rc(emps))

        try:
            db.session.add(wo)
            db.session.commit()
            return single_work_schema.dump(wo), 201

        except IntegrityError as e:
            errors = []

            if not data.get("info"):
                errors.append("Please include work info")

            if isinstance(e, (IntegrityError)):
                for err in e.orig.args:
                    errors.append(str(err))

            return {"errors": errors}, 422


class WorkOrderById(Resource):
    def get(self, id):
        pass

    def patch(self, id):
        pass

    def delete(self, id):
        pass


class CheckSession(Resource):
    def get(self):
        user = User.query.filter(User.id == session.get("user_id")).first()

        if user:
            return single_user_schema.dump(user), 200
        else:
            return {}, 401


api.add_resource(CheckSession, "/check_session")
api.add_resource(WorkOrderById, "/work_order/<int:id>")
api.add_resource(WorkOrders, "/work_order")
api.add_resource(Login, "/login")
api.add_resource(Logout, "/logout")
api.add_resource(Signup, "/signup")

if __name__ == "__main__":
    app.run(port=5555, debug=True)
