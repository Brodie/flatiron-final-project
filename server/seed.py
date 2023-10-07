#!/usr/bin/env python3

from random import choice as rc
from faker import Faker
from config import app, db
from models import User, Employee, Work, Comment, Image
import ipdb

fake = Faker()

# with app.app_context():
#     User.query.delete()
#     Employee.query.delete()
#     Work.query.delete()

#     users = []
#     employees = []
#     work_orders = []

#     for i in range(20):
#         user = User(name=fake.unique.name(), email=fake.unique.email())
#         users.append(user)
#         db.session.add(user)
#         db.session.commit()

#         employee = Employee(name=fake.unique.name(), username=fake.unique.first_name())
#         employees.append(employee)
#         db.session.add(employee)
#         db.session.commit()

#     print("seeded users and employees")

#     for i in range(5):
#         order = Work(
#             info=fake.paragraph(nb_sentences=3),
#             requested_by=rc(users),
#             assigned_to=rc(employees),
#         )
#         work_orders.append(order)
#         db.session.add(order)
#         db.session.commit()

#     ipdb.set_trace()


with app.app_context():
    print("deleting all data")

    for user in User.query.all():
        db.session.delete(user)
    for emp in Employee.query.all():
        db.session.delete(emp)
    for work in Work.query.all():
        db.session.delete(work)
    for com in Comment.query.all():
        db.session.delete(com)
    for img in Image.query.all():
        db.session.delete(img)

    db.session.commit()
    print("done")

    first = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Adam"]

    last = ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Taylor"]

    print("creating employees")

    for i in range(5):
        fname = first[i]
        lname = last[i]

        emp = Employee(name=f"{fname} {lname}", username=fname)
        emp.password_hash = "empexample"

        db.session.add(emp)
        db.session.commit()
    print("done")
    print("creating admin")
    admin = Employee(name="brodie ashcraft", username="admin", admin=True)
    admin.password_hash = "Flatiron#123"

    db.session.add(admin)
    db.session.commit()
    print("done")

# users created from front end
# Matt: pass = daredevil
# Bruce pass = batman
# thor pass = asgard
# Reed pass = fantastic
# jean pass = phoenix
