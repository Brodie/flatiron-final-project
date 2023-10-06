import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import "./WorkForm.css";

function WorkForm({ user, addWorkOrder }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  const formSchema = yup.object().shape({
    info: yup
      .string()
      .max(500, "No more than 500 characters allowed")
      .required("Please include additional info"),
    image: yup.mixed().optional(),
    image_name: yup.string().optional(),
  });

  const formik = useFormik({
    initialValues: {
      info: "",
      image: "null",
      image_name: "",
    },
    validationSchema: formSchema,

    onSubmit: (values) => {
      const formData = new FormData();
      formData.append("info", values.info);
      formData.append("image", values.image);
      formData.append("image_name", values.image_name);

      fetch("/work_order", {
        method: "POST",
        body: formData,
      }).then((res) => {
        if (res.ok) {
          res.json().then((wo) => {
            addWorkOrder(wo);
            navigate("/home");
          });
        } else {
          res.json().then((err) => {
            setTimeout(() => {
              setErrors([]);
            }, 3500);
            setErrors([...errors, err.errors]);
          });
        }
      });
    },
  });

  return (
    <div className="workform-container">
      <h1 className="form-title">Submit a Work Order for Us!</h1>
      <form className="work-order-form" onSubmit={formik.handleSubmit}>
        <label htmlFor="name">Name:</label>
        <br />
        <input id="name" readOnly={true} value={user.name.toUpperCase()} />
        <br />
        <label htmlFor="email">Email:</label>
        <br />
        <input id="email" readOnly={true} value={user.email} />
        <br />

        <br />
        <label htmlFor="info">Add Work details here!</label>
        <br />
        <textarea
          id="info"
          name="info"
          style={{ height: "80px" }}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.info}
        />
        <br />
        <label htmlFor="image">Upload Image:</label>
        <br />
        <input
          id="image"
          name="image"
          type="file"
          onChange={(e) => {
            formik.setFieldValue("image", e.currentTarget.files[0]);
          }}
        />
        <br />
        <label htmlFor="image_name">Image Description</label>
        <br />
        <input
          id="image_name"
          name="image_name"
          onChange={formik.handleChange}
          value={formik.values.image_name}
        />
        <br />
        <br />
        <p style={{ color: "red" }}>{formik.errors.info}</p>
        <button type="submit">Submit Work Order!</button>
      </form>
      <h2>
        {errors.map((err) => (
          <p key={err} style={{ color: "red" }}>
            {err}
          </p>
        ))}
      </h2>
    </div>
  );
}

export default WorkForm;
