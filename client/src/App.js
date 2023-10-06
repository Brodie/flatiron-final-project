import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Authenticate from "./components/Authenticate/Authenticate";
import Home from "./components/Home/Home";
import WorkForm from "./components/WorkForm/WorkForm";
import WorkCard from "./components/WorkCard/WorkCard";

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

  const empWork = emp
    ? work.filter((workObj) => {
        return workObj.assigned_to.id === emp.id;
      })
    : [];

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
    <div className="app">
      <>
        {emp && emp.admin ? (
          <h1 style={{ color: "red" }}>LOGGED IN AS ADMIN</h1>
        ) : null}
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
                <Home user={user} work={work} setWork={setWork} emp={emp} />
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
            element={
              <div className="card-container">
                {/* if employee render only employee jobs */}
                <h1>{emp ? "My " : "Our "}Completed Jobs</h1>
                {emp
                  ? empWork.map((workObj) => {
                      if (workObj.completed === true) {
                        return (
                          <WorkCard
                            key={workObj.id}
                            setWork={setWork}
                            work={work}
                            workObj={workObj}
                            emp={emp}
                            user={user}
                          />
                        );
                      }
                    })
                  : work.map((workObj) => {
                      if (workObj.completed === true) {
                        return (
                          <WorkCard
                            key={workObj.id}
                            setWork={setWork}
                            work={work}
                            workObj={workObj}
                            emp={emp}
                            user={user}
                          />
                        );
                      }
                    })}
              </div>
            }
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

          {/* only render if admin */}
          {emp && emp.admin ? (
            <Route
              path={"work_order/all"}
              element={work.map((workObj) => {
                return (
                  <WorkCard
                    key={workObj.id}
                    setWork={setWork}
                    work={work}
                    workObj={workObj}
                    emp={emp}
                  />
                );
              })}
            />
          ) : null}
        </Routes>
      </>
    </div>
  );
}

export default App;
