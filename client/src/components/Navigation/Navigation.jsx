import React from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavStyle.css";

function Navigation({ user, updateUser }) {
  const [menu, setMenu] = useState(false);
  const toggleMenu = () => setMenu((prev) => !prev);

  const handleLogout = () => {
    fetch("/logout", {
      method: "DELETE",
    }).then((r) => {
      if (r.ok) {
        updateUser(null);
      }
    });
  };

  return (
    <div className="nav">
      <h1 className="nav-title">Pond Company</h1>
      <section className="nav-menu">
        {menu ? (
          <ul>
            <li className="close" onClick={() => setMenu(!menu)}>
              x
            </li>
            <li>
              <Link to="/">Main Menu</Link>
            </li>
            {/* dynamically render based on session */}
            {user ? (
              <>
                <li>
                  <Link to="/home">Home</Link>
                </li>
                <li>
                  <Link to="/work_order/new">Submit Work Order</Link>
                </li>
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
            <li>
              <Link to="/work_order/complete">Completed Work</Link>
            </li>
            <li>
              <Link to="/authenticate" state={{ isEmployee: true }}>
                Employee Portal
              </Link>
            </li>
          </ul>
        ) : (
          <div className="hamburger-menu" onClick={toggleMenu}>
            <RxHamburgerMenu size={50} />
          </div>
        )}
      </section>
    </div>
  );
}

export default Navigation;
