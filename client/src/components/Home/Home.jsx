import React from "react";
import WorkCard from "../WorkCard/WorkCard";
import "./Home.css";

function Home({ work, user, setWork, emp }) {
  const userWorkOrders = user
    ? work.filter((workObj) => {
        return workObj.requested_by.id === user.id;
      })
    : [];

  const empWorkOrders = emp
    ? work.filter((workObj) => {
        return workObj.assigned_to.id === emp.id;
      })
    : [];

  const ordersToMap = user ? userWorkOrders : empWorkOrders;

  return (
    <div>
      <h1 className="home-title">My Work Orders</h1>
      {ordersToMap.map((workObj) => {
        return (
          <WorkCard
            key={workObj.id}
            setWork={setWork}
            work={work}
            workObj={workObj}
            user={user}
            emp={emp}
          />
        );
      })}
    </div>
  );
}

export default Home;
