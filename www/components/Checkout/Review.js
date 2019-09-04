import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import CheckoutNavButtons from './CheckoutNavButtons'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const products = [
  { name: 'Product 1', desc: 'A nice thing', price: '$9.99' },
  { name: 'Product 2', desc: 'Another thing', price: '$3.45' },
  { name: 'Product 3', desc: 'Something else', price: '$6.51' },
  { name: 'Product 4', desc: 'Best thing of all', price: '$14.11' },
  { name: 'Shipping', desc: '', price: 'Free' },
];
const addresses = ['1 Material-UI Drive', 'Reactville', 'Anytown', '99999', 'USA'];
const payments = [
  { name: 'Payment type', detail: 'Paypal' },
  // { name: 'Card holder', detail: 'Mr John Smith' },
  // { name: 'Card number', detail: 'xxxx-xxxx-xxxx-1234' },
  // { name: 'Expiry date', detail: '04/2024' },
];

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: '700',
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));

export default ({ orderId, handleBack, handleNext, cartData, shippingAddress, shippingType, promo, setPromo }) => {
  const classes = useStyles();
  const products = (cartData && cartData.items && cartData.items.map(cartItem => { return {
    name: cartItem.product.name,
    desc: cartItem.variant ? cartItem.product.productVariants.filter(v => v.id == cartItem.variant)[0] : '',
    price: '$' + cartItem.price,
  }}) || []).concat([
    { name: 'Subtotal', desc: '', price: '$' + cartData.subtotal.toFixed(2) },
    { name: 'Shipping', desc: '', price: '$' + cartData.shipping.toFixed(2) },
    { name: 'Discount', desc: '', price: '$' + cartData.discount.toFixed(2) },
    { name: 'Tax', desc: '', price: '$' + cartData.tax.toFixed(2) },
  ])

  const {
    subtotal, shipping, discount, tax, total,
  } = cartData

  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Review Order
      </Typography>
      <Typography variant="subtitle2" gutterBottom>You're almost done!</Typography>
      <Typography variant="subtitle2" gutterBottom>Review your information before you place your order.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Order No
          </Typography>
          <Typography gutterBottom>
            {orderId}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Ship To
          </Typography>
          <Typography gutterBottom>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
          <Typography gutterBottom>{[shippingAddress.address1, shippingAddress.address2, shippingAddress.city, shippingAddress.state, shippingAddress.zip, shippingAddress.country ].join(', ')}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell><Typography variant="h6" gutterBottom>Item ID</Typography></TableCell>
                <TableCell><Typography variant="h6" gutterBottom>Item Name</Typography></TableCell>
                <TableCell><Typography variant="h6" gutterBottom>Option</Typography></TableCell>
                <TableCell align="center"><Typography variant="h6" gutterBottom>Quantity</Typography></TableCell>
                <TableCell align="right"><Typography variant="h6" gutterBottom>Price</Typography></TableCell>
                <TableCell align="right"><Typography variant="h6" gutterBottom>Subtotal</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartData.items.map(({ id, qty, price, variant, product }) => (
                <TableRow key={id}>
                  <TableCell><img style={{maxHeight: '120px' }} src={product.hyperlinkedImage} /></TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{variant ? product.productVariants.filter(v => v.id == variant)[0].text : ''}</TableCell>
                  <TableCell align="center">{ qty }</TableCell>
                  <TableCell align="right">${ price.toFixed(2) }</TableCell>
                  <TableCell align="right">${ (qty * price).toFixed(2) }</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colspan="6" align="right">Subtotal:</TableCell>
                <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colspan="6" align="right">Shipping:</TableCell>
                <TableCell align="right">${shipping.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colspan="6" align="right">Discount:</TableCell>
                <TableCell align="right">${discount.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colspan="6" align="right">Tax:</TableCell>
                <TableCell align="right">${tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colspan="6" align="right">Total:</TableCell>
                <TableCell align="right">${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={12}>
          <CheckoutNavButtons handleBack={handleBack} handleNext={handleNext} canAdvance={true} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
