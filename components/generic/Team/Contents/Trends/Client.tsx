'use client';

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Brush,
  YAxisProps,
} from 'recharts';

import StatsGraph from './StatsGraph';
import Accuracy from './Accuracy';
import { ChartLegend, ChartTooltip, useInactiveSeries, getChartPalette } from '@/components/generic/Chart';
import { useSearchParams } from 'next/navigation';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import { Dates } from '@esmalley/ts-utils';
import { LinearProgress, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General, Team } from '@srating-io/types';

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
  { organization_id, division_id, team_id, season, data, schedule }:
  { organization_id: string, division_id: string, team_id: string, season: number, data: TrendsType, schedule: Team.getScheduleResults },
) => {
  const theme = useTheme();

  const { width } = useWindowDimensions();

  const breakPoint = 600;

  const searchParams = useSearchParams();
  const subView = searchParams?.get('subview') || 'stats';

  /**
   * Held steady across renders.
   *
   * Each `|| {}` mints a fresh object whenever its branch is missing, and StatsGraph builds its
   * chart data from these. A fresh object every render means fresh chart data every render, which
   * recharts reads as "the data changed" - so a second render straight after a chip change told it
   * the data had changed twice and it dropped the animation between the two. Only a genuinely new
   * `data` prop should count as a change.
   */
  const { games, statistic_rankings, conference_statistic_rankings, league_statistic_rankings, boxscores } = useMemo(() => ({
    games: (data && data.games) || {},
    statistic_rankings: (data && data.statistic_rankings) || {},
    conference_statistic_rankings: (data && data.conference_statistic_rankings) || {},
    league_statistic_rankings: (data && data.league_statistic_rankings) || {},
    boxscores: (data && data.boxscores) || {},
  }), [data]);

  const series = useInactiveSeries();
  const palette = getChartPalette(theme);


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
          !series.inactive.includes(key)
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

    const renderLegend = ({ payload }) => (
      <ChartLegend
        payload = {payload}
        inactive = {series.inactive}
        onToggle = {series.toggle}
        layout = {width > breakPoint ? 'vertical' : 'horizontal'}
        size = 'caption'
      />
    );

    const formatTooltipLabel = (row, label) => (
      row && row.date ? Dates.format(row.date, 'M jS \'y') : label
    );

    /**
     * The seven rating systems, each pinned to its own palette slot.
     *
     * The slot is keyed to the system, not to its position in the array, so hiding the AP poll on a
     * CBB team does not hand AP's color to the Coach Poll, and a CFB team - which only ever has
     * the first two - keeps the same two colors it would have on a CBB page.
     */
    const rankSeries = [
      { dataKey: 'rank', name: 'SRating.io (rank)', slot: 0, cbbOnly: false },
      { dataKey: 'elo_rank', name: 'SRating.io (elo)', slot: 1, cbbOnly: false },
      { dataKey: 'kenpom_rank', name: 'Kenpom', slot: 2, cbbOnly: true },
      { dataKey: 'net_rank', name: 'NET', slot: 3, cbbOnly: true },
      { dataKey: 'srs_rank', name: 'SRS', slot: 4, cbbOnly: true },
      { dataKey: 'ap_rank', name: 'AP', slot: 5, cbbOnly: true },
      { dataKey: 'coaches_rank', name: 'Coach Poll', slot: 6, cbbOnly: true },
    ];

    const getLines = () => {
      const isCBB = Organization.getCBBID() === organization_id;

      return rankSeries
        .filter((s) => !s.cbbOnly || isCBB)
        .map((s) => (
          <Line
            key = {s.dataKey}
            type = 'monotone'
            hide = {series.isHidden(s.dataKey)}
            name = {s.name}
            dataKey = {s.dataKey}
            stroke = {palette.series(s.slot)}
            strokeWidth = {2}
            dot = {false}
            connectNulls = {true}
          />
        ));
    };

    // rank 1 is the best, so the axis runs the other way round: a team climbing the rankings has
    // to draw a line going up, the way every other ratings site shows it.
    //
    // The breathing room is pixel padding rather than a widened domain. A team that sits at 1 or 2
    // all season has a range of about one rank, so padding the domain by a share of it gives back
    // almost nothing, and padding it by a flat number of ranks would run past rank 1 into a region
    // that cannot exist and label it. Pixels keep the scale honest and still lift the line off the
    // top of the plot.
    const YAxisProps: YAxisProps = { scale: 'auto', reversed: true, padding: { top: 14, bottom: 14 } };
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
              <CartesianGrid stroke = {palette.grid} />
              <XAxis dataKey = 'name' minTickGap={20} tickLine = {false} axisLine = {false}>
                <Label value = 'Date of rank' position={'bottom'} />
              </XAxis>
              <YAxis scale = 'auto' {...YAxisProps}>
                <Label offset={10} value={'Rank'} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: theme.info.main, fontSize: 18 }} />
              </YAxis>
              {
                width > breakPoint ?
                <Legend layout='vertical' align='right' verticalAlign='middle' content={renderLegend} /> :
                <Legend layout='horizontal' align='center' verticalAlign='top' content={renderLegend} />
              }
              {
                width > breakPoint ?
                  <Brush dataKey = 'name' startIndex={0} height={20} stroke = {theme.success.dark} /> :
                  ''
              }
              <Tooltip cursor = {{ stroke: theme.warning.main, strokeWidth: 2 }} content={<ChartTooltip formatLabel = {formatTooltipLabel} />} />
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
      {subView === 'accuracy' ? <Accuracy games = {schedule} team_id = {team_id} /> : ''}
      {subView === 'stats' ? <StatsGraph organization_id = {organization_id} division_id = {division_id} season = {season} statistic_rankings = {statistic_rankings} games = {games} conference_statistic_rankings = {conference_statistic_rankings} league_statistic_rankings = {league_statistic_rankings} boxscores={boxscores} /> : ''}
    </Contents>
  );
};

export { Client, ClientSkeleton };
