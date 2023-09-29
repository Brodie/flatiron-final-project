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

  const updateUser = (user) => setUser(user);

  useEffect(() => {
    fetch("/check_session").then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          setUser(user);
        });
      }
    });
  }, []);

  return (
    <>
      <Navigation user={user} updateUser={updateUser} />
      <Routes>
        <Route
          path={"/home"}
          element={
            <div>
              <Home />
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
              <WorkContainer />
            </div>
          }
        />
        <Route
          path={"/work_order/new"}
          element={
            <div>
              <WorkForm />
            </div>
          }
        />
        <Route path={"/"} element={<div>hello</div>} />
      </Routes>
    </>
  );
}

export default App;
