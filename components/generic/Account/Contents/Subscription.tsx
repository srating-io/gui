'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ContentCopyIcon from '@esmalley/react-material-icons/ContentCopy';
import VisibilityIcon from '@esmalley/react-material-icons/Visibility';
import VisibilityOffIcon from '@esmalley/react-material-icons/VisibilityOff';

import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { Arithmetic, Dates, toast } from '@esmalley/ts-utils';
import {
  Button, Divider, IconButton, LinearProgress, Modal, Paper, Tooltip, Typography, useTheme,
} from '@esmalley/react-material-ui';
import { Auth, Payments } from '@srating-io/types';


const Subscription = (
  { subscription, pricing, api_key }:
  { subscription: Payments.Subscription; pricing: Payments.Pricing; api_key: Auth.ApiKey | null; },
) => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [cancelledSub, setCancelledSub] = useState<Payments.Subscription | null>(null);
  const [apiKey, setApiKey] = useState<Auth.ApiKey | null>(api_key);
  const [keyVisible, setKeyVisible] = useState(false);

  let due: Date;

  if (
    pricing.code === 'picks_yearly'
  ) {
    due = Dates.add(subscription.renewed, 1, 'years');
  } else {
    due = Dates.add(subscription.renewed, 1, 'months');
  }


  const handleCancelOpen = () => {
    setCancelOpen(true);
  };

  const handleCancelClose = () => {
    setCancelOpen(false);
  };

  const handleCancelSubscription = () => {
    dispatch(setLoading(true));
    handleCancelClose();
    useClientAPI({
      class: 'billing',
      function: 'cancelSubscription',
      arguments: {
        subscription_id: subscription.subscription_id,
      },
    }).then((response) => {
      dispatch(setLoading(false));
      setCancelledSub(response);
    }).catch(() => {
      dispatch(setLoading(false));
      toast.error('Could not cancel subscription. Please try again.');
    });
  };

  const handleRegenerateOpen = () => {
    setRegenerateOpen(true);
  };

  const handleRegenerateClose = () => {
    setRegenerateOpen(false);
  };

  const handleRegenerate = () => {
    if (!apiKey) {
      return;
    }

    dispatch(setLoading(true));
    handleRegenerateClose();

    useClientAPI({
      class: 'api_key',
      function: 'regenerate',
      arguments: {
        key: apiKey.key,
      },
    }).then((response) => {
      setApiKey(response);
      setKeyVisible(false);
      dispatch(setLoading(false));
      toast.success('API key regenerated.');
    }).catch(() => {
      dispatch(setLoading(false));
      toast.error('Could not regenerate API key. Please try again.');
    });
  };

  const handleCopyKey = () => {
    if (!apiKey) {
      return;
    }

    navigator.clipboard.writeText(apiKey.key).then(() => {
      toast.success('API key copied.');
    }).catch(() => {
      toast.error('Could not copy. Please copy it manually.');
    });
  };

  const handleToggleKey = () => {
    setKeyVisible(!keyVisible);
  };

  const handleRenewClick = () => {
    dispatch(setLoading(true));
    router.push('/pricing');
  };

  let expiration = subscription.expires;

  if (cancelledSub) {
    expiration = cancelledSub.expires;
  }

  // An expired or cancelled subscription should not offer key or billing actions.
  const isActive = cancelledSub === null && !subscription.expires;
  const isAPI = pricing.type === 'api' || pricing.type === 'trial';

  const usage = apiKey?.usage || 0;
  const usageLimit = apiKey?.usage_limit || 0;
  const usagePercent = usageLimit > 0 ? Arithmetic.clamp(Math.round((usage / usageLimit) * 100), 0, 100) : 0;
  const usageRemaining = Math.max(0, usageLimit - usage);

  let usageColor = theme.success.main;

  if (usagePercent >= 90) {
    usageColor = theme.error.main;
  } else if (usagePercent >= 75) {
    usageColor = theme.warning.main;
  }

  // Usage rolls over on the 1st, so the next reset is the start of next month.
  const nextReset = Dates.getStartOfMonth(Dates.add(new Date(), 1, 'months'));

  return (
    <div>
      <Typography type='h6'>{isAPI ? 'API' : 'Picks'} subscription ({pricing.name})</Typography>
      <Paper elevation={3} style = {{ minWidth: 320, maxWidth: 500, width: 'auto', padding: 20 }}>
        <Typography style = {{ marginTop: 5, color: theme.text.secondary }} type='body1'>{pricing.description}</Typography>
        {pricing.type !== 'trial' && isActive ? <Typography type='body1'>Automatically renews on {Dates.format(due, 'M jS \'y')}</Typography> : ''}
        {expiration ? <Typography type='body1'>Expires on {Dates.format(expiration, 'M jS \'y')}</Typography> : ''}
        {
          isAPI && apiKey ?
          <div>
            <Divider style = {{ margin: '15px 0px' }} />
            <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Typography style = {{ color: theme.text.secondary }} type='subtitle1'>Usage</Typography>
              {usageLimit > 0 ? <Typography style = {{ color: usageColor }} type='subtitle2'>{usagePercent}%</Typography> : ''}
            </div>
            {
              usageLimit > 0 ?
              <div>
                <LinearProgress
                  type='determinate'
                  value={usagePercent}
                  color={usageColor}
                  containerStyle={{ height: 8, borderRadius: 4, margin: '6px 0px' }}
                />
                <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Typography type='body1'>{usage.toLocaleString()} / {usageLimit.toLocaleString()}</Typography>
                  <Typography style = {{ color: theme.text.secondary }} type='subtitle2'>{usageRemaining.toLocaleString()} remaining</Typography>
                </div>
              </div> :
              <Typography type='body1'>{usage.toLocaleString()} <span style = {{ color: theme.text.secondary }}>/ unlimited</span></Typography>
            }
            <Typography style = {{ color: theme.text.secondary }} type='subtitle2'>Resets {Dates.format(nextReset, 'M jS')}, and the 1st of every month.</Typography>
            <Divider style = {{ margin: '15px 0px' }} />
            <div style = {{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Typography style = {{ color: theme.text.secondary }} type='subtitle1'>API key</Typography>
              {isActive ? <Button onClick={handleRegenerateOpen} title = 'Regenerate' ink value = 'regen' /> : ''}
            </div>
            <div
              style = {{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 5,
                padding: '4px 4px 4px 10px',
                border: `thin solid ${theme.grey[600]}`,
                borderRadius: 4,
              }}
            >
              <Typography
                type='body1'
                style = {{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {/* Mask matches the key length so toggling does not resize the card. */}
                {keyVisible ? apiKey.key : '•'.repeat(apiKey.key.length)}
              </Typography>
              <Tooltip onClickRemove text = {keyVisible ? 'Hide' : 'Show'}>
                <IconButton
                  onClick = {handleToggleKey}
                  value = 'toggle_key'
                  icon = {keyVisible ? <VisibilityOffIcon style = {{ fontSize: 20 }} /> : <VisibilityIcon style = {{ fontSize: 20 }} />}
                />
              </Tooltip>
              <Tooltip onClickRemove text = 'Copy'>
                <IconButton
                  onClick = {handleCopyKey}
                  value = 'copy_key'
                  icon = {<ContentCopyIcon style = {{ fontSize: 20 }} />}
                />
              </Tooltip>
            </div>
          </div>
            : ''
        }
        {
          pricing.type !== 'trial' ?
          <div style = {{ textAlign: 'right' }}>
            {
              isActive ?
                <Button onClick={handleCancelOpen} title = 'Cancel subscription' value = 'cancel' ink buttonStyle = {{ color: theme.error.main }} /> :
                <Button onClick={handleRenewClick} title = 'Renew' value = 'renew' ink buttonStyle = {{ color: theme.success.main }} />
            }
          </div>
            : ''
        }
        <Modal
          open={cancelOpen}
          onClose={handleCancelClose}
        >
          <Typography type = 'h6'>{'Cancel subscription?'}</Typography>
          <Typography type = 'body1' style = {{ color: theme.text.secondary, margin: '10px 0px' }}>Subscription will remain active until next billing date.</Typography>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <Button onClick={handleCancelClose} autoFocus title='Back' ink value = 'back' />
            <Button onClick={handleCancelSubscription} buttonStyle={{ backgroundColor: theme.error.main }} title = 'Cancel subscription' value = 'cancel' />
          </div>
        </Modal>
        <Modal
          open={regenerateOpen}
          onClose={handleRegenerateClose}
        >
          <Typography type = 'h6'>{'Regenerate API key?'}</Typography>
          <Typography type = 'body1' style = {{ color: theme.text.secondary, margin: '10px 0px' }}>Your current key stops working immediately. Anything using it will need the new key.</Typography>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <Button onClick={handleRegenerateClose} autoFocus title='Back' ink value = 'back' />
            <Button onClick={handleRegenerate} buttonStyle={{ backgroundColor: theme.error.main }} title = 'Regenerate' value = 'regen' />
          </div>
        </Modal>
      </Paper>
    </div>
  );
};

export default Subscription;
