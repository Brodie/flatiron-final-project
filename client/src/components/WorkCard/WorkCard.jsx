import React, { useState } from "react";
import CommentForm from "../CommentForm/CommentForm";

function WorkCard({ workObj, setWork, user, emp }) {
  const [showForm, setShowForm] = useState(false);

  const [open, setOpen] = useState(false);

  return (
    <div className="card-container">
      <h2>Submitted By: {workObj.requested_by.name}</h2>
      {workObj.completed ? (
        <h3>
          Completed at {workObj.completed_at} by {workObj.assigned_to.name}
        </h3>
      ) : (
        <p>
          <span style={{ fontWeight: "bold" }}>Assigned to:</span>{" "}
          {workObj.assigned_to.name}
        </p>
      )}
      <p>{workObj.info}</p>
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
        <div className="comment-container">
          {workObj.comments[0] ? (
            workObj.comments.map((com) => {
              return <p key={com.id}>{com.comment_text}</p>;
            })
          ) : (
            <p>No Comments</p>
          )}
          {emp || user.id === workObj.requested_by.id ? (
            <>
              <button onClick={() => setShowForm((prev) => !prev)}>
                {showForm ? "Close" : "Add Comment"}
              </button>
              <CommentForm
                showForm={showForm}
                setShowForm={setShowForm}
                workObj={workObj}
              />
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default WorkCard;
