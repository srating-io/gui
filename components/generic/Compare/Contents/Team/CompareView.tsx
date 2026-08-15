'use client';

import React from 'react';
import CompareStatistic, { CompareStatisticRow } from '@/components/generic/CompareStatistic';
import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import { getSections } from '@/components/generic/Game/Contents/Matchup/Client';
import TableColumns from '@/components/helpers/TableColumns';
import { Objector } from '@esmalley/ts-utils';
import { Typography } from '@esmalley/react-material-ui';


// todo for the conf recond compare, show their rank in the conference, not by total wins

type predictionsType = {
  away?: number;
  home?: number;
  home_score?: number;
  away_score?: number;
}

const CompareView = ({ statistic_rankings }) => {
  const predictions: predictionsType = useAppSelector((state) => state.compareReducer.predictions);
  const predictionsLoading = useAppSelector((state) => state.compareReducer.predictionsLoading);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const home_team_id = useAppSelector((state) => state.compareReducer.home_team_id);
  const away_team_id = useAppSelector((state) => state.compareReducer.away_team_id);
  const season = useAppSelector((state) => state.compareReducer.season);


  let awayStats = {};
  let homeStats = {};

  for (const statistic_ranking_id in statistic_rankings) {
    const row = statistic_rankings[statistic_ranking_id];
    if (row.team_id === away_team_id) {
      awayStats = row;
    }
    if (row.team_id === home_team_id) {
      homeStats = row;
    }
  }


  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });
  const locked = (!('away' in predictions) && !('home' in predictions));

  const predictionRows: CompareStatisticRow[] = [
    {
      id: 'win_percentage',
      getLabel: () => 'Win %',
      getTooltip: () => 'Predicted win %',
      leftRow: { win_percentage: predictions.away },
      rightRow: { win_percentage: predictions.home },
      numeric: false,
      organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
      getViews: () => ['matchup'],
      graphable: false,
      showDifference: false,
      sort: 'higher',
      locked,
      loading: predictionsLoading,
      getDisplayValue: (row) => {
        return `${(('win_percentage' in row ? Number(row.win_percentage) : 0) * 100).toFixed(0)}%`;
      },
      getValue: (row) => {
        return 'win_percentage' in row ? row.win_percentage : null;
      },
    },
    {
      id: 'predicted_score',
      getLabel: () => 'Predicted score',
      getTooltip: () => 'Predicted score',
      leftRow: { score: predictions.away_score },
      rightRow: { score: predictions.home_score },
      numeric: false,
      organization_ids: [Organization.getCBBID(), Organization.getCFBID()],
      getViews: () => ['matchup'],
      graphable: false,
      sort: 'higher',
      locked,
      getDisplayValue: (row) => {
        return !locked && 'score' in row ? row.score : 0;
      },
      getValue: (row) => {
        return !locked && 'score' in row ? row.score : 0;
      },
    },
  ];

  const sections = getSections();

  const columns = Objector.deepClone(TableColumns.getColumns({ organization_id, view: 'matchup' }));

  return (
    <div style = {{ padding: '0px 5px 20px 5px' }}>
      <CompareStatistic max = {numberOfTeams} paper = {false} rows = {predictionRows} />

      {sections.map((section) => {
        const rows: CompareStatisticRow[] = [];
        section.keys.forEach((key) => {
          const row = columns[key] as CompareStatisticRow;

          row.leftRow = awayStats;
          row.rightRow = homeStats;

          rows.push(row);
        });
        return (
          <React.Fragment key = {section.name}>
            <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'body1'>{section.name}</Typography>
            <CompareStatistic max = {numberOfTeams} paper = {true} rows = {rows} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CompareView;
