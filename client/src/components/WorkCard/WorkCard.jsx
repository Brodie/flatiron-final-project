import React, { useState } from "react";
import CommentForm from "../CommentForm/CommentForm";
import { json } from "react-router-dom";

function WorkCard({ workObj, setWork, work, user, emp }) {
  const [showForm, setShowForm] = useState(false);

  const [open, setOpen] = useState(false);

  //  confirm state to double click button before marking complete
  const [confirm, setConfirm] = useState(false);

  const handleComplete = () => {
    if (confirm) {
      setConfirm(false);
      fetch(`work_order/${workObj.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({ completed: "true" }),
      }).then((r) => {
        if (r.ok) {
          r.json().then((data) => {
            console.log(data);
          });
        }
      });
    } else {
      setConfirm(true);
    }
  };

  const deleteComment = (commID) => {
    fetch(`/comment/${commID}`, {
      method: "DELETE",
    }).then((r) => {
      if (r.ok) {
        r.json().then((data) => {
          alert(data.message);
        });
      } else {
        r.json().then((data) => {
          alert(data.errors);
        });
      }
    });
  };

  return (
    <div className="card-container">
      <h2>Submitted By: {workObj.requested_by.name}</h2>

      {/* completed ? completed : assigned to  */}
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

      {emp && emp.id === workObj.assigned_to.id && !workObj.completed ? (
        <button style={{ color: "red" }} onClick={handleComplete}>
          {confirm ? (
            <span style={{ fontWeight: "bolder" }}>CONFIRM</span>
          ) : (
            "Mark Complete"
          )}
        </button>
      ) : null}

      <button
        style={{ marginLeft: "4px" }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Hide " : "Show "}Comments
      </button>
      {confirm ? (
        <>
          <br />
          <button onClick={() => setConfirm(false)}>Cancel</button>
        </>
      ) : null}
      {open && (
        <div className="comment-container">
          {workObj.comments[0] ? (
            workObj.comments.map((com) => {
              return (
                <>
                  <p key={com.id}>{com.comment_text}</p>
                  {emp && emp.admin ? (
                    <button onClick={() => deleteComment(com.id)}>
                      Delete Comment
                    </button>
                  ) : null}
                </>
              );
            })
          ) : (
            <p>No Comments</p>
          )}
          {(emp || user) && user?.id === workObj.requested_by?.id ? (
            <>
              <button onClick={() => setShowForm((prev) => !prev)}>
                {showForm ? "Close" : "Add Comment"}
              </button>
              {showForm && (
                <CommentForm
                  setWork={setWork}
                  work={work}
                  workObj={workObj}
                  poster={emp ? emp : user}
                />
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default WorkCard;
