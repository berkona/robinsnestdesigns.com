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
    setValue(isDomestic ? '4.99' : '7.99')
  }
  // TODO: re-implement free shipping
  const options = isDomestic ? <>
    <FormControlLabel value="4.99" control={<Radio />} label="First Class (No Insurance): $4.99" />
    <FormControlLabel value="7.99" control={<Radio />} label="Priority (With Insurance): $7.99" />
    <FormControlLabel
      value="0.00"
      disabled
      control={<Radio />}
      label="Free Shipping Over $75"
    />
  </> : <>
    <FormControlLabel value="16.99" control={<Radio />} label="First Class International (No Insurance): $16.99" />
    <FormControlLabel value="36.99" control={<Radio />} label="Priority International (With Insurance): $36.99" />
  </>

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
