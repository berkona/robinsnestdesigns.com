import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import CheckoutNavButtons from "./CheckoutNavButtons";
import ShippingOptions from "./ShippingOptions";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import COUNTIES from "../../constants/nc-counties";
import STATES from "../../constants/states";
import COUNTRIES from "../../constants/countries";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import BlockQuery from "../BlockQuery";
import { CurrentUser } from "../../lib/auth";
import gql from "graphql-tag";

const USER_QUERY = gql`
  query($token: String!) {
    user(token: $token) {
      firstName
      lastName
      address
      city
      state
      zip
      country
    }
  }
`;

const USER_UPDATE = gql`
  mutation($token: String!, $user: UserPatchInput!) {
    user(token: $token, user: $user) {
      firstName
      lastName
      address
      city
      state
      zip
      country
    }
  }
`;

const AddressFormUserWrapper = props => (
  <CurrentUser>
    {currentUser =>
      currentUser.isLoggedIn() ? (
        <BlockQuery
          query={USER_QUERY}
          variables={{ token: currentUser.getToken() }}
        >
          {({ data: { user } }) => {
            const { shippingAddress, setShippingAddress } = props;

            const newShippingAddress = { ...shippingAddress }
            newShippingAddress.firstName = shippingAddress.firstName || user.firstName || '';
            newShippingAddress.lastName = shippingAddress.lastName || user.lastName || '';
            newShippingAddress.address1 = shippingAddress.address1 || user.address || '';
            newShippingAddress.city = shippingAddress.city || user.city || '';
            newShippingAddress.state = shippingAddress.state || user.state || '';
            newShippingAddress.zip = shippingAddress.zip || user.zip || '';
            newShippingAddress.country = shippingAddress.country || user.country || '';

            const fields = ['firstName', 'lastName', 'address1', 'city', 'state','zip']

            if (fields.some(fieldName => shippingAddress[fieldName] != newShippingAddress[fieldName]))
              setShippingAddress(newShippingAddress)

            return <AddressForm
              {...{
                ...props,
                shippingAddress: newShippingAddress,
              }}
            />
          }}
        </BlockQuery>
      ) : (
        <AddressForm {...props} />
      )
    }
  </CurrentUser>
);

const AddressForm = ({
  handleBack,
  handleNext,
  shippingAddress,
  setShippingAddress,
  shippingType,
  setShippingType
}) => {
  const handleFieldChange = fieldName => evt => {
    const newShippingAddress = Object.assign({}, shippingAddress);
    newShippingAddress[fieldName] = evt.target.value;
    setShippingAddress(newShippingAddress);
  };

  const isZipValid =
    shippingAddress.country != "US" || /^\d{5}$/.test(shippingAddress.zip);

  const isShippingAmountValid =
    shippingAddress.country === "US"
      ? ["6.99", "10.99", "0.00"].indexOf(shippingType) !== -1
      : ["16.99", "36.99"].indexOf(shippingType) !== -1;

  const isAddressValid = !!(
    shippingAddress.firstName &&
    shippingAddress.lastName &&
    shippingAddress.address1 &&
    shippingAddress.city &&
    shippingAddress.state &&
    shippingAddress.zip &&
    shippingAddress.country &&
    (!(shippingAddress.country == "US" && shippingAddress.state == "NC") ||
      shippingAddress.county) &&
    isZipValid &&
    isShippingAmountValid
  );

  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Shipping Address
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        Required fields are marked in *
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="firstName"
            name="firstName"
            label="First name"
            fullWidth
            autoComplete="fname"
            value={shippingAddress.firstName}
            onChange={handleFieldChange("firstName")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="lastName"
            name="lastName"
            label="Last name"
            fullWidth
            autoComplete="lname"
            value={shippingAddress.lastName}
            onChange={handleFieldChange("lastName")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="address1"
            name="address1"
            label="Address line 1"
            fullWidth
            autoComplete="billing address-line1"
            value={shippingAddress.address1}
            onChange={handleFieldChange("address1")}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="address2"
            name="address2"
            label="Address line 2"
            fullWidth
            autoComplete="billing address-line2"
            value={shippingAddress.address2}
            onChange={handleFieldChange("address2")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label="City"
            fullWidth
            autoComplete="billing address-level2"
            value={shippingAddress.city}
            onChange={handleFieldChange("city")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {shippingAddress.country == "US" ? (
            <FormControl required fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={shippingAddress.state}
                onChange={handleFieldChange("state")}
              >
                {STATES.map(({ name, abbreviation }) => (
                  <MenuItem key={abbreviation} value={abbreviation}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              id="state"
              name="state"
              label="State/Province/Region"
              fullWidth
              value={shippingAddress.state}
              onChange={handleFieldChange("state")}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="zip"
            name="zip"
            label="Zip / Postal code"
            fullWidth
            autoComplete="billing postal-code"
            error={shippingAddress.zip.length > 0 && !isZipValid}
            value={shippingAddress.zip}
            onChange={handleFieldChange("zip")}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl required fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={shippingAddress.country}
              onChange={handleFieldChange("country")}
            >
              {COUNTRIES.map(({ name, value }) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {shippingAddress.country == "US" &&
          shippingAddress.state == "NC" && (
            <Grid item xs={12} sm={6}>
              <FormControl required fullWidth>
                <InputLabel>County</InputLabel>
                <Select
                  value={shippingAddress.county}
                  onChange={handleFieldChange("county")}
                >
                  {COUNTIES.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
      </Grid>
      {shippingType && setShippingType && <>
        <Typography variant="h4" gutterBottom style={{ marginTop: "24px" }}>
          Shipping Method
        </Typography>
        <Typography variant="subtitle2">Choose your shipping method</Typography>
        <Grid item xs={12}>
          <ShippingOptions
            shippingAddress={shippingAddress}
            value={shippingType}
            setValue={setShippingType}
          />
        </Grid>
      </>}
      {(handleBack || handleNext) && (
        <Grid item xs={12}>
          <CheckoutNavButtons
            handleBack={handleBack}
            handleNext={handleNext}
            canAdvance={isAddressValid && !!shippingType}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};

export default AddressFormUserWrapper;
