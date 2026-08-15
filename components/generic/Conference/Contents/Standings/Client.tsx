'use client';

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';


import HelperTeam from '@/components/helpers/Team';
import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import ButtonSwitch from '@/components/generic/ButtonSwitch';
import Locked from '@/components/generic/Billing/Locked';
import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import { Objector } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Skeleton } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';



const Client = ({ organization_id, division_id, conference_id, season, subView }) => {
  const navigation = useNavigation();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const leftSwitch = 'Live';
  const rightSwitch = 'Predicted';

  let s = leftSwitch;
  if (subView === 'predicted') {
    s = rightSwitch;
  }

  const [view, setView] = useState<string>(s);
  const teams = useAppSelector((state) => state.conferenceReducer.teams);
  // const team_season_conferences = useAppSelector((state) => state.conferenceReducer.team_season_conferences);
  const og_statistic_rankings = useAppSelector((state) => state.conferenceReducer.statistic_rankings);
  const elos = useAppSelector((state) => state.conferenceReducer.elos);
  const predictionsLoading = useAppSelector((state) => state.conferenceReducer.predictionsLoading);
  const predictions = useAppSelector((state) => state.conferenceReducer.predictions);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });
  const sessionStorageKey = `${path}.CONFERENCE.STANDINGS.${view}`;
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });

  const team_id_x_statistic_ranking_id = {};

  let statistic_rankings = Objector.deepClone(og_statistic_rankings);

  if (subView === 'predicted') {
    statistic_rankings = Objector.extender(statistic_rankings, predictions as (Basketball.StatisticRankings | Football.StatisticRankings));
  }

  const hasConfGame = () => {
    for (const statistic_ranking_id in statistic_rankings) {
      const row = statistic_rankings[statistic_ranking_id];
      if ((row.confwins !== undefined && row.confwins > 0) || (row.conflosses !== undefined && row.conflosses > 0)) {
        return true;
      }
    }
    return false;
  };

  for (const statistic_ranking_id in statistic_rankings) {
    const row = statistic_rankings[statistic_ranking_id];
    team_id_x_statistic_ranking_id[row.team_id] = statistic_ranking_id;
  }

  const team_id_x_elo_id = {};
  for (const elo_id in elos) {
    const row = elos[elo_id];
    team_id_x_elo_id[row.team_id] = elo_id;
  }

  interface AdditionalFields {
    name: string;
    record: React.JSX.Element;
    conf_record: React.JSX.Element;
    elo?: number;
    hasAccess: boolean;
  }

  type StatsRows = (Basketball.StatisticRanking | Football.StatisticRanking) & AdditionalFields;

  const rows: StatsRows[] = [];

  for (const team_id in teams) {
    const team = teams[team_id];
    const stats = (statistic_rankings[team_id_x_statistic_ranking_id[team.team_id]] || {}) as StatsRows;

    const teamHelper = new HelperTeam({ team });

    let row = {} as StatsRows;

    let recordContainer: React.JSX.Element = <></>;
    let confRecordContainer: React.JSX.Element = <></>;

    let filledContainers = false;
    if (view === 'Predicted') {
      if (predictionsLoading) {
        filledContainers = true;
        recordContainer = <Skeleton style = {{ width: 40 }} key = {1} />;
        confRecordContainer = <Skeleton style = {{ width: 40 }} key = {2} />;
      } else if (!stats.hasAccess) {
        filledContainers = true;
        recordContainer = <Locked iconFontSize={'20px'} key = {1} />;
        confRecordContainer = <Locked iconFontSize={'20px'} key = {2} />;
      }
    } else {
      row = Objector.deepClone(stats) as StatsRows;

      if (team.team_id in team_id_x_elo_id) {
        row.elo = elos[team_id_x_elo_id[team.team_id]].elo;
      }
    }

    row.team_id = team_id;
    row.rank = stats.rank;
    row.wins = stats.wins || 0;
    row.losses = stats.losses || 0;
    row.confwins = stats.confwins || 0;
    row.conflosses = stats.conflosses || 0;

    if (!filledContainers) {
      recordContainer = <>{`${row.wins}-${row.losses}`}</>;
      confRecordContainer = <>{`${row.confwins}-${row.conflosses}`}</>;
    }

    row.name = teamHelper.getName();

    row.record = recordContainer;
    row.conf_record = confRecordContainer;

    rows.push(row);
  }

  const getColumns = () => {
    if (Organization.getCFBID() === organization_id) {
      return ['rank', 'name', 'record', 'conf_record', 'elo', 'passing_rating_college', 'yards_per_play', 'points'];
    }
    return ['rank', 'name', 'record', 'conf_record', 'elo', 'adjusted_efficiency_rating', 'offensive_rating', 'defensive_rating'];
  };


  const handleClick = (team_id: string) => {
    navigation.team(`/${path}/team/${team_id}?season=${season}`);
  };

  const handleView = (value: string) => {
    if (value !== view) {
      sessionStorage.removeItem(`${sessionStorageKey}.ORDER`);
      sessionStorage.removeItem(`${sessionStorageKey}.ORDERBY`);
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('subview', value.toLowerCase());
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathName}${query}`);
    }
    setView(value);
  };


  const descendingComparator = (a, b, orderBy, direction_) => {
    if ((orderBy in a) && b[orderBy] === null) {
      return 1;
    }
    if (a[orderBy] === null && (orderBy in b)) {
      return -1;
    }

    let a_value = a[orderBy];
    let a_secondary: number | null = null;
    let b_value = b[orderBy];
    let b_secondary: number | null = null;
    if (orderBy === 'record') {
      a_value = +a.wins;
      a_secondary = +a.losses;
      b_value = +b.wins;
      b_secondary = +b.losses;
    }
    if (orderBy === 'conf_record') {
      a_value = +a.confwins;
      a_secondary = +a.conflosses;
      b_value = +b.confwins;
      b_secondary = +b.conflosses;
    }

    const direction = direction_ || 'lower';

    if (
      a_secondary !== null &&
      b_secondary !== null &&
      a_value === b_value
    ) {
      // these ones are reversed because we want the lower one (losses to be ranked higher)
      if (b_secondary < a_secondary) {
        return direction === 'higher' ? -1 : 1;
      }
      if (b_secondary > a_secondary) {
        return direction === 'higher' ? 1 : -1;
      }
    }

    if (b_value < a_value) {
      return direction === 'higher' ? 1 : -1;
    }
    if (b_value > a_value) {
      return direction === 'higher' ? -1 : 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy, direction) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy, direction)
      : (a, b) => -descendingComparator(a, b, orderBy, direction);
  };

  const columns = TableColumns.getColumns({ organization_id, view: 'team' });


  let defaultSortOrderBy = 'rank';
  if (hasConfGame()) {
    defaultSortOrderBy = 'conf_record';
  }

  return (
    <div style = {{ padding: '0px 5px 20px 5px', textAlign: 'center' }}>
      <ButtonSwitch leftTitle={leftSwitch} rightTitle={rightSwitch} selected={view} handleClick={handleView} fontSize='0.7rem' style = {{ paddingBottom: '10px' }} />
      <RankTable
        rows={rows}
        columns={columns}
        displayColumns={getColumns()}
        rowKey = 'team_id'
        defaultSortOrder = 'asc'
        defaultSortOrderBy = {defaultSortOrderBy}
        defaultEmpty = '-'
        sessionStorageKey = {sessionStorageKey}
        getRankSpanMax={() => numberOfTeams }
        handleRowClick={handleClick}
        customSortComparator={getComparator}
      />
    </div>
  );
};

export default Client;
