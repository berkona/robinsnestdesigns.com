import React from 'react'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import AddressForm from './AddressForm'
import PaymentForm from './PaymentForm'
import Review from './Review'
import Loader from '../Loader'
import ApolloError from '../ApolloError'
import { ORDER_GET } from '../../constants/queries'
import { Query } from 'react-apollo'

const steps = ['Shipping', 'Review', 'Payment']

const QueryOrder = ({ orderId, county, shipping, promo, children }) => <Query query={ORDER_GET} fetchPolicy="cache-and-network" variables={{ orderId, county: county || null, shipping: Number.parseFloat(shipping) || 0.00, promo: promo || null, }}>
  {({ loading, error, data }) => error ? <ApolloError error={error} />
    : !data ? <Loader />
    : children ? children(data)
    : <></>
  }
</Query>

export default ({ orderId }) => {
  const [ activeStep, setActiveStep ] = React.useState(0)

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const [ shippingAddress, setShippingAddress ] = React.useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    county: null,
  })

  const [ shippingType, setShippingType ] = React.useState('3.99')

  const [ promo, setPromo ] = React.useState('')

  const stepContent = <QueryOrder orderId={orderId} county={shippingAddress.county} hipping={shippingType} promo={promo}>
    {({ cart, }) => {
      const cartData = cart
      const props = {
        orderId,
        cartData,
        shippingAddress,
        shippingType,
        promo,
      }
      if (activeStep == 0) {
        return <AddressForm
          handleNext={handleNext}
          setShippingAddress={setShippingAddress}
          setShippingType={setShippingType}
          {...props} />
      }
      else if (activeStep == 1) {
        return <Review
          handleBack={handleBack}
          handleNext={handleNext}
          setPromo={setPromo}
          {...props} />
      } else if (activeStep == 2) {
        return <PaymentForm handleBack={handleBack} {...props} />
      } else {
        throw new Error('invalid step')
      }
    }}
  </QueryOrder>

  return <React.Fragment>
    <Stepper activeStep={activeStep}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
    {stepContent}
  </React.Fragment>
}

// import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
// import Paper from '@material-ui/core/Paper';
// import Stepper from '@material-ui/core/Stepper';
// import Step from '@material-ui/core/Step';
// import StepLabel from '@material-ui/core/StepLabel';
// import Button from '@material-ui/core/Button';
// import Link from '@material-ui/core/Link';
// import Typography from '@material-ui/core/Typography';
// import AddressForm from './AddressForm';
// import PaymentForm from './PaymentForm';
// import Review from './Review';
//
// function Copyright() {
//   return (
//     <Typography variant="body2" color="textSecondary" align="center">
//       {'Copyright © '}
//       <Link color="inherit" href="https://material-ui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }
//
// const useStyles = makeStyles(theme => ({
//   appBar: {
//     position: 'relative',
//   },
//   layout: {
//     width: 'auto',
//     marginLeft: theme.spacing(2),
//     marginRight: theme.spacing(2),
//     [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
//       width: 600,
//       marginLeft: 'auto',
//       marginRight: 'auto',
//     },
//   },
//   paper: {
//     marginTop: theme.spacing(3),
//     marginBottom: theme.spacing(3),
//     padding: theme.spacing(2),
//     [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
//       marginTop: theme.spacing(6),
//       marginBottom: theme.spacing(6),
//       padding: theme.spacing(3),
//     },
//   },
//   stepper: {
//     padding: theme.spacing(3, 0, 5),
//   },
//   buttons: {
//     display: 'flex',
//     justifyContent: 'flex-end',
//   },
//   button: {
//     marginTop: theme.spacing(3),
//     marginLeft: theme.spacing(1),
//   },
// }));
//
// const steps = ['Shipping address', 'Payment details', 'Review your order'];
//
// function getStepContent(step) {
//   switch (step) {
//     case 0:
//       return <AddressForm />;
//     case 1:
//       return <PaymentForm />;
//     case 2:
//       return <Review />;
//     default:
//       throw new Error('Unknown step');
//   }
// }
//
// export default function Checkout() {
//   const classes = useStyles();
//   const [activeStep, setActiveStep] = React.useState(0);
//
//   const handleNext = () => {
//     setActiveStep(activeStep + 1);
//   };
//
//   const handleBack = () => {
//     setActiveStep(activeStep - 1);
//   };
//
//   return (
//     import React from 'react'
//     import Stepper from '@material-ui/core/Stepper'
//     import Step from '@material-ui/core/Step'
//     import StepLabel from '@material-ui/core/StepLabel'
//
//     import AddressForm from './AddressForm'
//     import PaymentForm from './PaymentForm'
//     import Confirmation from './Confirmation'
//
//     const steps = [
//       { label: 'Shipping', component: AddressForm, },
//       { label: 'Payment', component: PaymentForm, },
//       { label: 'Confirmation', component: Confirmation }
//     ]
//
//     export default (props) => {
//       const [ activeStep, setActiveStep ] = React.useState(0)
//       return <React.Fragment>
//         <Stepper activeStep={activeStep}>
//           <Step><StepLabel>Shipping</StepLabel></Step>
//           <Step><StepLabel>Payment</StepLabel></Step>
//           <Step><StepLabel>Confirmation</StepLabel></Step>
//         </Stepper>
//       </React.Fragment>
//     }
//
//       <CssBaseline />
//       <AppBar position="absolute" color="default" className={classes.appBar}>
//         <Toolbar>
//           <Typography variant="h6" color="inherit" noWrap>
//             Company name
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <main className={classes.layout}>
//         <Paper className={classes.paper}>
//           <Typography component="h1" variant="h4" align="center">
//             Checkout
//           </Typography>
//           <Stepper activeStep={activeStep} className={classes.stepper}>
//             {steps.map(label => (
//               <Step key={label}>
//                 <StepLabel>{label}</StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//           <React.Fragment>
//             {activeStep === steps.length ? (
//               <React.Fragment>
//                 <Typography variant="h5" gutterBottom>
//                   Thank you for your order.
//                 </Typography>
//                 <Typography variant="subtitle1">
//                   Your order number is #2001539. We have emailed your order confirmation, and will
//                   send you an update when your order has shipped.
//                 </Typography>
//               </React.Fragment>
//             ) : (
//               <React.Fragment>
//                 {getStepContent(activeStep)}
//                 <div className={classes.buttons}>
//                   {activeStep !== 0 && (
//                     <Button onClick={handleBack} className={classes.button}>
//                       Back
//                     </Button>
//                   )}
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleNext}
//                     className={classes.button}
//                   >
//                     {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
//                   </Button>
//                 </div>
//               </React.Fragment>
//             )}
//           </React.Fragment>
//         </Paper>
//         <Copyright />
//       </main>
//     </React.Fragment>
//   );
// }
