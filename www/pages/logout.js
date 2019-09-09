import React from "react";
import Router from "next/router";
import { CurrentUser } from "../lib/auth";
import Col from "react-bootstrap/Col";
import { PageViewEvent } from "../lib/react-ga";

const Logout = ({ currentUser }) => {
  React.useEffect(() => {
    if (process.browser) {
      if (currentUser.isLoggedIn()) {
        console.log('Logging out user')
        currentUser.logout();
      }
      setTimeout(() => Router.push("/"), 100);
    }
  });
  return currentUser.isLoggedIn() ? (
    <Col>
      <p>Wait while we log you out...</p>
    </Col>
  ) : (
    <Col>
      <p>Logged out. Redirecting you...</p>
    </Col>
  );
};

const LogoutPage = () => {
  return (
    <>
      <PageViewEvent />
      <CurrentUser>
        {currentUser => <Logout currentUser={currentUser} />}
      </CurrentUser>
    </>
  );
};

export default LogoutPage;
