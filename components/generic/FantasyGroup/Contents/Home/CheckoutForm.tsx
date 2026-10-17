'use client';

import { useState } from 'react';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { Button, Typography, useTheme } from '@esmalley/react-material-ui';


const CheckoutForm = ({ entryName }) => {
  const theme = useTheme();
  const stripe = useStripe();
  const elements = useElements();

  const dispatch = useAppDispatch();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // `loading` is dispatched only after `elements.submit()` resolves, so two quick clicks both got
  // past the button's disabled check and bought two entries. This closes before any await.
  const [sending, setSending] = useState(false);

  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const loading = useAppSelector((state) => state.loadingReducer.loading);


  const handleStripeError = (error) => {
    dispatch(setLoading(false));
    setSending(false);
    setPaymentError(error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sending) {
      return;
    }

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Require email
    if (!entryName) {
      setPaymentError('Entry name is required.');
      return;
    }

    setSending(true);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      handleStripeError(submitError);
      return;
    }

    dispatch(setLoading(true));


    const billingData = await useClientAPI({
      class: 'billing',
      function: 'createFantasyGroupEntry',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
        name: entryName,
      },
    });


    if (!billingData || billingData.error) {
      dispatch(setLoading(false));
      setSending(false);
      if (!billingData) {
        setPaymentError('Something went wrong, please try again later.');
      } else {
        setPaymentError(billingData.error.message ? billingData.error.message : billingData.error);
      }
      return;
    }

    const { paymentIntent, payment_router, email } = billingData;

    // Both are declared nullable and both are null if the payment intent could not be created.
    // Dereferencing them threw out of this async handler, so `loading` was never cleared and the
    // user sat on a dead form - with an entry already created server side.
    if (
      !paymentIntent ||
      !paymentIntent.client_secret ||
      !payment_router ||
      !payment_router.payment_router_id
    ) {
      dispatch(setLoading(false));
      setSending(false);
      setPaymentError('Could not start the payment. Nothing has been charged - please try again.');
      return;
    }

    const clientSecret = paymentIntent.client_secret;

    const url = `payment_router/${payment_router.payment_router_id}/`;

    // Confirm the Intent using the details collected by the Payment Element
    const confirmIntentData = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
            name: email,
            email,
            // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
            phone: null,
            address: {
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              city: null,
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              country: null,
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              line1: null,
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              line2: null,
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              postal_code: null,
              // if you change these to undefined or an empty string, the payments fails, im not collecting them... null works
              state: null,
            },
          },
        },
        // the origin we are actually served from, so a staging host does not send the payer to
        // production to land on an intent that host knows nothing about
        return_url: `${window.location.origin}/${url}`,
      },
      // redirect: 'if_required',
    });


    if (confirmIntentData.error) {
      // This point is only reached if there's an immediate error when confirming the Intent.
      // Show the error to your customer (for example, "payment details incomplete").
      handleStripeError(confirmIntentData.error);
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    fields: {
      billingDetails: 'never',
    },
  };


  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options = {paymentElementOptions} />
      <div style = {{ marginTop: 10 }}>
        <Typography style = {{ color: theme.text.secondary }} type = 'caption'>This league has an entry fee. Your entry fee will count towards the total pool. The fee for this entry is ${fantasy_group.entry_fee}. See <a style = {{ color: theme.link.primary }} href = "https://srating.io/terms-and-conditions" target = "_blank">terms and conditions</a> before joining. Payments processed securely via <a style = {{ color: theme.link.primary }} href = "https://stripe.com" target = "_blank">Stripe</a></Typography>
      </div>
      <Button
        onClick={handleSubmit}
        containerStyle={{ width: '100%' }}
        buttonStyle = {{ width: '100%', marginTop: '20px', textAlign: 'center', backgroundColor: theme.blue[700] }}
        disabled={sending || loading || !stripe || !elements}
        title = {sending ? 'Processing...' : `Pay ${fantasy_group.entry_fee}`} value = 'pay'
      />
      {paymentError && <div id="payment-message" style = {{ color: theme.error.main }}>Error: {paymentError}</div>}
    </form>
  );
};


export default CheckoutForm;
