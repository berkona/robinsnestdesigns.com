import React from "react";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import AddressForm from "./AddressForm";
import Review from "./Review";
import Loader from "../Loader";
import ApolloError from "../ApolloError";
import { ORDER_GET } from "../../constants/queries";
import { Query } from "react-apollo";
import { Product, CheckoutAction } from "../../lib/next-ga-ec";

const steps = ["Shipping", "Review"];

const QueryOrder = ({ orderId, county, shipping, promo, children }) => (
  <Query
    query={ORDER_GET}
    fetchPolicy="network-only"
    variables={{
      orderId,
      county: county || null,
      shipping: Number.parseFloat(shipping) || 0.0,
      promo: promo || null
    }}
  >
    {({ loading, error, data }) =>
      error ? (
        <ApolloError error={error} />
      ) : !data ? (
        <Loader />
      ) : children ? (
        children(data)
      ) : (
        <></>
      )
    }
  </Query>
);

const OrderWrapper = ({ cartData, children }) => (
  <>
    {cartData && cartData.items && cartData.items.map(cartItem => (
      <Product
        key={cartItem.id}
        sku={cartItem.product.sku}
        name={cartItem.product.name}
        category={
          cartItem.product.category + "/" + cartItem.product.subcategory
        }
        price={cartItem.price}
        qty={cartItem.qty}
        variant={cartItem.variant}
      />
    ))}
    <CheckoutAction step={1} />
    {children}
  </>
);

export default ({ orderId }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const [shippingAddress, setShippingAddress] = React.useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    county: null
  });

  const [shippingType, setShippingType] = React.useState("3.99");

  const [promo, setPromo] = React.useState("");

  const stepContent = (
    <QueryOrder
      orderId={orderId}
      county={shippingAddress.county}
      shipping={shippingType}
      promo={promo}
    >
      {({ cart }) => {
        const cartData = cart;
        const props = {
          orderId,
          cartData,
          shippingAddress,
          shippingType,
          promo
        };
        let content =
          activeStep === 0 ? (
            <AddressForm
              handleNext={handleNext}
              setShippingAddress={setShippingAddress}
              setShippingType={setShippingType}
              {...props}
            />
          ) : (
            <Review
              handleBack={handleBack}
              handleNext={handleNext}
              setPromo={setPromo}
              {...props}
            />
          );
        return <OrderWrapper cartData={cartData}>{content}</OrderWrapper>;
      }}
    </QueryOrder>
  );

  return (
    <React.Fragment>
      <Stepper activeStep={activeStep}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {stepContent}
    </React.Fragment>
  );
};
