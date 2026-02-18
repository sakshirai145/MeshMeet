import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>MeshMeet Video Call</h2>
        </div>

        <div className="navlist">
          <p
            onClick={() => {
              router("/aljk23");
            }}
          >
            Join as Guest
          </p>

          <p
            onClick={() => {
              router("/auth");
            }}
          >
            Register
          </p>

          <div
            onClick={() => {
              router("/auth");
            }}
            role="button"
          >
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>
              Meet
            </span>{" "}
            Without Limits
          </h1>

          <p>Anywhere. Anytime. With anyone.</p>

          <div role="button">
            <Link to="/auth">Start Meeting</Link>
          </div>
        </div>

        <div>
          <img src="/mobile.png" alt="Mobile Preview" />
        </div>
      </div>
    </div>
  );
}
