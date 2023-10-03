import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";

function CommentForm({ workObj, poster, work, setWork }) {
  const [errors, setErrors] = useState([]);

  const formSchema = yup.object().shape({
    comment_text: yup
      .string()
      .max(150, "150 character limit")
      .required("Empty Comment Cannot be Submitted"),
  });

  const formik = useFormik({
    initialValues: {
      comment_text: "",
      email: poster.email ? poster.email : null,
      username: poster.username ? poster.username : null,
      work_order_id: workObj.id,
    },
    validationSchema: formSchema,
    onSubmit: (values) => {
      fetch(`/comment/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((res) => {
        if (res.ok) {
          res.json().then((comm) => {
            const updatedWork = work.map((obj) => {
              if (obj.id === workObj.id) {
                return {
                  ...obj,
                  comments: [...obj.comments, comm],
                };
              }
              return obj;
            });
            setWork(updatedWork);
          });
        } else {
          res.json().then((err) => {
            setErrors(err.errors);
          });
        }
      });
    },
  });

  return (
    <div className="FormContainer">
      <h3>Enter Comment:</h3>
      <form onSubmit={formik.handleSubmit}>
        <textarea
          id="comment_text"
          name="comment_text"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.comment_text}
        />
        <br />
        <button type="submit">Post Comment</button>
      </form>
      <>
        {formik.errors.comment_text ? (
          <p style={{ color: "red" }}>{formik.errors.comment_text}</p>
        ) : null}
      </>
      <>
        {errors.map((err) => (
          <p key={err} style={{ color: "red" }}>
            {err}
          </p>
        ))}
      </>
    </div>
  );
}

export default CommentForm;
