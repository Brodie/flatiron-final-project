import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Authenticate from "./components/Authenticate/Authenticate";
import Home from "./components/Home/Home";
import WorkForm from "./components/WorkForm/WorkForm";

function App() {
  const [work, setWork] = useState([]);
  const [user, setUser] = useState(null);
  const [emp, setEmp] = useState(null);

  const updateUser = (user) => setUser(user);
  const updateEmp = (emp) => setEmp(emp);

  const handleModelCheck = (obj) => {
    if (obj["username"]) {
      setEmp(obj);
    } else {
      setUser(obj);
    }
  };

  const addWorkOrder = (wo) => {
    console.log(work);
    setWork([...work, wo]);
  };

  useEffect(() => {
    fetch("/work_order").then((res) => {
      res.json().then((works) => {
        setWork(works.work_orders);
      });
    });
  }, []);

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          console.log(user);
          handleModelCheck(user);
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
              <Authenticate handleModelCheck={handleModelCheck} />
            </div>
          }
        />
        <Route
          path={"/work_order/complete"}
          element={<div>complete work</div>}
        />
        <Route
          path={"/work_order/new"}
          element={
            <div>
              <WorkForm user={user} addWorkOrder={addWorkOrder} />
            </div>
          }
        />
        <Route path={"/"} element={<div>hello</div>} />
      </Routes>
    </>
  );
}

export default App;
