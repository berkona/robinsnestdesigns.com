import { Mutation, Query } from "react-apollo";

import AddressForm from "../components/Checkout/AddressForm";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { CurrentUserContext } from "../lib/auth";
import { FaSpinner } from "react-icons/fa";
import Form from "react-bootstrap/Form";
import Link from "next/link";
import Loader from "../components/Loader";
import React from "react";
import gql from "graphql-tag";

const USER_QUERY = gql`
  query($token: String!) {
    user(token: $token) {
      id
      email
      firstName
      lastName
      address
      city
      state
      zip
      country
      phone
    }
  }
`;

const UPDATE_USER = gql`
  mutation($token: String!, $user: UserPatchInput!) {
    updateUser(token: $token, user: $user) {
      id
      email
      firstName
      lastName
      address
      city
      state
      zip
      country
      phone
    }
  }
`;

const AccountShippingForm = ({ user, token }) => {
  const [shippingAddress, setShippingAddress] = React.useState(user);
  return (
    <Mutation
      mutation={UPDATE_USER}
      variables={{
        token
      }}
    >
      {(mutationFn, { loading, error, mutationResult }) => {
        return (
          <React.Fragment>
            <AddressForm
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
            />
            <div style={{ marginBottom: '16px' }}></div>
            <Button
              type="submit"
              onClick={e => {
                e.preventDefault();
                mutationFn({ variables: { user: {
                  firstName: shippingAddress.firstName || user.firstName,
                  lastName: shippingAddress.lastName || user.lastName,
                  address: shippingAddress.address1 || user.address,
                  city: shippingAddress.city || user.city,
                  state: shippingAddress.state || user.state,
                  zip: shippingAddress.zip || user.zip,
                  country: shippingAddress.country || user.country,
                } } });
              }}
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner /> Working...
                </>
              ) : mutationResult ? (
                <>Changes Saved</>
              ): (
                <>Update Account</>
              )}
            </Button>
            {error && <p>{error.toString()}</p>}
          </React.Fragment>
        );
      }}
    </Mutation>
  );
};

const MyAccount = () => (
  <>
    <PageViewEvent />
    <CurrentUserContext.Consumer>
      {currentUser => {
        return (
          <Query
            query={USER_QUERY}
            variables={{ token: currentUser.getToken() }}
          >
            {({ loading, error, data }) => {
              if (loading) return <Loader />;
              if (error) return <p>Error: {error.toString()}</p>;
              return (
                <Col>
                  <div style={{ padding: "15px" }}>
                    <h2>My Account</h2>
                    <p>Modify your account details</p>
                    <hr />
                    <Form>
                      <Form.Row>
                        <Col md={6}>
                          <Form.Group controlId="firstName">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              placeholder="None"
                              value={data.user.email}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                      </Form.Row>
                    </Form>
                    <h2>Shipping Information</h2>
                    <p>
                      We use your information to enable a faster checkout
                      experience.{" "}
                      <Link href={"/Policies/Policies#privacy"}>
                        <a>Privacy Policy</a>
                      </Link>
                    </p>
                    <hr />
                    <AccountShippingForm
                      user={data.user}
                      token={currentUser.getToken()}
                    />
                  </div>
                </Col>
              );
            }}
          </Query>
        );
      }}
    </CurrentUserContext.Consumer>
  </>
);

export default MyAccount;
