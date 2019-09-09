import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Form from "react-bootstrap/Form";
import gql from "graphql-tag";
import Loader from "../Loader";
import ApolloError from "../ApolloError";
import { PayPalButton } from "react-paypal-button-v2";
import { checkoutOpenPaypalEvent, checkoutDoneEvent } from "../../lib/react-ga";
import Router from "next/router";
import InlineQuery from "../InlineQuery";
import { Mutation } from "react-apollo";
import Link from "next/link";
import { CurrentUser } from "../../lib/auth";

const placeCartOrder = gql`
  mutation(
    $orderId: ID!
    $paypalOrderId: ID!
    $shipping: Float!
    $promo: String
    $county: String
  ) {
    placeOrder(
      orderId: $orderId
      paypalOrderId: $paypalOrderId
      shipping: $shipping
      promo: $promo
      county: $county
    ) {
      id
    }
  }
`;

const GET_PAYPAL_CLIENT_ID = gql`
  query {
    siteinfo {
      paypalClientId
    }
  }
`;

const makeAmount = value => {
  return {
    currency_code: "USD",
    value
  };
};

export default function PaymentForm({
  cartData,
  orderId,
  shippingAddress,
  shippingType,
  promo,
  handleBack
}) {
  const [paypalError, setPaypalError] = React.useState(null);

  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Payment
      </Typography>
      <Mutation
        mutation={placeCartOrder}
        variables={{
          orderId: orderId,
          shipping: Number.parseFloat(shippingType) || 0.0,
          promo: promo || null,
          county: shippingAddress.county || null
        }}
      >
        {(mutationFn, { loading, error, data }) =>
          loading ? (
            <>
            <Typography variant="subtitle1" gutterBottom>
              Please wait while we place your order
            </Typography>
            <Loader />
            </>
          ) : error || paypalError ? (
            <>
              <Typography variant="subtitle1" color="error">
                We experienced an error while processing your request{" "}
              </Typography>
              <Typography color="error">
                Please try to place the order again in a few minutes or clear
                browser cache & cookies and try again (Note: this will clear
                your cart).
              </Typography>
              <Typography color="error">
                If problem persists, please contact support.
              </Typography>
            </>
          ) : data ? (
            <p>Order placed</p>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Click a payment method to place your order
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <CurrentUser>
                    {currentUser => (
                      <InlineQuery query={GET_PAYPAL_CLIENT_ID}>
                        {({ siteinfo: { paypalClientId } }) => (
                          <PayPalButton
                            options={{ clientId: paypalClientId }}
                            amount={cartData.total}
                            createOrder={(data, actions) => {
                              checkoutOpenPaypalEvent(cartData.items);
                              return actions.order.create({
                                purchase_units: [
                                  {
                                    amount: {
                                      currency: "USD",
                                      value: cartData.total,
                                      breakdown: {
                                        item_total: makeAmount(
                                          cartData.subtotal
                                        ),
                                        shipping: makeAmount(cartData.shipping),
                                        tax_total: makeAmount(cartData.tax),
                                        discount: makeAmount(cartData.discount)
                                      }
                                    },
                                    description:
                                      "Your order with Robin's Nest Designs",
                                    invoice_id: orderId,
                                    soft_descriptor: "RobinsNestDesigns",
                                    items: cartData.items.map(
                                      ({ product, qty, price }) => {
                                        return {
                                          sku: product.sku,
                                          name: product.name,
                                          unit_amount: makeAmount(price),
                                          quantity: qty,
                                          description:
                                            (product.description &&
                                              product.description.slice(
                                                0,
                                                127
                                              )) ||
                                            "",
                                          category: "PHYSICAL_GOODS"
                                        };
                                      }
                                    ),
                                    shipping: {
                                      name: {
                                        full_name:
                                          shippingAddress.firstName +
                                          " " +
                                          shippingAddress.lastName
                                      },
                                      address: {
                                        address_line_1:
                                          shippingAddress.address1,
                                        address_line_2:
                                          shippingAddress.address2,
                                        admin_area_2: shippingAddress.city,
                                        admin_area_1: shippingAddress.state,
                                        postal_code: shippingAddress.zip,
                                        country_code: shippingAddress.country
                                      }
                                    }
                                  }
                                ]
                              });
                            }}
                            onSuccess={(details, data) => {
                              console.log(
                                "Paypal payment received",
                                details,
                                data
                              );
                              const paypalOrderId = data && data.orderID;
                              if (!paypalOrderId) {
                                console.log("invalid paypal order id");
                                return Promise.reject(
                                  new Error("invalid order id returned")
                                );
                              } else {
                                // TODO: add coupon
                                checkoutDoneEvent(
                                  cartData.items,
                                  paypalOrderId,
                                  details.purchase_units[0].amount.value,
                                  details.purchase_units[0].amount.breakdown
                                    .tax_total.value,
                                  details.purchase_units[0].amount.breakdown
                                    .shipping.value
                                );
                                return mutationFn({
                                  variables: { paypalOrderId }
                                }).then(
                                  () => {
                                    Router.push("/order/" + orderId);
                                    setTimeout(
                                      () => currentUser.deleteCartId(),
                                      100
                                    );
                                  },
                                  err => {
                                    console.error(
                                      "backend place order error",
                                      err
                                    );
                                    setPaypalError(err);
                                  }
                                );
                              }
                            }}
                            catchError={err => {
                              console.error("paypal txn error", err);
                              setPaypalError(err);
                            }}
                          />
                        )}
                      </InlineQuery>
                    )}
                  </CurrentUser>
                </Grid>
              </Grid>
              <Typography variant="subtitle2" gutterBottom>
                By placing an order you agree to the{" "}
                <Link href="/ShippingInfo/shipping">
                  <a target="_blank">shipping terms/order processing</a>
                </Link>{" "}
                and
                <Link href="/Policies/Policies">
                  <a style={{ paddingLeft: "5px" }} target="_blank">
                    policies
                  </a>
                </Link>
              </Typography>
            </>
          )
        }
      </Mutation>
    </React.Fragment>
  );
}
