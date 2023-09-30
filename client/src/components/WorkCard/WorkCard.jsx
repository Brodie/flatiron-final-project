import React, { useEffect, useState } from "react";

function WorkCard({ workObj, setWork }) {
  console.log(workObj);

  const [open, setOpen] = useState(false);

  return (
    <div className="card-container">
      <h2>Submitted By: {workObj.requested_by.name}</h2>
      <p>{workObj.info}</p>
      {workObj.completed ? (
        <h3>
          Completed at {workObj.completed_at} by {workObj.assigned_to.name}
        </h3>
      ) : null}
      <div className="image-container">
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
      <button onClick={() => setOpen((prev) => !prev)}>Show Comments</button>
      {open && (
        <div>
          {workObj.comments[0] ? (
            workObj.comments.map((com) => {
              return <p key={com.id}>{com.comment_text}</p>;
            })
          ) : (
            <p>No Comments</p>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkCard;
