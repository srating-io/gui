'use client';

import { Profiler, useState } from 'react';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { getNavHeaderHeight } from '../../NavBar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import InfoIcon from '@esmalley/react-material-icons/Info';
import { useClientAPI } from '@/components/clientAPI';
import { setLoading } from '@/redux/features/loading-slice';
import { Dates } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import {
  Columns,
  DateInput,
  ErrorModal,
  Inputs,
  LinearProgress,
  MultiPicker,
  Select,
  Switch,
  TextInput,
  Typography,
  useKontororu,
  useTheme,
  Wizard,
} from '@esmalley/react-material-ui';
import HelperGeneral from '@/components/helpers/General';
import { General } from '@srating-io/types';
// import InfoOutlineIcon from '@esmalley/react-material-icons/InfoOutline'; need to upgrade MUI for this icon... >.>


// todo somehow connect the textinput min / max to the isValid functions

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: 5, maxWidth: 1400, margin: 'auto' }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 84;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

const Client = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const Kontororu = useKontororu();

  const [isSaving, setIsSaving] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const fantasy_payout_rules = useAppSelector((state) => state.dictionaryReducer.fantasy_payout_rule);
  const terminology = useAppSelector((state) => state.dictionaryReducer.terminology);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const season = useAppSelector((state) => state.organizationReducer.season);
  const loading = useAppSelector((state) => state.loadingReducer.loading);

  const basicInputHandler = new Inputs();
  const draftInputHandler = new Inputs();
  const peopleInputHandler = new Inputs();
  const financialInputHandler = new Inputs();

  const initialFormData = Object.freeze({
    organization_id,
    division_id,
    season,
    name: '',
    fantasy_payout_rule_id: null,
    fantasy_group_type_terminology_id: null,
    draft_type_terminology_id: null,
    draft_scoring_terminology_id: null,
    start_date: null,
    end_date: null,
    draft_start_datetime: null,
    cap: 0,
    entries: null,
    entries_per_user: 1,
    free: 1,
    entry_fee: null,
    open_invites: 1,
    private: 0,
    draft_time_per_user_in_seconds: null,
  });

  // the inputs return strings, but internally they are formatted as a number, so just overwrite to allow string in a few of these columns
  type FantasyGroupForm = Omit<
    General.FantasyGroup,
    'fantasy_group_id' | 'guid' | 'deleted' | 'locked' | 'entry_fee' | 'entries_per_user' | 'date_of_entry' | 'started' | 'notified_24_hours' | 'notified_15_mins' | 'drafted' | 'finished' | 'notified_finished'
  > & {
    entry_fee: string | number | null;
    entries_per_user: string | number;
  };

  const [formData, setFormData] = useState<FantasyGroupForm>(initialFormData);

  // this is beacuse DB stores in seconds, I need to convert the input value, but cant do it after onChange, because it retriggers the input with its set value = {...}
  // this breaks when you type "1.", + cast removes the decimal. set resets inputs value before next key stroke
  const initialDraftMinutes = formData.draft_time_per_user_in_seconds ? (formData.draft_time_per_user_in_seconds / 60).toFixed(2) : '';
  const [draftMinutes, setDraftMinutes] = useState<string>(initialDraftMinutes);

  const [triggerValidation, setTriggerValidation] = useState(false);

  // hardcoded for cbb, todo make this dynamic per org + season
  const minDate = `${season - 1}-11-01`;
  const maxDate = `${season}-04-10`;

  const payoutOptions = Object.values(fantasy_payout_rules)
    .sort((a, b) => {
      return a.ordinal - b.ordinal;
    })
    .map((r) => {
      return { label: r.name, value: r.fantasy_payout_rule_id };
    });


  const onChange = <K extends keyof FantasyGroupForm>(column: K, value: FantasyGroupForm[K]) => {
    setFormData((prev) => ({
      ...prev,
      [column]: value,
    }));
  };


  const stepBasicInfo = {
    title: 'League setup',
    id: 'basic',
    isValid: () => {
      const errors = basicInputHandler.getErrors();

      if (errors.length) {
        return false;
      }

      // In theory this SHOULD NOT be needed anymore, the inputs as all the control now! :)
      // if (
      //   !formData.fantasy_group_type_terminology_id ||
      //   !formData.name
      // ) {
      // return false;
      // }

      return true;
    },
    content: (
      <>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Just need a few details about this league...we will guide you through setting it up!</Typography>
        <div style={{ marginBottom: 20, marginTop: 10 }}>
          <MultiPicker
            inputHandler = {basicInputHandler}
            label='What type of league is this?'
            onChange={(val) => onChange('fantasy_group_type_terminology_id', val as string)}
            required
            options={HelperGeneral.getTerminologyOptions('fantasy_group_type')}
            selected={formData.fantasy_group_type_terminology_id ? [formData.fantasy_group_type_terminology_id] : []}
            isRadio
            triggerValidation={triggerValidation}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <TextInput
            inputHandler = {basicInputHandler}
            label = 'What is the name of the league?'
            placeholder='League name'
            onChange={(val) => onChange('name', val as string)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                Kontororu.dispatchEvent(new CustomEvent('next'));
              }
            }}
            maxLength={255}
            value={formData.name}
            required
            triggerValidation={triggerValidation}
          />
        </div>
      </>
    ),
  };

  const stepDraft = {
    title: 'Draft Configuration',
    id: 'draft',
    // Logic: If draft type is selected, and if it's the specific draft type that requires date/time, ensure those are filled
    isValid: () => {
      const errors = draftInputHandler.getErrors();

      if (errors.length) {
        return false;
      }

      if (
        !formData.draft_type_terminology_id ||
        !formData.draft_scoring_terminology_id ||
        !formData.start_date ||
        !formData.end_date
      ) {
        return false;
      }

      if (
        formData.start_date &&
        formData.end_date &&
        formData.start_date > formData.end_date
      ) {
        setErrorModalMessage('League start date can not be after end date.');
        return false;
      }

      const now = new Date().getTime();

      if (
        formData.start_date &&
        Dates.parse(formData.start_date).getTime() < now
      ) {
        setErrorModalMessage('Start can not be in the past');
        return false;
      }

      if (
        formData.draft_start_datetime &&
        Dates.parse(formData.draft_start_datetime).getTime() < now
      ) {
        setErrorModalMessage('Draft start can not be in the past');
        return false;
      }

      return true;
    },
    onBack: () => {
      setFormData((prev) => ({
        ...prev,
        draft_type_terminology_id: initialFormData.draft_type_terminology_id,
        draft_time_per_user_in_seconds: initialFormData.draft_time_per_user_in_seconds,
        draft_scoring_terminology_id: initialFormData.draft_scoring_terminology_id,
        start_date: initialFormData.start_date,
        end_date: initialFormData.end_date,
        draft_start_datetime: initialFormData.draft_start_datetime,
      }));
      setDraftMinutes(initialDraftMinutes);
    },
    content: (
      <>
        <div style={{ marginBottom: 20 }}>
          <MultiPicker
            inputHandler={draftInputHandler}
            label='How will the player draft work?'
            onChange={(val) => {
              onChange('draft_type_terminology_id', val as string);
              onChange('draft_start_datetime', initialFormData.draft_start_datetime);
              setDraftMinutes(initialDraftMinutes);
            }}
            required
            options={HelperGeneral.getTerminologyOptions('draft_type')}
            selected={formData.draft_type_terminology_id ? [formData.draft_type_terminology_id] : []}
            isRadio
            triggerValidation={triggerValidation}
          />
          {formData.draft_type_terminology_id && formData.draft_type_terminology_id in terminology ? (
            <div style = {{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon style = {{ color: theme.info.main, marginRight: 10, fontSize: 24 }} />
              <Typography type='caption' style={{ color: theme.text.secondary }}>{terminology[formData.draft_type_terminology_id].description}</Typography>
            </div>
          ) : ''}
        </div>

        <div style={{ marginBottom: 20 }}>
          <Columns numberOfColumns={2}>
            <div>
              <DateInput
                inputHandler={draftInputHandler}
                required
                label = 'When does the draft start?'
                placeholder='Draft start date and time'
                onChange={(val) => {
                  onChange('draft_start_datetime', val ? Dates.format(Dates.parse(val), 'Y-m-d H:i:s', true) : null);
                }}
                triggerValidation={triggerValidation}
                value = {formData.draft_start_datetime ? Dates.format(Dates.parse(formData.draft_start_datetime, true), 'Y-m-d H:i:s') : undefined}
                minDate = {Dates.format(Dates.add(Dates.parse(null), 30, 'minutes'), 'Y-m-d H:i:a')}
                maxDate = {formData.start_date ? Dates.format(Dates.subtract(Dates.parse(formData.start_date), 6, 'hours'), 'Y-m-d H:i:s') : undefined}
                enableTime
              />
            </div>
            {
              formData.draft_type_terminology_id !== '782f9c90-e11f-11f0-bc34-529c3ffdbb93' ?
                <div>
                  <TextInput
                    inputHandler={draftInputHandler}
                    required
                    label = 'How many minutes does each person have to draft?'
                    placeholder='Draft time (minutes)'
                    onChange={(val) => setDraftMinutes(val as string)}
                    triggerValidation={triggerValidation}
                    formatter={'number'}
                    value = {draftMinutes}
                    min={0.25}
                    max={60}
                  />
                </div>
                : ''
            }
          </Columns>
        </div>

        <div style={{ marginBottom: 20 }}>
          <MultiPicker
            inputHandler={draftInputHandler}
            label='How will scoring work?'
            onChange={(val) => onChange('draft_scoring_terminology_id', val as string)}
            required
            options={HelperGeneral.getTerminologyOptions('draft_scoring')}
            selected={formData.draft_scoring_terminology_id ? [formData.draft_scoring_terminology_id] : []}
            isRadio
            triggerValidation={triggerValidation}
          />
          {formData.draft_scoring_terminology_id && formData.draft_scoring_terminology_id in terminology ? (
            <div style = {{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
              <InfoIcon style = {{ color: theme.info.main, marginRight: 10 }} />
              <Typography type='caption' style={{ color: theme.text.secondary }}>{terminology[formData.draft_scoring_terminology_id].description}</Typography>
            </div>
          ) : ''}
        </div>

        <div style={{ marginBottom: 20 }}>
          <Columns>
            <DateInput
              inputHandler={draftInputHandler}
              required
              label = 'When does the league start?'
              placeholder='Start date'
              onChange={(val) => onChange('start_date', val ? Dates.format(Dates.parse(val), 'Y-m-d H:i:s', true) : null)}
              triggerValidation={triggerValidation}
              value = {formData.start_date ? Dates.format(Dates.parse(formData.start_date, true), 'Y-m-d H:i:s') : undefined}
              minDate = {minDate}
              maxDate = {maxDate}
              enableTime
              />
            <DateInput
              inputHandler={draftInputHandler}
              required
              label = 'When does the league end?'
              placeholder='End date'
              triggerValidation={triggerValidation}
              minDate = {minDate}
              maxDate = {maxDate}
              onChange={(val) => {
                onChange('end_date', val ? Dates.format(Dates.parse(val), 'Y-m-d H:i:s', true) : null);
              }}
              value = {formData.end_date ? Dates.format(Dates.parse(formData.end_date, true), 'Y-m-d H:i:s') : undefined}
              enableTime
            />
          </Columns>
          <div style = {{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon style = {{ color: theme.info.main, marginRight: 10 }} />
            <Typography type='caption' style={{ color: theme.text.secondary, lineHeight: 'initial' }}>Scoring will begin on this date and conclude at the end date. Final results will be available the next day after end.</Typography>
          </div>
        </div>
      </>
    ),
  };

  const stepPeople = {
    title: 'Participants & Capacity',
    id: 'schedule',
    isValid: () => {
      const errors = peopleInputHandler.getErrors();

      if (errors.length) {
        return false;
      }

      if (!formData.entries_per_user || +formData.entries_per_user < 1) {
        return false;
      }

      if (formData.cap && !formData.entries) {
        return false;
      }

      return true;
    },
    onBack: () => {
      setFormData((prev) => ({
        ...prev,
        open_invites: initialFormData.open_invites,
        private: initialFormData.private,
        entries: initialFormData.entries,
        entries_per_user: initialFormData.entries_per_user,
      }));
    },
    content: (
      <>
        <div style={{ marginBottom: 20 }}>
          <Columns>
          <div>
            <Typography type='caption' style={{ color: theme.text.secondary }}>Is the group publically available?</Typography>
            <Switch
              label="Public"
              labelPlacement='start'
              value={!formData.private}
              onChange={(val) => onChange('private', +!val)}
            />
          </div>
            {
              formData.private ?
              <div>
                <Typography type='caption' style={{ color: theme.text.secondary }}>Can anyone invite other people?</Typography>
                <Switch
                  label="Open invite"
                  labelPlacement='start'
                  value={Boolean(formData.open_invites)}
                  onChange={(val) => onChange('open_invites', +val)}
                />
              </div>
                : ''
            }
          </Columns>
        </div>

        <div style={{ display: 'flex', marginBottom: 20 }}>
          <Columns breakPoint={425} numberOfColumns={2}>
            <div style={{ alignContent: 'end' }}>
              <TextInput
                inputHandler={peopleInputHandler}
                label='Entries per user?'
                placeholder='Max entries per user'
                onChange={(val) => onChange('entries_per_user', val)}
                formatter='number'
                value={formData.entries_per_user}
                required
                triggerValidation={triggerValidation}
                min = {1}
              />
            </div>
          </Columns>
        </div>

        <div style={{ maxWidth: 320, marginBottom: 20 }}>
          <Switch
            label="Is there a limit to # of participants?"
            labelPlacement='start'
            value={Boolean(formData.cap)}
            onChange={(val) => onChange('cap', +val)}
          />
        </div>
        {
          formData.cap ?
          <Columns breakPoint={425} numberOfColumns={2}>
            <div style={{ alignContent: 'end' }}>
              <TextInput
                inputHandler={peopleInputHandler}
                label = 'How many people can join?'
                placeholder='# of Entries'
                onChange={(val) => onChange('entries', +val)}
                required
                triggerValidation={triggerValidation}
                formatter='number'
                value = {formData.entries || undefined}
                min={1}
              />
            </div>
          </Columns>

            : ''
        }

      </>
    ),
  };


  const stepFinancials = {
    title: 'Fees & Payouts',
    id: 'financials',
    isValid: () => {
      const errors = financialInputHandler.getErrors();

      if (errors.length) {
        return false;
      }

      if (
        !formData.free &&
        (
          !formData.entry_fee ||
          !formData.fantasy_payout_rule_id
        )
      ) {
        return false;
      }

      if (
        formData.entry_fee &&
        (
          +formData.entry_fee < 5 ||
          +formData.entry_fee > 1000
        )
      ) {
        return false;
      }

      return true;
    },
    onBack: () => {
      setFormData((prev) => ({
        ...prev,
        free: initialFormData.free,
        entry_fee: initialFormData.entry_fee,
        fantasy_payout_rule_id: initialFormData.fantasy_payout_rule_id,
      }));
    },
    content: (
      <>
        <Typography type='caption' style={{ color: theme.text.secondary }}>Does the group have an entry fee?</Typography>
        <div style={{ maxWidth: 150, marginBottom: 20 }}>
          <Switch
            label="Entry fee"
            labelPlacement='start'
            value={!formData.free}
            onChange={(val) => onChange('free', +!val)}
          />
        </div>
        {!formData.free && (
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <Columns breakPoint={500}>
              <div>
                <TextInput
                  inputHandler={financialInputHandler}
                  label = 'How much is the entry fee?'
                  placeholder='$ Entry fee'
                  onChange={(val) => onChange('entry_fee', +val)}
                  required
                  formatter={'money'}
                  triggerValidation={triggerValidation}
                  value = {formData.entry_fee || undefined}
                  min = {5}
                  max = {1000}
                />
              </div>
              <div>
                <Select
                  inputHandler = {financialInputHandler}
                  label = 'Payout distribution?'
                  placeholder="Payout structure"
                  options={payoutOptions}
                  required
                  value={formData.fantasy_payout_rule_id}
                  onChange={(val) => onChange('fantasy_payout_rule_id', val as string)}
                  variant="outlined"
                  triggerValidation={triggerValidation}
                />
              </div>
            </Columns>
          </div>
        )}
      </>
    ),
  };


  const handleSave = () => {
    if (isSaving || loading) {
      return;
    }

    // manually convert the draft seconds here
    if (
      formData.fantasy_group_type_terminology_id === '7ca1ccce-e033-11f0-bc34-529c3ffdbb93' &&
      formData.draft_type_terminology_id !== '782f9c90-e11f-11f0-bc34-529c3ffdbb93'
    ) {
      formData.draft_time_per_user_in_seconds = +(+draftMinutes * 60).toFixed(2);
    }


    dispatch(setLoading(true));
    setIsSaving(true);

    useClientAPI({
      class: 'fantasy_group',
      function: 'createGroup',
      arguments: formData,
    }).then((response) => {
      if (response && response.error) {
        dispatch(setLoading(false));
        setErrorModalMessage(response.error);
        return;
      }

      navigation.fantasy_group(`/fantasy_group/${response.fantasy_group_id}`, null, false);
    }).catch((e) => {
      console.log(e);
      dispatch(setLoading(false));
      setErrorModalMessage(e);
    });
  };


  /*
  The problem with this is you need to keep adding to the props deps or the inputs might not update etc
  const activeSteps = useMemo(() => {
    const steps = [stepBasicInfo];

    // Only show Draft step if specific terminology ID is selected
    if (formData.fantasy_group_type_terminology_id === '7ca1ccce-e033-11f0-bc34-529c3ffdbb93') {
      steps.push(stepDraft);
    }

    steps.push(stepPeople);
    steps.push(stepFinancials);

    return steps;
  }, [formData.fantasy_group_type_terminology_id, formData.draft_type_terminology_id, formData.free, triggerValidation, formData, theme, draftMinutes]);
  */

  const steps = [stepBasicInfo];

  // Only show Draft step if specific terminology ID is selected
  if (formData.fantasy_group_type_terminology_id === '7ca1ccce-e033-11f0-bc34-529c3ffdbb93') {
    steps.push(stepDraft);
  }

  steps.push(stepPeople);
  steps.push(stepFinancials);



  return (
    <Profiler id="Fantasy.Contents.Create.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      <Wizard
        steps={steps}
        validationTrigger = {setTriggerValidation}
        onSave={handleSave}
        saveButtonText = 'Create League'
        showProgress
      />
      <ErrorModal
        open = {errorModalMessage !== null}
        message = {errorModalMessage || 'Error'}
        confirm={() => {
          setErrorModalMessage(null);
        }}
      />
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
