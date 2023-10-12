import React from "react";
import "./CreateEmp.css";
import { useFormik } from "formik";
import * as yup from "yup";

function CreateEmp({ emp }) {
  const formSchema = yup.object().shape({
    username: yup.string().required("Please Include Username"),
    name: yup.string().required("Please Enter Name"),
    password: yup.string().required("Password Required"),
    passConfirm: yup
      .string()
      .oneOf([yup.ref("password"), "Passwords must match"]),
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
    onSubmit: (values) => {},
  });

  return <div>CreateEmp</div>;
}

export default CreateEmp;
