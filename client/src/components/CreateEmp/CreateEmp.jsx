import React, { useState } from "react";
import "./CreateEmp.css";
import { useFormik } from "formik";
import * as yup from "yup";

function CreateEmp({ emp }) {
  const [errors, setErrors] = useState([]);

  const formSchema = yup.object().shape({
    username: yup.string().required("Please Include Username"),
    name: yup.string().required("Please Enter Name"),
    password: yup.string().required("Password Required"),
    passConfirm: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match"),
    admin: yup.bool(),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      name: "",
      password: "",
      passConfirm: "",
      admin: false,
    },
    validationSchema: formSchema,
    onSubmit: (values, { resetForm }) => {
      fetch("/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            alert(data.message);
            resetForm();
          });
        } else {
          res.json().then((err) => {
            setTimeout(() => {
              setErrors([]);
            }, 4000);
            setErrors([...errors, err.errors]);
          });
        }
      });
    },
  });

  return (
    <div className="form-container">
      <h2>Create New Employee</h2>
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor="name">Name</label>
        <br />
        <input
          id="name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />
        <br />
        <label htmlFor="username">Username</label>
        <br />
        <input
          id="username"
          name="username"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.username}
        />
        <br />
        <label htmlFor="password">Password</label>
        <br />
        <input
          id="password"
          name="password"
          type="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
        <br />
        <label htmlFor="passConfirm">Re-Enter Password</label>
        <br />
        <input
          id="passConfirm"
          name="passConfirm"
          type="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.passConfirm}
        />
        <br />
        <label htmlFor="admin">Admin?</label>
        <input
          className="admin-box"
          id="admin"
          name="admin"
          onChange={formik.handleChange}
          type="checkbox"
          value={formik.values.admin}
        />
        <br />
        <div className="errors">
          <>{formik.errors.name ? <p>{formik.errors.name}</p> : null}</>
          <>{formik.errors.username ? <p>{formik.errors.username}</p> : null}</>
          <>{formik.errors.password ? <p>{formik.errors.password}</p> : null}</>
          <>
            {formik.errors.passConfirm ? (
              <p>{formik.errors.passConfirm}</p>
            ) : null}
          </>
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
      <>
        {errors.map((err) => (
          <p key={err} className="errors">
            {err}
          </p>
        ))}
      </>
    </div>
  );
}

export default CreateEmp;
