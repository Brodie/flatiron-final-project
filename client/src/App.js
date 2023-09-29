import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import WorkContainer from "./components/WorkContainer/WorkContainer";
import Authenticate from "./components/Authenticate/Authenticate";
import Home from "./components/Home/Home";
import WorkForm from "./components/WorkForm/WorkForm";

function App() {
  const [work, setWork] = useState([]);
  const [user, setUser] = useState(null);
  const [emp, setEmp] = useState(null);

  const updateUser = (user) => setUser(user);
  const updateEmp = (emp) => setEmp(emp);
  const handleSessionCheck = (obj) => {
    if (obj["username"]) {
      setEmp(obj);
    } else {
      setUser(obj);
    }
  };

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          console.log(user);
          handleSessionCheck(user);
        });
      }
    });
  }, []);

  return (
    <>
      <Navigation
        user={user}
        updateUser={updateUser}
        emp={emp}
        updateEmp={updateEmp}
      />
      <Routes>
        <Route
          path={"/home"}
          element={
            <div>
              <Home user={user} work={work} setWork={setWork} />
            </div>
          }
        />
        <Route
          path={"/authenticate"}
          element={
            <div>
              <Authenticate updateUser={updateUser} />
            </div>
          }
        />
        <Route
          path={"/work_order/complete"}
          element={
            <div>
              <WorkContainer work={work} />
            </div>
          }
        />
        <Route
          path={"/work_order/new"}
          element={
            <div>
              <WorkForm user={user} />
            </div>
          }
        />
        <Route path={"/"} element={<div>hello</div>} />
      </Routes>
    </>
  );
}

export default App;
