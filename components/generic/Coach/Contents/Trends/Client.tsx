'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, ReferenceLine,
} from 'recharts';


import { getNavHeaderHeight } from '@/components/generic/Coach/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { Dates } from '@esmalley/ts-utils';
import { LinearProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


// todo compare to 2 or more coach elos on the same graph? might be cool to see them with the time comparison. ex: and old coach vs relativiely new
// add these graphs to the compare tool as well!


/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style={{ padding: '0px 10px' }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;
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

const Client = ({ coach_elos, games }: {coach_elos: General.CoachElos, games: General.Games}) => {
  const theme = useTheme();

  const sorted_elo = Object.values(coach_elos).sort((a, b) => {
    if (!(a.game_id)) {
      return -1;
    }

    if (!(b.game_id)) {
      return 1;
    }

    if (!(a.game_id in games)) {
      return 1;
    }

    if (!(b.game_id in games)) {
      return -1;
    }

    return games[a.game_id].start_date < games[b.game_id].start_date ? -1 : 1;
  });


  type FormattedData = {
    name: number;
    value: number;
    date?: string | null;
  }

  const formattedData: FormattedData[] = [];

  let minYaxis = 1100;
  let maxYaxis = 2000;

  let highestElo = 0;
  let highestEloDate: string = '';

  for (let i = 0; i < sorted_elo.length; i++) {
    const date = sorted_elo[i].game_id && sorted_elo[i].game_id in games ? games[sorted_elo[i].game_id].start_date : null;
    if (sorted_elo[i].elo < minYaxis) {
      minYaxis = sorted_elo[i].elo;
    }

    if (sorted_elo[i].elo > maxYaxis) {
      maxYaxis = sorted_elo[i].elo;
    }

    if (sorted_elo[i].elo > highestElo) {
      highestElo = sorted_elo[i].elo;

      if (date) {
        highestEloDate = date;
      }
    }

    formattedData.push({
      name: sorted_elo[i].season,
      value: sorted_elo[i].elo,
      date,
    });
  }

  minYaxis -= 100;
  maxYaxis += 100;

  type TooltipProps = {
    active?: boolean;
    payload?: { value: number, name: string, payload: {date: string} }[];
    label?: number;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} style = {{ padding: '5px 10px' }}>
          <div><Typography type='subtitle2' style = {{ color: theme.text.secondary }}>{payload[0].payload?.date ? Dates.format(payload[0].payload?.date, 'M jS \'y') : label}</Typography></div>
          <div style = {{ display: 'inline-flex' }}>
            <Typography type='body1' style = {{ color: theme.text.secondary }}>Rating:</Typography>
            <Typography style = {{ marginLeft: 5, color: theme.info.main }} type='body1'>{payload[0].value}</Typography>
          </div>
        </Paper>
      );
    }

    return null;
  };

  const formatXAxis = (value) => {
    return Dates.format(value, 'Y');
  };

  const referenceLineStroke = theme.success[(theme.mode === 'dark' ? 'light' : 'dark')];


  return (
    <Contents>
      <div style = {{ textAlign: 'center' }}><Typography type='subtitle2' style = {{ color: theme.info.main }}>SR (elo)</Typography></div>
      <div style = {{ display: 'flex', height: 300 }}>
        <div style = {{ alignContent: 'center', transform: 'rotate(-90deg)', maxWidth: '20px', width: '20px' }}><Typography type ='subtitle2' style = {{ color: theme.info.main }}>Rating</Typography></div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{
              right: 10,
            }}
          >
            <CartesianGrid strokeDasharray = '3 3' />
            <XAxis dataKey = 'date' minTickGap={20} tickLine = {false} axisLine = {false} tickFormatter={formatXAxis} />
            <YAxis dataKey = 'value' scale = 'linear' domain = {[minYaxis, maxYaxis]} />
            <Tooltip cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }} content={<CustomTooltip />} />
            <ReferenceLine y = {highestElo} stroke = {referenceLineStroke}>
              <Label value={highestElo} style={{ textAnchor: 'middle', fill: referenceLineStroke, fontSize: 18 }} dy={-10} />
            </ReferenceLine>
            <ReferenceLine x = {highestEloDate} stroke = {referenceLineStroke}>
              <Label value = {Dates.format(highestEloDate, 'M jS \'y')} angle={-90} dx={-15} style={{ textAnchor: 'middle', fill: referenceLineStroke, fontSize: 18 }} />
            </ReferenceLine>
            {/* {formattedData.length > 1 ? <ReferenceLine label="Segment" stroke="green" strokeDasharray="3 3" segment={[{x: formattedData[0].name, y: formattedData[0].value}, {x: formattedData[formattedData.length - 1].name, y: formattedData[formattedData.length - 1].value}]} /> : ''} */}
            <Line type = 'monotone' dataKey = 'value' stroke = {theme.info.main} strokeWidth={2} dot = {false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style = {{ textAlign: 'center', marginLeft: 20 }}><Typography type='subtitle2' style = {{ color: theme.info.main }}>Year</Typography></div>
    </Contents>
  );
};

export { Client, ClientSkeleton };
