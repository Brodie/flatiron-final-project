import os
import imghdr
import uuid
from flask import request, session, send_from_directory
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from config import app, db, api, ma
from models import User, Employee, Work, Image
from random import choice as rc


def validate_image(stream):
    header = stream.read(512)
    stream.seek(0)
    format = imghdr.what(None, header)
    if not format:
        return None
    return "." + (format if format != "jpeg" else "jpg")


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
    images = ma.Nested("ImageSchema", many=True, exlude=("work_order",))


single_work_schema = WorkSchema()
plural_work_schema = WorkSchema(many=True)


class ImageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Image

    id = ma.auto_field()
    name = ma.auto_field()
    file_path = ma.auto_field()
    work_id = ma.auto_field()


single_img_schema = ImageSchema()
plural_img_schema = ImageSchema(many=True)

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
            return {"errors": "passwords do not match"}, 422

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
                return {"errors": "employee does not exist"}
            if emp and emp.authenticate(user_info.get("password")):
                session["emp_id"] = emp.id
                return single_emp_schema.dump(emp), 200
            else:
                return {"errors": "password incorrect"}, 401

        # user sending request
        user = User.query.filter(User.email == user_info.get("email")).first()

        if not user:
            return {"errors": "user not found"}, 404

        if user and user.authenticate(user_info.get("password")):
            session["user_id"] = user.id
            return single_user_schema.dump(user), 200
        else:
            return {"errors": "password incorrect"}, 401


class Logout(Resource):
    def delete(self):
        session["user_id"] = None
        session["emp_id"] = None

        return {}, 202


class WorkOrders(Resource):
    def get(self):
        work_orders = [single_work_schema.dump(work) for work in Work.query.all()]
        return {"work_orders": work_orders}, 200

    def post(self):
        info = request.form.get("info")
        image_name = request.form.get("image_name")
        image = request.files.get("image")

        # check if filepath already exists. append random string if it does
        if secure_filename(image.filename) in [
            img.file_path for img in Image.query.all()
        ]:
            unique_str = str(uuid.uuid4())[:8]
            image.filename = f"{unique_str}_{image.filename}{ext}"

        #
        # change this before deploying
        # either add admin role that can create employees from front end
        # or create an admin employee to assign work to
        #
        # using test employee to test frontend
        emps = Employee.query.filter(Employee.username == "brodie").first()
        user = User.query.filter(User.id == session["user_id"]).first()

        #  handling file uploads
        filename = secure_filename(image.filename)
        if filename:
            file_ext = os.path.splitext(filename)[1]
            if file_ext not in app.config[
                "UPLOAD_EXTENSIONS"
            ] or file_ext != validate_image(image.stream):
                return {"error": "File type not supported"}, 400

            image.save(os.path.join(app.config["UPLOAD_PATH"], filename))

            img = Image(name=image_name, file_path=filename)
            img_list = [img]
            db.session.add(img)
            db.session.commit()

        wo = Work(info=info, requested_by=user, assigned_to=emps, images=img_list)

        try:
            db.session.add(wo)
            db.session.commit()
            return single_work_schema.dump(wo), 201

        except IntegrityError as e:
            errors = []

            if not info:
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
        if session.get("emp_id"):
            emp = Employee.query.filter(Employee.id == session["emp_id"]).first()
            return single_emp_schema.dump(emp), 200

        user = User.query.filter(User.id == session.get("user_id")).first()

        if user:
            return single_user_schema.dump(user), 200
        else:
            return {}, 401


class Images(Resource):
    def get(self, id):
        img = Image.query.filter(Image.id == id).first()
        path = img.file_path
        return send_from_directory(app.config["UPLOAD_PATH"], path)


api.add_resource(Images, "/static/uploads/<int:id>")
api.add_resource(CheckSession, "/check_session")
api.add_resource(WorkOrderById, "/work_order/<int:id>")
api.add_resource(WorkOrders, "/work_order")
api.add_resource(Login, "/login")
api.add_resource(Logout, "/logout")
api.add_resource(Signup, "/signup")

if __name__ == "__main__":
    app.run(port=5555, debug=True)
