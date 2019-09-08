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

class CallMutation extends React.Component {
  componentDidMount() {
    console.log("RefreshToken.componentDidMount", this.props);
    if (typeof this.props.mutation === "function") this.props.mutation();
  }
  render() {
    return null;
  }
}

export default ({ isBrowser }) =>
  isBrowser ? (
    <CurrentUser>
      {user =>
        user.isLoggedIn() ? (
          <Mutation
            mutation={RefreshTokenQuery}
            variables={{ token: user.getToken() }}
            onCompleted={data => {
              console.log("RefreshToken.onCompleted", data.refreshToken.token);
              user.login(data.refreshToken.token);
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
