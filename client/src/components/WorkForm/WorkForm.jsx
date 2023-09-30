import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

function WorkForm({ user }) {
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
      image: null,
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
          // handle success
        } else {
          // handle errors
        }
      });
    },
  });

  return (
    <>
      <h1>Submit a Work Order for Us!</h1>
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
          onChange={formik.handleChange}
          value={formik.values.image}
        />
        <br />
        <br />
        <p style={{ color: "red" }}>{formik.errors.info}</p>
        <button type="submit">Submit Work Order!</button>
      </form>
    </>
  );
}

export default WorkForm;
