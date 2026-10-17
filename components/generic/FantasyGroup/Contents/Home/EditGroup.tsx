'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { useClientAPI } from '@/components/clientAPI';
import FantasyGroupHelper from '@/components/helpers/FantasyGroup';
import { Dates } from '@esmalley/ts-utils';
import {
  Button, Columns, DateInput, Inputs, Modal, TextInput, Typography, useTheme,
} from '@esmalley/react-material-ui';

/**
 * Correct a league after creating it.
 *
 * Only what `fantasy_group.updateGroup` accepts is here - the sport, season, league type, draft
 * style, entry fee and payout rule are what people join and pay on, so they stay fixed. The api
 * refuses the whole call once the league is locked, started or finished.
 */
const EditGroup = (
  {
    open,
    closeHandler,
  }:
  {
    open: boolean;
    closeHandler: () => void;
  },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [draftStart, setDraftStart] = useState<string | null>(null);
  const [draftMinutes, setDraftMinutes] = useState('');
  const [entries, setEntries] = useState('');
  const [entriesPerUser, setEntriesPerUser] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [triggerValidation, setTriggerValidation] = useState(false);

  const inputHandler = new Inputs();
  const fantasyHelper = new FantasyGroupHelper({ fantasy_group });
  const isDraft = fantasyHelper.isDraft();

  // the modal stays mounted, so seed from the group each time it opens
  useEffect(() => {
    setName(fantasy_group.name || '');
    setStartDate(fantasy_group.start_date || null);
    setEndDate(fantasy_group.end_date || null);
    setDraftStart(fantasy_group.draft_start_datetime || null);
    setDraftMinutes(fantasy_group.draft_time_per_user_in_seconds ? `${+(fantasy_group.draft_time_per_user_in_seconds / 60).toFixed(2)}` : '');
    setEntries(fantasy_group.entries ? `${fantasy_group.entries}` : '');
    setEntriesPerUser(`${fantasy_group.entries_per_user || 1}`);
    setErrorMessage('');
    setTriggerValidation(false);
  }, [open, fantasy_group]);

  const handleSave = () => {
    if (sending) {
      return;
    }

    if (inputHandler.getErrors().length) {
      setTriggerValidation(true);
      return;
    }

    setTriggerValidation(false);
    setSending(true);
    dispatch(setLoading(true));

    const args: {[key: string]: string | number | null} = {
      fantasy_group_id: fantasy_group.fantasy_group_id,
      name,
      entries_per_user: +entriesPerUser,
    };

    if (fantasy_group.cap) {
      args.entries = entries ? +entries : null;
    }

    if (isDraft) {
      args.start_date = startDate;
      args.end_date = endDate;
      args.draft_start_datetime = draftStart;
      args.draft_time_per_user_in_seconds = draftMinutes ? +(+draftMinutes * 60).toFixed(2) : null;
    }

    useClientAPI({
      class: 'fantasy_group',
      function: 'updateGroup',
      arguments: args,
    }).then((response) => {
      setSending(false);
      dispatch(setLoading(false));

      if (!response || response.error) {
        setErrorMessage(response?.error || 'Could not save the league, please try again.');
        return;
      }

      dispatch(setDataKey({ key: 'fantasy_group', value: response }));
      closeHandler();
    }).catch((err) => {
      console.log(err);
      setSending(false);
      dispatch(setLoading(false));
      setErrorMessage('Could not save the league, please try again.');
    });
  };

  return (
    <Modal
      open={open}
      onClose={closeHandler}
      paperStyle={{ maxWidth: 650 }}
    >
      <Typography type = 'h5'>Edit league</Typography>
      <div>
        <TextInput
          key = {`name-${open}`}
          inputHandler={inputHandler}
          label = 'League name'
          placeholder='League name'
          variant = 'filled'
          required
          maxLength={255}
          defaultValue={fantasy_group.name || ''}
          onChange={(val) => setName(val as string)}
          triggerValidation={triggerValidation}
        />

        <Columns numberOfColumns={2}>
          <TextInput
            key = {`entries-per-user-${open}`}
            inputHandler={inputHandler}
            label = 'Entries per user'
            placeholder='Entries per user'
            variant = 'filled'
            formatter = 'number'
            min={1}
            max={100}
            required
            defaultValue={`${fantasy_group.entries_per_user || 1}`}
            onChange={(val) => setEntriesPerUser(val as string)}
            triggerValidation={triggerValidation}
          />
          {
            fantasy_group.cap ?
              <TextInput
                key = {`entries-${open}`}
                inputHandler={inputHandler}
                label = 'Maximum entries'
                placeholder='Maximum entries'
                variant = 'filled'
                formatter = 'number'
                min={1}
                max={10000}
                required
                defaultValue={fantasy_group.entries ? `${fantasy_group.entries}` : ''}
                onChange={(val) => setEntries(val as string)}
                triggerValidation={triggerValidation}
              />
              : <div />
          }
        </Columns>

        {
          isDraft ?
            <>
              <Columns numberOfColumns={2}>
                <DateInput
                  inputHandler={inputHandler}
                  label = 'League start'
                  placeholder='League start'
                  required
                  enableTime
                  value={startDate ? Dates.format(Dates.parse(startDate, true), 'Y-m-d H:i:s') : undefined}
                  onChange={(val) => setStartDate(val ? Dates.format(Dates.parse(val as string), 'Y-m-d H:i:s', true) : null)}
                  triggerValidation={triggerValidation}
                />
                <DateInput
                  inputHandler={inputHandler}
                  label = 'League end'
                  placeholder='League end'
                  required
                  enableTime
                  value={endDate ? Dates.format(Dates.parse(endDate, true), 'Y-m-d H:i:s') : undefined}
                  onChange={(val) => setEndDate(val ? Dates.format(Dates.parse(val as string), 'Y-m-d H:i:s', true) : null)}
                  triggerValidation={triggerValidation}
                />
              </Columns>

              <Columns numberOfColumns={2}>
                <DateInput
                  inputHandler={inputHandler}
                  label = 'Draft start'
                  placeholder='Draft start'
                  enableTime
                  value={draftStart ? Dates.format(Dates.parse(draftStart, true), 'Y-m-d H:i:s') : undefined}
                  onChange={(val) => setDraftStart(val ? Dates.format(Dates.parse(val as string), 'Y-m-d H:i:s', true) : null)}
                  triggerValidation={triggerValidation}
                />
                <TextInput
                  key = {`draft-minutes-${open}`}
                  inputHandler={inputHandler}
                  label = 'Minutes per pick'
                  placeholder='Minutes per pick'
                  variant = 'filled'
                  formatter = 'number'
                  defaultValue={draftMinutes}
                  onChange={(val) => setDraftMinutes(val as string)}
                  triggerValidation={triggerValidation}
                />
              </Columns>
            </>
            : ''
        }

        {errorMessage ? <Typography type = 'body2' style = {{ color: theme.error.main }}>{errorMessage}</Typography> : ''}

        <div style = {{ textAlign: 'right', marginTop: 10 }}>
          <Button ink title={sending ? 'Saving...' : 'Save'} value = 'save' disabled={sending} onClick={handleSave} />
        </div>
      </div>
    </Modal>
  );
};

export default EditGroup;
