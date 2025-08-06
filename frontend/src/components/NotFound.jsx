import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1 text-primary fw-bold">404</h1>
      <p className="lead text-muted">
        Oops! That page doesn't exist or might have moved.
      </p>
      <Link to="/" className="btn btn-outline-primary mt-3">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
