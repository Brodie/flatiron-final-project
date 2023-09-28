import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

function Authenticate() {
  const location = useLocation();
  const { isEmployee } = location.state;
  const navigate = useNavigate();

  const formSchema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Must enter email"),
    name: yup.string().required("Name required"),
    username: yup.string().required("Username required"),
    password: yup.string().required("Password required"),
    passConfirm: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match"),
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
      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // add null and 2 for readability when viewing data
        body: JSON.stringify(values, null, 2),
      }).then((res) => {
        if (res.ok) {
          res.json().then((user) => {
            updateUser(user);
            navigate("/");
          });
        }
      });
    },
  });

  return <div>Authenticate: {isEmployee ? "true" : "false"}</div>;
}

export default Authenticate;
