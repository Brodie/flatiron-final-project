import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

function WorkForm({ user }) {
  const formSchema = yup.object().shape({
    info: yup.string().required("Please Include Info"),
  });

  return <div>WorkForm</div>;
}

export default WorkForm;
