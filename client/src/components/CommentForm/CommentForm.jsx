import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

function CommentForm({ showForm, workObj }) {
  const formSchema = yup.object().shape({
    comment_text: yup
      .string()
      .max(150, "150 character limit")
      .required("Empty Comment Cannot be Submitted"),
  });

  const formik = useFormik({
    initialValues: {
      comment_text: "",
    },
    validationSchema: formSchema,
    onSubmit: (values) => {
      fetch(`/work_order/${workObj.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
    },
  });

  if (!showForm) return null;
  return (
    <div className="overlay">
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
            <p>{formik.errors.comment_text}</p>
          ) : null}
        </>
      </div>
    </div>
  );
}

export default CommentForm;
