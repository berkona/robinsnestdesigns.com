import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(1, 0),
  },
  group: {
    margin: theme.spacing(0, 0),
  },
}));

export default ({ shippingAddress, value, setValue }) => {
  const classes = useStyles()
  const isDomestic = shippingAddress.country == 'US'
  if (!value) {
    setValue(isDomestic ? '6.99' : '10.99')
  }
  // TODO: re-implement free shipping
  const options = isDomestic ? <>
    <FormControlLabel value="6.99" control={<Radio />} label="Ground Advantage (Includes Insurance): $6.99" />
    <FormControlLabel value="10.99" control={<Radio />} label="Priority (Includes Insurance): $10.99" />
    <FormControlLabel
      value="0.00"
      disabled
      control={<Radio />}
      label="Free Shipping Over $75"
    />
  

  return <>
    <FormControl component="fieldset" className={classes.formControl}>
      <RadioGroup
        aria-label="shipping-method"
        name="shippingMethod"
        className={classes.group}
        value={value}
        onChange={(evt) => setValue(evt.target.value)}
      >
        {options}
      </RadioGroup>
    </FormControl>
  </>
}
