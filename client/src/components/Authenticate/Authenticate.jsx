import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import "./Authenticate.css";

function Authenticate({ handleModelCheck, emp }) {
  // useLocation to determine if employee portal or signup/login was clicked
  const location = useLocation();
  const { isEmployee } = location.state;

  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [signUp, setSignUp] = useState(false);

  const formSchema = yup.object().shape({
    // if employee login email not needed
    email: isEmployee
      ? yup.string().optional()
      : yup.string().email("Invalid email").required("Must enter email"),
    // control whether name is required or not
    name: signUp
      ? yup.string().required("Name required")
      : yup.string().optional(),
    // dynamically control whether username must be included or not
    username: isEmployee
      ? yup.string().required("Username required")
      : yup.string().optional(),
    password: yup.string().required("Password required"),
    // if logging in passConfirm not needed
    passConfirm: signUp
      ? yup.string().optional()
      : yup.string().oneOf([yup.ref("password")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      username: "",
      password: "",
      passConfirm: "",
    },
    validationSchema: formSchema,
    onSubmit: (values) => {
      fetch(signUp ? "/signup" : "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // add null and 2 for readability when viewing data
        body: JSON.stringify(values, null, 2),
      }).then((res) => {
        if (res.ok) {
          res.json().then((model) => {
            handleModelCheck(model);
            navigate(model["username"] ? "/" : "/home");
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
      <h2>{isEmployee ? "Employee Login" : "Login/Signup!"}</h2>
      <>
        <form onSubmit={formik.handleSubmit}>
          {isEmployee ? (
            <>
              <label htmlFor="username">Username</label>
              <br />
              <input
                id="username"
                name="username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
            </>
          ) : (
            <>
              <label htmlFor="email">Email</label>
              <br />
              <input
                id="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
            </>
          )}
          <br />
          {signUp ? (
            <>
              <label htmlFor="name">Name</label>
              <br />
              <input
                id="name"
                name="name"
                type="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              <br />
            </>
          ) : null}
          <>
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
          </>
          <br />
          {signUp ? (
            <>
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
            </>
          ) : null}
          <div className="errors">
            <>
              {isEmployee ? (
                <>
                  {formik.errors.username ? (
                    <p>{formik.errors.username}</p>
                  ) : null}
                </>
              ) : (
                <>{formik.errors.email ? <p>{formik.errors.email}</p> : null}</>
              )}
            </>
            <>
              {formik.errors.password ? <p>{formik.errors.password}</p> : null}
            </>
            <>
              {formik.errors.passConfirm ? (
                <p>{formik.errors.passConfirm}</p>
              ) : null}
            </>
          </div>
          <button type="submit">{signUp ? "Sign Up" : "Login"}</button>
        </form>

        <>
          {errors.map((err) => (
            <p key={err} style={{ color: "red" }}>
              {err}
            </p>
          ))}
        </>

        {isEmployee ? null : (
          <div>
            <h3>{signUp ? "Already a member?" : "Not a member?"}</h3>
            <button onClick={() => setSignUp((prev) => !prev)}>
              {signUp ? "Login" : "Sign-up"}
            </button>
          </div>
        )}
      </>
    </div>
  );
}

export default Authenticate;
