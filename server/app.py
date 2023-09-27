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


single_user_schema = UserSchema()
plural_user_schema = UserSchema(many=True)


class EmployeeSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Employee
        exclude = ("_password_hash",)

    work_order = ma.Nested("WorkSchema", many=True, exclude=("assigned_to",))


single_emp_schema = EmployeeSchema()
plural_emp_schema = EmployeeSchema(many=True)


class WorkSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Work

    requested_by = ma.Nested("UserSchema", only=("id", "name", "email"))
    assigned_to = ma.Nested("EmployeeSchema", only=("id", "name", "username"))


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

        if json.get("password") == json.get("confirm_pass"):
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
            keys = ["name", "password", "confirm_pass"]

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


api.add_resource(Login, "/login")
api.add_resource(Logout, "logout")
api.add_resource(Signup, "/signup")

if __name__ == "__main__":
    app.run(port=5555, debug=True)
