import React from "react";

function CommentModal({ showModal, setShowModal }) {
  if (!showModal) return null;
  return (
    <div className="overlay">
      <div className="modalContainer">
        <h3>Enter Comment:</h3>
        <textarea></textarea>
        <p className="closeBtn" onClick={() => setShowModal(false)}>
          x
        </p>
      </div>
    </div>
  );
}

export default CommentModal;
