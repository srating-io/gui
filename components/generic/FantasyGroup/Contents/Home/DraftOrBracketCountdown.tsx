'use client';

import FantasyGroup from '@/components/helpers/FantasyGroup';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import HourglassBottomIcon from '@esmalley/react-material-icons/HourglassBottom';
import { Button, Divider, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { Dates } from '@esmalley/ts-utils';
import React, { useEffect, useState, useMemo } from 'react';
import { paperStyle } from '../../Card';

type Milestone = {
  label: string;
  date: string | null;
  /** a draft moment carries a time of day, a season or tournament start is only a date */
  hasTime: boolean;
  isComplete: boolean;
  button: React.JSX.Element | null;
};

const DraftOrBracketCountdown = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const user = useAppSelector((state) => state.userReducer.user);
  const fantasyHelper = new FantasyGroup({ fantasy_group });

  let hasEntry = false;
  for (const fantasy_entry_id in fantasy_entrys) {
    const row = fantasy_entrys[fantasy_entry_id];

    if (row.user_id === user.user_id) {
      hasEntry = true;
      break;
    }
  }

  // the api only ever returns this users own, so anything here belongs to them
  const hasPrePicks = Object.keys(fantasy_entry_pre_picks).length > 0;

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleView = (view: string, subview?: string) => {
    navigation.fantasyGroupView(subview ? { view, subview } : { view });
  };

  const formatCountdown = (targetDateString: string | undefined | null) => {
    if (!targetDateString) return 'TBD';
    const difference = Dates.parse(targetDateString, true).getTime() - now.getTime();

    // null rather than a negative clock, so the caller supplies its own in-progress copy
    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const formatMoment = (date: string, hasTime: boolean) => {
    return Dates.format(Dates.parse(date, true), hasTime ? 'M jS @ g:i a' : 'M jS, Y');
  };

  // the green check already carries the completed state, so a finished step needs no caption
  const getSecondary = (step: Milestone) => {
    if (step.isComplete) {
      return undefined;
    }

    if (!step.date) {
      return 'TBD';
    }

    return `${formatCountdown(step.date) || 'In progress'}; ${formatMoment(step.date, step.hasTime)}`;
  };

  const milestones = useMemo(() => {
    const list: Milestone[] = [];

    if (fantasyHelper.isDraft()) {
      // MyEntries owns the modal, this only flips the shared flag that opens it
      list.push({
        label: 'Create an entry',
        date: fantasy_group?.draft_start_datetime,
        hasTime: true,
        isComplete: hasEntry,
        button: (
          !hasEntry && fantasy_group.locked === 0 ?
            <Button key='create-entry' value='create-entry' title='Create an entry' ink onClick={() => dispatch(setDataKey({ key: 'joining_entry_name', value: '' }))} />
            : null
        ),
      });
      // the safety net for missing the draft live
      if (hasEntry && !fantasy_group?.drafted) {
        list.push({
          label: 'Your pre-draft list',
          date: fantasy_group?.draft_start_datetime,
          hasTime: true,
          isComplete: hasPrePicks,
          button: <Button key='pre-draft-selections' value='pre-draft-selections' title='Set pre-draft selections' ink onClick={() => handleView('draft', 'pre_picks')} />,
        });
      }
      list.push({
        label: 'Draft starts',
        date: fantasy_group?.draft_start_datetime,
        hasTime: true,
        isComplete: !!(fantasy_group?.drafted),
        button: <Button key='view-draft' value='view-draft' title='Enter draft room' ink onClick={() => handleView('draft')} />,
      });
      list.push({
        label: 'League begins',
        date: fantasy_group?.start_date,
        hasTime: false,
        isComplete: !!(fantasy_group?.start_date && Dates.parse(fantasy_group.start_date, true) < now),
        button: null,
      });
    } else {
      list.push({
        label: 'Tournament starts',
        date: fantasy_group?.start_date,
        hasTime: false,
        isComplete: !!(fantasy_group?.start_date && Dates.parse(fantasy_group.start_date, true) < now),
        button: null,
      });
    }
    return list;
  }, [fantasy_group, now, fantasyHelper, hasEntry, hasPrePicks]);

  return (
    <div>
      <Typography type='h6'>
        {fantasyHelper.isDraft() ? 'Pre-Season Checklist' : 'Tournament Countdown'}
      </Typography>

      <Paper style={paperStyle}>
        {milestones.map((step, index) => (
          <React.Fragment key={step.label}>
            <Tile
              // Tile tints its icon slot success green and the svg is fill: currentColor, so a
              // pending icon has to name its own color or it reads as done
              icon={
                step.isComplete ?
                  <CheckCircleIcon style={{ fontSize: 24, color: theme.success.main }} />
                  : <HourglassBottomIcon style={{ fontSize: 24, color: theme.info.main }} />
              }
              primary={step.label}
              secondary={getSecondary(step)}
              buttons={step.button ? [step.button] : []}
            />
            {index < milestones.length - 1 ? <Divider style={{ margin: '2px 0px' }} /> : null}
          </React.Fragment>
        ))}
      </Paper>
    </div>
  );
};

export default DraftOrBracketCountdown;
