'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';


import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import HourglassBottomIcon from '@esmalley/react-material-icons/HourglassBottom';
import WarningIcon from '@esmalley/react-material-icons/Warning';
import ErrorIcon from '@esmalley/react-material-icons/Error';
import { PaymentIntent, SetupIntent } from '@stripe/stripe-js';
import { useAppSelector } from '@/redux/hooks';
import { useClientAPI } from '@/components/clientAPI';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, CircularProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';


const Client = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const stripe = useStripe();
  const router = useRouter();

  const payment_router = useAppSelector((state) => state.paymentRouterReducer.payment_router);

  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [fantasyGroupID, setFantasyGroupID] = useState<string | null>(null);

  // The router row names the entry but not its league, and the league is where the entry can be
  // paid. Only looked up when the payment actually needs retrying.
  useEffect(() => {
    if (status !== 'requires_payment_method' || payment_router.table !== 'fantasy_entry' || !payment_router.id) {
      return;
    }

    useClientAPI({
      class: 'fantasy_entry',
      function: 'get',
      arguments: {
        fantasy_entry_id: payment_router.id,
      },
    }).then((fantasy_entry) => {
      if (fantasy_entry && !fantasy_entry.error && fantasy_entry.fantasy_group_id) {
        setFantasyGroupID(fantasy_entry.fantasy_group_id);
      }
    }).catch((error) => {
      console.log(error);
    });
  }, [status, payment_router.table, payment_router.id]);

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
      // Anything that leaves `status` null spins forever, so every path below has to land on a
      // status - a missing client secret, a rejected lookup and a lookup that returns no intent
      // included.
      if (!intent) {
        setStatus('error');
        setMessage(getStatusMessage('default', isSetup));
        return;
      }

      setStatus(intent.status || 'error');
      setAmount('amount' in intent ? intent.amount : 0);
      setReference(intent.id);
      setMessage(getStatusMessage(intent.status, isSetup));
    };

    const handleFailure = (error: unknown, isSetup = false) => {
      console.log(error);
      setStatus('error');
      setMessage(getStatusMessage('default', isSetup));
    };

    if (piSecret) {
      stripe.retrievePaymentIntent(piSecret)
        .then(({ paymentIntent }) => handleResult(paymentIntent))
        .catch((error) => handleFailure(error));
    } else if (siSecret) {
      stripe.retrieveSetupIntent(siSecret)
        .then(({ setupIntent }) => handleResult(setupIntent, true))
        .catch((error) => handleFailure(error, true));
    } else {
      handleResult(undefined);
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

  const getButton = () => {
    if (payment_router.table === 'fantasy_entry') {
      // A failed payment used to offer only "View entry", which is not where you can pay. Send them
      // back to the league, where the unpaid entry now carries a "Pay now" button.
      if (status === 'requires_payment_method' && fantasyGroupID) {
        return <Button ink onClick={() => { navigation.fantasy_group(`/fantasy_group/${fantasyGroupID}`); }} title = {'Try again'} value = 'retry-payment' />;
      }

      return <Button ink onClick={() => { navigation.fantasy_entry(`/fantasy_entry/${payment_router.id}`); }} title = {'View entry'} value = 'view-entry' />;
    }

    return <Button ink onClick={() => { router.push('/account'); }} title = {'View account'} value = 'view-account' />;
  };

  let title = 'Subscription details';

  if (payment_router.table === 'fantasy_entry') {
    title = 'Fantasy league entry fee';
  }

  return (
    <div>
      {
        !status ? <div style = {{ textAlign: 'center' }}><CircularProgress /></div> :
        <div style = {{ padding: 20 }}>
          <div style = {{ textAlign: 'center' }}>
            <Typography type='h6'>{title}</Typography>
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
              {getButton()}
            </div>
          </Paper>
        </div>
      }
    </div>
  );
};

export default Client;
