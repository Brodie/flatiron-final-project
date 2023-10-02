import React from "react";
import WorkCard from "../WorkCard/WorkCard";

function Home({ work, user, setWork }) {
  const userWorkOrders = work.filter((workObj) => {
    return workObj.requested_by.id === user.id;
  });

  console.log(userWorkOrders);
  return (
    <div>
      <h1>My Work Orders</h1>
      {userWorkOrders.map((workObj) => {
        return (
          <WorkCard
            key={workObj.id}
            setWork={setWork}
            work={work}
            workObj={workObj}
            user={user}
          />
        );
      })}
    </div>
  );
}

export default Home;
