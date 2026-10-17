'use client';

import FantasyGroup from '@/components/helpers/FantasyGroup';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppSelector } from '@/redux/hooks';
import { Button, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { Dates } from '@esmalley/ts-utils';
import React, { useEffect, useState, useMemo } from 'react';

const DraftOrBracketCountdown = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
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

  const [now, setNow] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (targetDateString: string | undefined | null) => {
    if (!targetDateString) return 'TBD';
    const difference = Dates.parse(targetDateString, true).getTime() - now.getTime();

    if (difference <= 0) return null; // Event has passed

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Define the milestones based on group type
  const milestones = useMemo(() => {
    const list: {
      label: string;
      date: string | null;
      isComplete: boolean;
      button: boolean | React.JSX.Element;
    }[] = [];

    if (fantasyHelper.isDraft()) {
      // Step 1: The entry
      list.push({
        label: 'Create an entry',
        date: fantasy_group?.draft_start_datetime,
        isComplete: hasEntry,
        button: false,
      });
      // Step 2: The Draft
      list.push({
        label: 'Draft Starts',
        date: fantasy_group?.draft_start_datetime,
        isComplete: !!(fantasy_group?.drafted),
        button: <Button value='view-draft' title='Enter Draft Room' onClick={() => handleView('draft')} />,
      });
      // Step 3: Season Start
      list.push({
        label: 'League Begins',
        date: fantasy_group?.start_date,
        isComplete: !!(fantasy_group?.start_date && Dates.parse(fantasy_group.start_date, true) < now),
        button: false,
      });
    } else {
      // Bracket mode (Single Step)
      list.push({
        label: 'Tournament Start',
        date: fantasy_group?.start_date,
        isComplete: !!(fantasy_group?.start_date && Dates.parse(fantasy_group.start_date, true) < now),
        button: false,
      });
    }
    return list;
  }, [fantasy_group, now, fantasyHelper]);

  const handleView = (view: string) => {
    navigation.fantasyGroupView({ view });
  };

  return (
    <div>
      <Typography type='h6' style={{ marginBottom: 8 }}>
        {fantasyHelper.isDraft() ? 'Pre-Season Checklist' : 'Tournament Countdown'}
      </Typography>

      <Paper style={{ padding: 16 }}>
        {milestones.map((step, index) => {
          const countdownText = formatCountdown(step.date);
          // const isNextUp = !step.isComplete && (index === 0 || milestones[index - 1].isComplete);

          return (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: index === milestones.length - 1 ? 0 : 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography type='body1'>
                  {step.isComplete ? '✅' : '⏳'} {step.label}
                </Typography>

                {step.isComplete ? (
                  <Typography type='body2' style={{ color: theme.success.main }}>Completed</Typography>
                ) : (
                  <Typography type='body2' style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {countdownText || 'Starting...'}
                  </Typography>
                )}
              </div>

              {/* Show the Draft Button only for the Draft step if it's active or finished */}
              {step.button && (
                <div style={{ marginTop: 8 }}>
                  {step.button}
                </div>
              )}

              {index < milestones.length - 1 && <hr style={{ width: '100%', border: '0.5px solid #eee', marginTop: 12 }} />}
            </div>
          );
        })}
      </Paper>
    </div>
  );
};

export default DraftOrBracketCountdown;
