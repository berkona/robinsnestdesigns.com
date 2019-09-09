import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CurrentUser } from "../lib/auth";

const RefreshTokenQuery = gql`
  mutation RefreshTokenQuery($token: String!) {
    refreshToken(token: $token) {
      token
    }
  }
`;

const CallMutation = ({ mutation }) => {
  const [called, setCalled] = React.useState(false);
  React.useEffect(() => {
    if (!called) {
      console.log("CallMutation.useEffect", mutation);
      if (typeof mutation === "function") mutation();
      setCalled(true);
    }
  });
  return null;
};

export default ({ isBrowser }) =>
  isBrowser ? (
    <CurrentUser>
      {user =>
        user.isLoggedIn() ? (
          <Mutation
            mutation={RefreshTokenQuery}
            variables={{ token: user.getToken() }}
            onCompleted={data => {
              console.log("RefreshToken.onCompleted", {
                token: data.refreshToken.token,
                "user.isLoggedIn": user.isLoggedIn()
              });
              // handle a race condition in logging out here
              if (user.isLoggedIn()) user.login(data.refreshToken.token);
            }}
            onError={() => user.logout()}
          >
            {(mutation, state) => <CallMutation mutation={mutation} />}
          </Mutation>
        ) : (
          <></>
        )
      }
    </CurrentUser>
  ) : (
    <></>
  );
