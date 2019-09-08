import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import CheckoutNavButtons from "./CheckoutNavButtons";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import PaymentForm from "./PaymentForm";
import countries from "../../constants/countries";
import { ProductLink } from "../Links";

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(1, 0)
  },
  total: {
    fontWeight: "700"
  },
  title: {
    marginTop: theme.spacing(2)
  }
}));

export default ({
  orderId,
  handleBack,
  handleNext,
  cartData,
  shippingAddress,
  shippingType,
  promo,
  setPromo
}) => {
  const classes = useStyles();

  const { subtotal, shipping, discount, tax, total } = cartData;

  const [newPromo, setNewPromo] = React.useState(promo || "");

  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Review Order
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        You're almost done!
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        Review your information before you place your order.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Order No
          </Typography>
          <Typography gutterBottom>{orderId}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Ship To: {shippingAddress.firstName} {shippingAddress.lastName}
          </Typography>
          <Typography gutterBottom>{shippingAddress.address1}</Typography>
          {shippingAddress.address2 && (
            <Typography gutterBottom>{shippingAddress.address2}</Typography>
          )}
          <Typography gutterBottom>
            {[
              shippingAddress.city,
              shippingAddress.state,
              shippingAddress.zip
            ].join(", ")}
          </Typography>
          <Typography gutterBottom>
            {countries.filter(c => c.value == shippingAddress.country)[0].name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="h6" gutterBottom>
                    Item ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" gutterBottom>
                    Item Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" gutterBottom>
                    Option
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" gutterBottom>
                    Quantity
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" gutterBottom>
                    Price
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" gutterBottom>
                    Subtotal
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartData.items.map(({ id, qty, price, variant, product }) => (
                <TableRow key={id}>
                  <TableCell>
                    <ProductLink
                      productId={product.id}
                      listName="Review Order"
                      sku={product.sku}
                      category={product.category}
                      subcategory={product.subcategory}
                      title={product.name}
                    >
                      <img
                        style={{ maxHeight: "120px" }}
                        src={product.hyperlinkedImage}
                      />
                    </ProductLink>
                  </TableCell>
                  <TableCell><ProductLink
                    productId={product.id}
                    listName="Review Order"
                    sku={product.sku}
                    category={product.category}
                    subcategory={product.subcategory}
                    title={product.name}
                  >{product.sku}</ProductLink></TableCell>
                  <TableCell><ProductLink
                    productId={product.id}
                    listName="Review Order"
                    sku={product.sku}
                    category={product.category}
                    subcategory={product.subcategory}
                    title={product.name}
                  >{product.name}</ProductLink></TableCell>
                  <TableCell>
                    {variant
                      ? product.productVariants.filter(v => v.id == variant)[0]
                          .text
                      : ""}
                  </TableCell>
                  <TableCell align="center">{qty}</TableCell>
                  <TableCell align="right">${price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    ${(qty * price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell rowSpan={6} colSpan="5" />
                <TableCell align="right">Subtotal:</TableCell>
                <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">Shipping:</TableCell>
                <TableCell align="right">${shipping.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">Discount:</TableCell>
                <TableCell align="right">${discount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">Tax:</TableCell>
                <TableCell align="right">${tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="right">Total:</TableCell>
                <TableCell align="right">${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Apply Promo
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <TextField
            required
            id="promo"
            name="promo"
            label="Promo"
            fullWidth
            value={newPromo}
            onChange={evt => setNewPromo(evt.target.value)}
            error={!!(promo && discount < 0.01)}
            helperText={
              promo &&
              discount < 0.01 &&
              "This promotion is not active or cannot be applied to this order"
            }
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setPromo(newPromo)}
          >
            Apply
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} style={{ marginTop: "16px" }}>
        <PaymentForm
          handleBack={handleBack}
          {...{
            orderId,
            cartData,
            shippingAddress,
            shippingType,
            promo
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <CheckoutNavButtons handleBack={handleBack} />
      </Grid>
    </React.Fragment>
  );
};
