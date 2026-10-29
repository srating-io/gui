'use client';

import { useAppSelector } from '@/redux/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import FiberManualRecordIcon from '@esmalley/react-material-icons/FiberManualRecord';
import CheckIcon from '@esmalley/react-material-icons/Check';
import { Dates } from '@esmalley/ts-utils';
import { Typography, useTheme } from '@esmalley/react-material-ui';

const Title = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);

  const targetDateString = fantasy_group.draft_start_datetime;

  // 2. State to hold the formatted time string
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<React.JSX.Element | null>(null);

  const getData = useCallback(() => {
    const data: {
      title: string;
      icon: React.JSX.Element | null;
    } = {
      title: 'TBD',
      icon: null,
    };

    // A finished draft is over whether or not a start date was ever recorded, so this has to come
    // before the date check - otherwise it reads "TBD" after the last pick.
    if (fantasy_group.drafted) {
      data.title = 'Draft is over!';
      data.icon = <CheckIcon style = {{ color: theme.success.main, fontSize: 20 }} />;
      return data;
    }

    if (!targetDateString) {
      return data;
    }

    const difference = Dates.parse(targetDateString, true).getTime() - new Date().getTime();

    if (difference <= 0) {
      data.title = 'Draft in-progress!';
      data.icon = <FiberManualRecordIcon style = {{ color: theme.error.main, fontSize: 20 }} />;
      return data;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    data.title = `Draft begins: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    return data;
  }, [targetDateString, fantasy_group.drafted]);

  // 3. Effect to update the countdown every second
  useEffect(() => {
    let data = getData();

    // Initial call to prevent 1s delay on mount
    setTitle(data.title);
    setIcon(data.icon);

    let timer: null | NodeJS.Timeout = null;

    if (!fantasy_group.drafted) {
      timer = setInterval(() => {
        data = getData();
        setTitle(data.title);
        setIcon(data.icon);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [getData]);

  return (
    <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
      {icon ? <span style = {{ display: 'flex', marginRight: 6 }}>{icon}</span> : ''}
      <Typography type='subtitle1'>{title}</Typography>
    </div>
  );
};

export default Title;
