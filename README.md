# Backyard Ponderful Gardens

Phase 5 Fullstack application

## Description

Fullstack application using Flask, SQLAlchemy and React to create a website for placing work orders for pond maintenance or construction. Ability to sign up as a new user and create work orders that get assigned to Employees in the database

## Installation

After Forking, and copying the SSH, navigate to the folder you wish to clone the repo into and run:

```bash
git clone SSH_File
```

Pasting the copied URL in place of SSH_File

## Usage

After navigating into the directory, navigate into the 'client' directory and run

```bash
npm install
```

This will install the necessary front end dependancies. Then run

```bash
npm start
```

This will launch the application on your local host.

Now open a new terminal, and navigate into the 'server' directory. After doing so run

```bash
pipenv install && pipenv shell
```

This will install the necessary backend dependancies and launch a virtual environment where the application will run.

To start the application, from the virtual environment run:

```bash
python app.py
```

This will start up the backend!

Now that both the Front and Back ends are up and running, the application can be used!

## Information

This started as a website I wanted to build for my Dad, but I soon realized the scope of an actual website is much larger and would consume far more time than I had to work on this project.

With that being said, I still want this to eventually become a website my Dad can use! So I plan on adding features overtime to bring it to that level. At which point I will deploy the website so that it can actually be used!

## Roadmap

- Add more admin features such as ability to create and delete employees, delete and edit any posts
- Add ability for users to add extra photos, edit info, edit comments
- Add method to filter work orders, by either completion status, completion date, user, or employee depending on which is signed in
- Include employee calender with dates of appointments
- Add way to have emails sent to users when they sign up. Create company / website email address that will send emails
- Publish Website!

## Resources

- Docs that I referenced multiple times
    - https://flask.palletsprojects.com/en/2.3.x/
    - https://formik.org/docs/overview
    - https://react.dev/reference/react

- https://unsplash.com/ -- Used for multiple example pond photos

- https://blog.miguelgrinberg.com/post/handling-file-uploads-with-flask -- Blog I referenced to add image uploads to my application

- https://flatironschool.com/ -- Special thanks to Flatiron for taking me on this journey of discovery and learning. 

I'm sincerly grateful to all the instructors that helped along the way and taught me countless new things that I would never of had the confidence to learn on my own. I plan on continuing to advance my skillset and knowledge, building upon the solid foundation they helped establish for me!
