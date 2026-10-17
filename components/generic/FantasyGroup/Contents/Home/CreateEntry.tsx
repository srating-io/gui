'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { useEffect, useState } from 'react';
import CheckoutForm from './CheckoutForm';
import { setLoading } from '@/redux/features/loading-slice';
import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { stripePromise } from '@/lib/stripe-client';
import { Objector } from '@esmalley/ts-utils';
import { Button, Inputs, Modal, TextInput, Typography, useTheme } from '@esmalley/react-material-ui';

const CreateEntry = (
  {
    open,
    closeHandler,
    initialName = '',
  }:
  {
    open: boolean;
    closeHandler: (fantasy_entry_id: string | null) => void;
    /** the name of an unpaid entry being resumed, which the api pays rather than duplicating */
    initialName?: string;
  },
) => {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const [entryName, setEntryName] = useState(initialName);
  const [sending, setSending] = useState(false);
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // the modal stays mounted, so the name has to be re-seeded each time it opens
  useEffect(() => {
    setEntryName(initialName);
    setErrorMessage('');
  }, [open, initialName]);

  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);

  const { entry_fee } = fantasy_group;

  const inputHandler = new Inputs();

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
    mode: 'payment',
    amount: fantasy_group.entry_fee ? (fantasy_group.entry_fee * 100) : 0, // stripe uses pennies here
    currency: 'usd',
    appearance,
  };

  const createFreeEntry = () => {
    if (sending) {
      return;
    }

    const errors = inputHandler.getErrors();

    setTriggerValidation(false);

    if (errors.length) {
      setTriggerValidation(true);
      return;
    }


    setSending(true);
    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_entry',
      function: 'createEntry',
      arguments: {
        fantasy_group_id: fantasy_group.fantasy_group_id,
        name: entryName,
      },
    })
      .then((response) => {
        setSending(false);
        dispatch(setLoading(false));

        if (response.error) {
          setErrorMessage(response.error);
        } else {
          dispatch(setDataKey({ key: 'fantasy_entrys', value: Objector.extender({}, fantasy_entrys, response.fantasy_entrys) }));

          // this will only return 1, but its in the object key format
          let new_fantasy_entry_id: string | null = null;
          for (const id in response.fantasy_entrys) {
            new_fantasy_entry_id = id;
          }
          closeHandler(new_fantasy_entry_id);
        }
      })
      .catch((err) => {
        console.log(err);
        setSending(false);
        dispatch(setLoading(false));
        closeHandler(null);
      });
  };



  return (
    <Modal
      open={open}
      onClose={() => closeHandler(null)}
      paperStyle={{ maxWidth: 550 }}
    >
      <Typography type = 'h5'>{initialName ? 'Finish your entry payment' : 'Create league entry'}</Typography>
      <div>
        <TextInput
          key = {`${open}-${initialName}`}
          defaultValue = {initialName}
          inputHandler={inputHandler}
          label = 'Please add a name to your entry.'
          placeholder='Entry name'
          variant = 'filled'
          autoFocus
          required
          onChange={(val) => setEntryName(val as string)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              createFreeEntry();
            }
          }}
          triggerValidation = {triggerValidation}
          errorMessage={errorMessage}
        />
        {
          entry_fee ?
            <div>
              <div>
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm entryName={entryName} />
                </Elements>
              </div>
            </div>
            :
            <div style = {{ textAlign: 'right' }}>
              <Button ink title='Create entry' value = 'create' onClick={createFreeEntry} />
            </div>
        }
      </div>
    </Modal>
  );
};

export default CreateEntry;

