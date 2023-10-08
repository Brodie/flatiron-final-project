import React, { useState } from "react";
import CommentForm from "../CommentForm/CommentForm";
import "./WorkCard.css";

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
            const work_id = data.work_id;
            const updatedWork = work.map((obj) => {
              if (obj.id === work_id) {
                return {
                  ...obj,
                  completed: true,
                };
              }
              return obj;
            });
            setWork(updatedWork);
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
          window.location.reload();
        });
      } else {
        r.json().then((data) => {
          alert(data.errors);
        });
      }
    });
  };

  const completeTime = workObj.completed
    ? workObj.completed_at.slice(0, 10)
    : null;

  return (
    <div className="card-container">
      <h2>Submitted By: {workObj.requested_by.name}</h2>

      {/* completed ? completed : assigned to  */}
      {workObj.completed ? (
        <h3 className="complete-assign">
          Completed on {completeTime} by {workObj.assigned_to.name}
        </h3>
      ) : (
        <p>
          <span style={{ fontWeight: "bold" }}>Assigned to:</span>{" "}
          {workObj.assigned_to.name}
        </p>
      )}
      <p className="work-info">{workObj.info}</p>
      <div className="image-container">
        {workObj.images.map((img) => {
          return (
            <img
              className="card-image"
              key={img.id}
              src={`/images/${img.id}`}
            />
          );
        })}
      </div>

      {emp && emp.id === workObj.assigned_to.id && !workObj.completed ? (
        <button className="complete-button" onClick={handleComplete}>
          {confirm ? (
            <span style={{ fontWeight: "bolder" }}>CONFIRM</span>
          ) : (
            "Mark Complete"
          )}
        </button>
      ) : null}

      {confirm ? (
        <>
          <br />
          <button onClick={() => setConfirm(false)}>Cancel</button>
        </>
      ) : null}
      <button
        style={{ marginLeft: "4px" }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "Hide " : "Show "}Comments
      </button>

      {open && (
        <div className="comment-container">
          {workObj.comments[0] ? (
            workObj.comments.map((com) => {
              return (
                <div style={{ display: "flex" }} key={com.id}>
                  <p key={com.id} className="comment-content">
                    <span className="comment-poster">
                      {com.user ? com.user.name : com.employee.name}:{" "}
                    </span>
                    {com.comment_text}
                  </p>

                  {(emp && emp.admin) || (user && user.id === com.user_id) ? (
                    <button
                      className="delete-button"
                      onClick={() => deleteComment(com.id)}
                    >
                      Delete Comment
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p>No Comments</p>
          )}

          {(emp?.id === workObj.assigned_to?.id ||
            user?.id === workObj.requested_by?.id) && (
            <>
              <button onClick={() => setShowForm((prev) => !prev)}>
                {showForm ? "Close" : "Add Comment"}
              </button>
              {showForm && (
                <CommentForm
                  setShowForm={setShowForm}
                  setWork={setWork}
                  work={work}
                  workObj={workObj}
                  poster={emp ? emp : user}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkCard;
