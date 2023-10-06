import React from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavStyle.css";

function Navigation({ user, updateUser, emp, updateEmp }) {
  const [menu, setMenu] = useState(false);
  const toggleMenu = () => setMenu((prev) => !prev);
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("/logout", {
      method: "DELETE",
    }).then((r) => {
      if (r.ok) {
        updateUser(null);
        updateEmp(null);
        navigate("/");
      }
    });
  };

  return (
    <div className="nav">
      <h1 className="nav-title">Pond Company</h1>
      <section className={`nav-menu  ${menu ? "open" : ""}`}>
        {menu ? (
          <ul className="open-menu">
            <li className="close" onClick={() => setMenu(!menu)}>
              <div>X</div>
            </li>
            <li>
              <Link to="/">Main Menu</Link>
            </li>
            <li>
              <Link to="/work_order/complete">
                {emp ? "My Complete Work" : "Our Completed Work"}
              </Link>
            </li>
            {/* admin link */}
            {emp && emp.admin ? (
              <li>
                <Link to="/work_order/all">All Work</Link>
              </li>
            ) : null}

            {user || emp ? (
              <>
                <li>
                  <Link to="/home">{emp ? "My Jobs" : "Home"}</Link>
                </li>
                {emp ? null : (
                  <li>
                    <Link to="/work_order/new">Submit Work Order</Link>
                  </li>
                )}
                <li>
                  <Link onClick={handleLogout}>Logout</Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/authenticate" state={{ isEmployee: false }}>
                  Login/Signup
                </Link>
              </li>
            )}
            {user || emp ? null : (
              <li>
                <Link to="/authenticate" state={{ isEmployee: true }}>
                  Employee Portal
                </Link>
              </li>
            )}
          </ul>
        ) : (
          <div onClick={toggleMenu} className="hamburger-menu">
            <RxHamburgerMenu style={{ color: "black" }} size={50} />
          </div>
        )}
      </section>
    </div>
  );
}

export default Navigation;
