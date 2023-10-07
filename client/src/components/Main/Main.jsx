import React from "react";
import "../Main/Main.css";
import { Link, useNavigate } from "react-router-dom";

function Main({ user, emp }) {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      <h1 className="what-do-title"> What we do!</h1>
      <p className="what-do">
        After successfully designing and maintaining numerous backyard ponds for
        both personal enjoyment and friends, I decided to establish my own
        business! My mission is to assist individuals in creating backyard ponds
        and gardens that radiate beauty and tranquility. With a wealth of
        experience and a passion for enhancing outdoor spaces, I am dedicated to
        bringing the serenity of nature into your very own backyard.{" "}
      </p>
      <h3 className="services-title">Services</h3>
      <p className="services">
        We provide a diverse range of services, spanning from essential pond
        maintenance and expert guidance to ambitious projects aimed at crafting
        stunning ponds right in your own backyard. Simply create an account,
        submit a work order, and our team will review it. You can expect a
        prompt email from us, presenting a comprehensive proposal tailored to
        your unique vision and needs.
      </p>
      <div className="link">
        {user ? (
          <Link to="/work_order/new">Submit New Order!</Link>
        ) : emp ? (
          <Link to="/home">Homepage</Link>
        ) : (
          <Link to="/authenticate" state={{ isEmployee: false }}>
            Login / Signup!
          </Link>
        )}
      </div>
    </div>
  );
}

export default Main;
