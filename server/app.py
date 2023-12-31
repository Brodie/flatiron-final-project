import os
import imghdr
import uuid
from flask import request, session, send_from_directory
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename

from config import app, db, api, ma
from models import User, Employee, Work, Image, Comment
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
    comments = ma.Nested("CommentSchema", many=True)


single_user_schema = UserSchema(
    only=("id", "name", "email", "placed_order", "comments")
)
plural_user_schema = UserSchema(
    only=("id", "name", "email", "placed_order", "comments"), many=True
)


class EmployeeSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Employee

    id = ma.auto_field()
    name = ma.auto_field()
    username = ma.auto_field()
    admin = ma.auto_field()
    _password_hash = ma.auto_field()
    work_order = ma.Nested("WorkSchema", many=True, exclude=("assigned_to",))
    comments = ma.Nested("CommentSchema", many=True)


single_emp_schema = EmployeeSchema(
    only=("id", "name", "username", "admin", "work_order", "comments")
)
plural_emp_schema = EmployeeSchema(
    only=("id", "name", "username", "admin", "work_order", "comments"), many=True
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
    images = ma.Nested("ImageSchema", many=True, exclude=("work_order",))
    comments = ma.Nested("CommentSchema", many=True)


single_work_schema = WorkSchema()
plural_work_schema = WorkSchema(many=True)


class ImageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Image

    id = ma.auto_field()
    name = ma.auto_field()
    work_order = ma.Nested(
        "WorkSchema",
        exclude=(
            "images",
            "work_order",
        ),
    )
    file_path = ma.auto_field()
    work_id = ma.auto_field()


single_img_schema = ImageSchema()
plural_img_schema = ImageSchema(many=True)


class CommentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comment

    id = ma.auto_field()
    comment_text = ma.auto_field()
    user = ma.Method("user_data")
    employee = ma.Method("emp_data")
    user_id = ma.auto_field()
    emp_id = ma.auto_field()
    work_id = ma.auto_field()

    # couldnt get serialization to work with exclude property, created method to work arount

    def user_data(self, commObj):
        if commObj.user:
            return {
                "id": commObj.user.id,
                "name": commObj.user.name,
                "email": commObj.user.email,
            }
        return None

    def emp_data(self, commObj):
        if commObj.employee:
            return {"id": commObj.employee.id, "name": commObj.employee.name}
        return None


single_comment_schema = CommentSchema()
plural_comment_schema = CommentSchema(many=True)

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
            image.filename = f"{unique_str}_{image.filename}"

        emps = Employee.query.all()

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

        wo = Work(info=info, requested_by=user, assigned_to=rc(emps), images=img_list)

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
    def patch(self, id):
        data = request.get_json()

        wo = Work.query.filter(Work.id == id).first()

        if data.get("completed"):
            wo.complete = True
            db.session.commit()
            return {
                "data": {
                    "message": f"Work marked complete at {wo.completed_at}",
                    "work_id": wo.id,
                }
            }, 202

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


class Comments(Resource):
    def post(self):
        data = request.get_json()
        if not data.get("email") and not data.get("username"):
            return {"errors": ["must be logged in to add comment"]}, 401

        if not data.get("comment_text"):
            return {"errors": ["empty body"]}, 400

        comment = Comment(comment_text=data["comment_text"])

        if data.get("email"):
            poster = User.query.filter(User.email == data["email"]).first()
            comment.user = poster
        else:
            poster = Employee.query.filter(
                Employee.username == data["username"]
            ).first()
            comment.employee = poster

        wo = Work.query.filter(Work.id == data["work_order_id"]).first()
        comment.work_order = wo

        try:
            db.session.add(comment)
            db.session.commit()
            return single_comment_schema.dump(comment), 201

        except IntegrityError as e:
            errors = []

            if isinstance(e, (IntegrityError)):
                for err in e.orig.args:
                    errors.append(str(err))

            return {"errors": errors}, 422


class CommentById(Resource):
    def delete(self, id):
        comm = Comment.query.filter(Comment.id == id).first()
        try:
            db.session.delete(comm)
            db.session.commit()
            return {"message": "comment deleted"}, 202
        except IntegrityError as e:
            errors = []

            if isinstance(e, (IntegrityError)):
                for err in e.orig.args:
                    errors.append(str(err))

            return {"errors": errors}, 422


class Employees(Resource):
    def post(self):
        data = request.get_json()
        emp = Employee(
            name=data["name"], username=data["username"], admin=data["admin"]
        )
        emp.password_hash = data["password"]
        try:
            db.session.add(emp)
            db.session.commit()
            return {"message": "Employee Created"}, 201
        except IntegrityError as e:
            errors = []

            if isinstance(e, (IntegrityError)):
                for err in e.orig.args:
                    errors.append(str(err))

            return {"errors": errors}, 422


api.add_resource(Employees, "/employee")
api.add_resource(Comments, "/comment/new")
api.add_resource(CommentById, "/comment/<int:id>")
api.add_resource(Images, "/images/<int:id>")
api.add_resource(CheckSession, "/check_session")
api.add_resource(WorkOrderById, "/work_order/<int:id>")
api.add_resource(WorkOrders, "/work_order")
api.add_resource(Login, "/login")
api.add_resource(Logout, "/logout")
api.add_resource(Signup, "/signup")

if __name__ == "__main__":
    app.run(port=5555, debug=True)
# test
