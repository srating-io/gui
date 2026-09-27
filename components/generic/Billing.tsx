'use client';

import { Appearance, loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';


import CheckoutForm from './Billing/CheckoutForm';
import FreeTrialForm from './Billing/FreeTrialForm';
import { Modal, Typography, useTheme } from '@esmalley/react-material-ui';



// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const Billing = ({ pricing, open, closeHandler }) => {
  const theme = useTheme();

  const appearance: Appearance = {
    theme: (theme.mode === 'dark' ? 'night' : 'stripe'),
    labels: 'floating',
    variables: {
      colorBackground: theme.mode === 'dark' ? '#383838' : theme.background.main,
    },
    rules: {
      '.Input': {
        padding: '5px',
        // 'boxShadow': 'none',
        // 'border': 'none'
      },
      '.Tab': {
        padding: '5px',
      },
    },
  };

  const options: StripeElementsOptions = {
    // clientSecret,
    mode: 'subscription',
    amount: pricing.price * 100,
    currency: 'usd',
    appearance,
  };

  const trial = (pricing.code === 'api_trial');

  return (
    <Modal
      open={open}
      onClose={closeHandler}
      paperStyle={{ maxWidth: 550 }}
    >
      <Typography type = 'h5' >{pricing.name || 'Loading...'} {pricing.type === 'picks' ? 'projections access' : 'API access'}</Typography>
      <div>
        <div>
          {!trial ? <Typography style = {{ color: theme.text.secondary }} type = 'caption'>See <a style = {{ color: theme.link.primary }} href = "https://srating.io/terms-and-conditions" target = "_blank">terms and conditions</a> before subscribing. Payments processed securely via <a style = {{ color: theme.link.primary }} href = "https://stripe.com" target = "_blank">Stripe</a></Typography> : ''}
        </div>
        {
        trial ?
          <div>
            <FreeTrialForm />
          </div>
          :
          <div>
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm pricing = {pricing} />
            </Elements>
          </div>
        }
      </div>
    </Modal>
  );
};

export default Billing;
