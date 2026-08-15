'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Brush,
  YAxisProps,
} from 'recharts';

import LinearScaleIcon from '@esmalley/react-material-icons/LinearScale';


import { Payload } from 'recharts/types/component/DefaultLegendContent';
import StatsGraph from './StatsGraph';
import { useSearchParams } from 'next/navigation';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import { Dates } from '@esmalley/ts-utils';
import { LinearProgress, Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';

export interface TrendsType {
  games: General.Games;
  statistic_rankings: Basketball.StatisticRankings | Football.StatisticRankings;
  conference_statistic_rankings: Basketball.ConferenceStatisticRankings | Football.ConferenceStatisticRankings;
  league_statistic_rankings: Basketball.LeagueStatisticRankings | Football.LeagueStatisticRankings;
  boxscores: Basketball.Boxscores | Football.Boxscores;
}

const padding = 5;

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style={{ padding: `0px ${padding}px ${padding}px ${padding}px` }}>
      {children}
    </div>
  );
};

const ClientSkeleton = () => {
  const theme = useTheme();
  const heightToRemove = padding + footerNavigationHeight + headerBarHeight + 190;
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

const Client = (
  { organization_id, division_id, season, data }:
  { organization_id: string, division_id: string, season: number, data: TrendsType },
) => {
  const theme = useTheme();

  const { width } = useWindowDimensions();

  const breakPoint = 600;

  const searchParams = useSearchParams();
  const subView = searchParams?.get('subview') || 'stats';

  const games = (data && data.games) || {};
  const statistic_rankings = (data && data.statistic_rankings) || {};
  const conference_statistic_rankings = (data && data.conference_statistic_rankings) || {};
  const league_statistic_rankings = (data && data.league_statistic_rankings) || {};
  const boxscores = (data && data.boxscores) || {};

  const [inactiveSeries, setInactiveSeries] = useState<Array<string>>([]);


  const sorted_statistic_rankings = Object.values(statistic_rankings).sort((a, b) => {
    return a.date_of_rank > b.date_of_rank ? 1 : -1;
  });


  const getRankingGraph = () => {
    type Data = {
      name: string;
      rank: number;
      elo_rank: number;
      kenpom_rank?: number;
      net_rank?: number;
      srs_rank?: number;
      ap_rank?: number;
      coaches_rank?: number;
    };

    const formattedData: Data[] = [];
    let minYaxis = null;
    let maxYaxis = null;

    for (let i = 0; i < sorted_statistic_rankings.length; i++) {
      const row = sorted_statistic_rankings[i];
      const date_of_rank = Dates.format(row.date_of_rank, 'M jS');

      const d = {
        name: date_of_rank,
        rank: row.rank,
        elo_rank: row.elo_rank,
      };

      if (Organization.getCBBID() === organization_id) {
        Object.assign(d, {
          kenpom_rank: row.kenpom_rank,
          net_rank: row.net_rank,
          srs_rank: row.srs_rank,
          ap_rank: row.ap_rank,
          coaches_rank: row.coaches_rank,
        });
      }

      for (const key in d) {
        if (
          key.includes('rank') &&
          d[key] !== null &&
          !inactiveSeries.includes(key)
        ) {
          if (!minYaxis || minYaxis > d[key]) {
            minYaxis = d[key];
          }

          if (!maxYaxis || maxYaxis < d[key]) {
            maxYaxis = d[key];
          }
        }
      }

      formattedData.push(d);
    }

    const CustomLegend = ({ payload }: { payload: Payload[]}) => {
      const onClick = (dataKey) => {
        if (inactiveSeries.includes(dataKey)) {
          setInactiveSeries(inactiveSeries.filter((el) => el !== dataKey));
        } else {
          setInactiveSeries((prev) => [...prev, dataKey]);
        }
      };

      const divStyle: React.CSSProperties = {
        display: (width > breakPoint ? 'flex' : 'inline-flex'),
        alignItems: 'center',
        margin: (width > breakPoint ? '5px 0px' : '5px 5px'),
        cursor: 'pointer',
      };

      return (
        <div style = {{ marginLeft: 10, textAlign: (width > breakPoint ? 'initial' : 'center') }}>
          {
            payload.map((entry, index) => {
              const color = entry.dataKey && inactiveSeries.includes(entry.dataKey as string) ? theme.grey[500] : entry.color;
              return (
                <div key={`item-${index}`} style = {divStyle} onClick={() => { onClick(entry.dataKey); }}>
                  <div style = {{ display: 'flex' }}>
                    <LinearScaleIcon style = {{ fontSize: '14px', color }} />
                  </div>
                  <div style = {{ display: 'flex', marginLeft: 5 }}>
                    <Typography type='caption' style = {{ color }}>{entry.value}</Typography>
                  </div>
                </div>
              );
            })
          }
        </div>
      );
    };

    type TooltipProps = {
      active?: boolean;
      payload?: { value: number, name: string, stroke: string, payload: {date: string} }[];
      label?: number;
    };

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
      if (active && payload && payload.length) {
        return (
          <Paper elevation={3} style = {{ padding: '5px 10px' }}>
            <div><Typography type='subtitle2' style={{ color: theme.text.secondary }}>{payload[0].payload?.date ? Dates.format(payload[0].payload?.date, 'M jS \'y') : label}</Typography></div>
            {
              payload.map((entry, index) => {
                return (
                  <div key = {index} style = {{ display: 'flex' }}><Typography type='body1' style = {{ color: entry.stroke }} >{entry.name}:</Typography><Typography style = {{ marginLeft: 5, color: entry.stroke }} type='body1'>{entry.value}</Typography></div>
                );
              })
            }
          </Paper>
        );
      }

      return null;
    };

    const getLines = () => {
      const lines = [
        <Line type = 'monotone' hide={inactiveSeries.includes('rank')} name = 'SRating.io (rank)' dataKey = 'rank' stroke = {theme.purple[500]} strokeWidth={2} dot = {false} connectNulls = {true} />,
        <Line type = 'monotone' hide={inactiveSeries.includes('elo_rank')} name = 'SRating.io (elo)' dataKey = 'elo_rank' stroke = {theme.green[500]} strokeWidth={2} dot = {false} connectNulls = {true} />,
      ];

      if (Organization.getCBBID() === organization_id) {
        lines.push(<Line type = 'monotone' hide={inactiveSeries.includes('kenpom_rank')} name = 'Kenpom' dataKey = 'kenpom_rank' stroke = {theme.blue[500]} strokeWidth={2} dot = {false} connectNulls = {true} />);
        lines.push(<Line type = 'monotone' hide={inactiveSeries.includes('net_rank')} name = 'NET' dataKey = 'net_rank' stroke = {theme.teal[500]} strokeWidth={2} dot = {false} connectNulls = {true} />);
        lines.push(<Line type = 'monotone' hide={inactiveSeries.includes('srs_rank')} name = 'SRS' dataKey = 'srs_rank' stroke = {theme.lime[300]} strokeWidth={2} dot = {false} connectNulls = {true} />);
        lines.push(<Line type = 'monotone' hide={inactiveSeries.includes('ap_rank')} name = 'AP' dataKey = 'ap_rank' stroke = {theme.indigo[500]} strokeWidth={2} dot = {false} connectNulls = {true} />);
        lines.push(<Line type = 'monotone' hide={inactiveSeries.includes('coaches_rank')} name = 'Coach Poll' dataKey = 'coaches_rank' stroke = {theme.yellow[700]} strokeWidth={2} dot = {false} connectNulls = {true} />);
      }

      return lines;
    };

    const YAxisProps: YAxisProps = { scale: 'auto' };
    if (minYaxis !== null && maxYaxis !== null) {
      YAxisProps.domain = [minYaxis, maxYaxis];
    }

    return (
      <>
        <div style = {{ display: 'flex', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                right: 10,
              }}
            >
              <CartesianGrid strokeDasharray = '3 3' />
              <XAxis dataKey = 'name' minTickGap={20} tickLine = {false} axisLine = {false}>
                <Label value = 'Date of rank' position={'bottom'} />
              </XAxis>
              <YAxis scale = 'auto' {...YAxisProps}>
                <Label offset={10} value={'Rank'} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: theme.info.main, fontSize: 18 }} />
              </YAxis>
              {
                width > breakPoint ?
                <Legend layout='vertical' align='right' verticalAlign='middle' content={CustomLegend} /> :
                <Legend layout='horizontal' align='center' verticalAlign='top' content={CustomLegend} />
              }
              {
                width > breakPoint ?
                  <Brush dataKey = 'name' startIndex={0} height={20} stroke = {theme.success.dark} /> :
                  ''
              }
              <Tooltip cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }} content={<CustomTooltip />} />
              {getLines()}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style = {{ textAlign: 'center', marginLeft: 20 }}><Typography style = {{ color: theme.info.main }} type='subtitle2'>Date of rank</Typography></div>
      </>
    );
  };



  return (
    <Contents>
      {subView === 'ranking' ? getRankingGraph() : ''}
      {subView === 'stats' ? <StatsGraph organization_id = {organization_id} division_id = {division_id} season = {season} statistic_rankings = {statistic_rankings} games = {games} conference_statistic_rankings = {conference_statistic_rankings} league_statistic_rankings = {league_statistic_rankings} boxscores={boxscores} /> : ''}
    </Contents>
  );
};

export { Client, ClientSkeleton };
