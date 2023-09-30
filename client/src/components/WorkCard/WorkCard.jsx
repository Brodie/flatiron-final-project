import React, { useEffect, useState } from "react";

function WorkCard({ workObj, setWork }) {
  console.log(workObj);

  return (
    <div className="card-container">
      <h2>Submitted By: {workObj.requested_by.name}</h2>
      <p>{workObj.info}</p>
      {workObj.completed ? (
        <h3>
          Completed at {workObj.completed_at} by {workObj.assigned_to.name}
        </h3>
      ) : null}
      {workObj.images.map((img) => {
        return (
          <img
            key={img.id}
            src={`/static/uploads/${img.id}`}
            style={{ height: "100px" }}
          />
        );
      })}
    </div>
  );
}

export default WorkCard;
