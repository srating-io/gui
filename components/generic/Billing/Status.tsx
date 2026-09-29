'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';

import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import HourglassBottomIcon from '@esmalley/react-material-icons/HourglassBottom';
import WarningIcon from '@esmalley/react-material-icons/Warning';
import ErrorIcon from '@esmalley/react-material-icons/Error';
import Footer from '../Footer';
import Conversions from './Conversions';
import { PaymentIntent, SetupIntent } from '@stripe/stripe-js';
import { Button, CircularProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';


const Status = () => {
  const theme = useTheme();
  const stripe = useStripe();
  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [triggerConversion, setTriggerConversion] = useState(false);

  const getStatusMessage = (status: string, isSetup: boolean) => {
    const messages: Record<string, string> = {
      succeeded: isSetup ? 'Success! Subscription set up.' : 'Success! Payment received.',
      processing: "Payment processing. We'll update you when payment is received.",
      requires_payment_method: 'Payment failed. Please try another method.',
      default: 'An error occurred. Please try again later.',
    };
    return messages[status] || messages.default;
  };

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const piSecret = params.get('payment_intent_client_secret');
    const siSecret = params.get('setup_intent_client_secret');

    const handleResult = (intent: PaymentIntent | SetupIntent | undefined, isSetup = false) => {
      if (!intent) {
        return;
      }

      setStatus(intent.status || 'error');
      setAmount('amount' in intent ? intent.amount : 0);
      setReference(intent.id);
      setMessage(getStatusMessage(intent.status, isSetup));

      if (intent.status === 'succeeded') {
        setTriggerConversion(true);
      }
    };

    if (piSecret) {
      stripe.retrievePaymentIntent(piSecret).then(({ paymentIntent }) => handleResult(paymentIntent));
    } else if (siSecret) {
      stripe.retrieveSetupIntent(siSecret).then(({ setupIntent }) => handleResult(setupIntent, true));
    }
  }, [stripe]); // Only runs when stripe instance is ready

  /**
   * Get an icon based on the status
   * @return Icon
   */
  const getIcon = () => {
    if (status === 'succeeded') {
      return <CheckCircleIcon style = {{ fontSize: 24, color: theme.success.main }} />;
    } if (status === 'processing') {
      return <HourglassBottomIcon style = {{ fontSize: 24, color: theme.info.main }} />;
    } if (status === 'requires_payment_method') {
      return <WarningIcon style = {{ fontSize: 24, color: theme.warning.main }} />;
    }

    return <ErrorIcon style = {{ fontSize: 24, color: theme.error.main }} />;
  };

  return (
    <div>
      {triggerConversion ? <Conversions amount = {amount} reference = {reference} /> : ''}
      {
        !status ? <div style = {{ textAlign: 'center' }}><CircularProgress /></div> :
        <div style = {{ padding: 20 }}>
          <div style = {{ textAlign: 'center' }}>
            <Typography type='h6'>Subscription details</Typography>
          </div>
          <Paper elevation={3} style = {{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
            <div style = {{ display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
              <div style = {{ display: 'flex', alignItems: 'center', marginRight: 10 }}>{getIcon()}</div><Typography type='body1'>{message}</Typography>
            </div>

            <div style={{ marginBottom: 5 }}>
              <Typography type='subtitle2' style = {{ color: theme.text.secondary }}>Amount Paid</Typography>
              <Typography type='body1'>${['succeeded', 'processing'].includes(status) ? (amount / 100).toFixed(2) : '0.00'}</Typography>
            </div>

            <div style={{ marginBottom: 5 }}>
              <Typography type='subtitle2' style = {{ color: theme.text.secondary }}>Reference</Typography>
              <Typography type='body2'>{reference}</Typography>
            </div>
            <div style = {{ textAlign: 'right' }}>
              <Button ink onClick={() => { router.push('/account'); }} title = {'View account'} value = 'view-account' />
            </div>
          </Paper>
        </div>
      }
      <Footer />
    </div>
  );
};

export default Status;
