import React from "react";
import { useLocation } from "react-router-dom";

function Authenticate() {
  const location = useLocation();
  const { isEmployee } = location.state;
  return <div>Authenticate: {isEmployee ? "true" : "false"}</div>;
}

export default Authenticate;
