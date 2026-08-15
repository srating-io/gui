'use client';

import React, { useState, useEffect } from 'react';

import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import SyncAltIcon from '@esmalley/react-material-icons/SyncAlt';
import ClassSpan from '@/components/generic/ClassSpan';
import { Dates, Objector, Style, Textor } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Chip, Tooltip, Typography, useTheme } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';


const Roster = ({ organization_id, rosterStats, player_team_seasons, season }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [view, setView] = useState<string>('composite');

  const { players, player_statistic_rankings }: { players: General.Players; player_statistic_rankings: Basketball.PlayerStatisticRankings | Football.PlayerStatisticRankings} = rosterStats;
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });
  const team_season_conference = useAppSelector((state) => state.teamReducer.team_season_conference);

  const lastSeason = +('season' in team_season_conference ? team_season_conference.season : 0) - 1;

  const player_id_x_is_transfer = {};
  const player_id_x_current_player_team_season = {};
  const player_id_x_traded_player_team_season = {};

  for (const player_team_season_id in player_team_seasons) {
    const row = player_team_seasons[player_team_season_id];

    if (+row.season === +season) {
      if (row.end_date) {
        player_id_x_traded_player_team_season[row.player_id] = row;
      } else {
        player_id_x_current_player_team_season[row.player_id] = row;
      }
    }

    if (+row.season !== lastSeason) {
      continue;
    }

    if (Organization.getNBAID() === organization_id) {
      continue;
    }

    player_id_x_is_transfer[row.player_id] = (row.team_id !== team_season_conference.team_id);
  }

  useEffect(() => {
    const sessionData = sessionStorage.getItem(`${path}.TEAM.ROSTER.VIEW`);
    if (sessionData) {
      setView(sessionData);
    } else {
      setView('composite');
    }
  }, []);


  const getColumns = (position: string, traded = false) => {
    let columnView = view;

    if (position !== 'all') {
      columnView = position;
    }

    const cols = TableColumns.getViewableColumns({ organization_id, view: 'roster', columnView, customColumns: [], positions: [position], career: false });
    const index = cols.indexOf('last_game_on_team_date');

    if (
      !traded &&
      index > -1
    ) {
      cols.splice(index, 1);
    }
    return cols;
  };

  const columns = Objector.extender(TableColumns.getColumns({ organization_id, view: 'player' }), TableColumns.getColumns({ organization_id, view: 'roster' }));

  const transferStyle = {
    color: theme.secondary.dark,
    fontSize: 16,
    display: 'flex',
  };

  const transferIcon = <Tooltip text = {'Player is a transfer'}><SyncAltIcon style={transferStyle} /></Tooltip>;

  type groupedPosition = {
    [key:string]: (Basketball.PlayerStatisticRanking | Football.PlayerStatisticRanking | General.Player)[];
  }
  type TypedRow = (Basketball.PlayerStatisticRanking | Football.PlayerStatisticRanking) & { name?: string | React.JSX.Element; is_transfer?: string | React.JSX.Element; };
  type TypedPlayer = General.Player & { name?: string | React.JSX.Element; is_transfer?: string | React.JSX.Element; last_game_on_team_date?: string }

  const grouped_position_x_playerRows: groupedPosition = {};

  const traded_playerRows: (TypedRow | TypedPlayer)[] = [];

  for (const player_statistic_ranking_id in player_statistic_rankings) {
    const row: TypedRow = player_statistic_rankings[player_statistic_ranking_id];

    if (!(row.player_id in players)) {
      continue;
    }

    const player = players[row.player_id];

    if (!player) {
      continue;
    }

    const position_x_grouped_position = {
      QB: 'passing',
      FB: 'rushing',
      RB: 'rushing',
      TE: 'receiving',
      WR: 'receiving',
    };

    let grouped_position: string = 'all';

    if (
      player.position &&
      player.position in position_x_grouped_position
    ) {
      grouped_position = position_x_grouped_position[player.position];
    }

    if (
      !(grouped_position in grouped_position_x_playerRows)
    ) {
      grouped_position_x_playerRows[grouped_position] = [];
    }

    const isTransfer = (player_id_x_is_transfer[row.player_id]);

    row.name = `${player.first_name.charAt(0)}. ${player.last_name}`;
    row.is_transfer = isTransfer ? transferIcon : '-';

    // row.number = (row.player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[row.player_id].number) || null;
    // row.position = (row.player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[row.player_id].position) || null;
    // row.height = (row.player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[row.player_id].height) || null;
    // row.weight = (row.player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[row.player_id].weight) || null;
    const class_year = (row.player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[row.player_id].class_year) || null;


    if (class_year) {
      row.name = <><ClassSpan class_year={class_year} />{row.name}</>;
    }

    if (row.player_id in player_id_x_traded_player_team_season) {
      traded_playerRows.push(row);
    } else {
      grouped_position_x_playerRows[grouped_position].push(row);
    }
  }

  if (!Object.keys(grouped_position_x_playerRows).length && players && Object.keys(players).length) {
    grouped_position_x_playerRows.all = [];
    for (const player_id in players) {
      const isTransfer = (player_id_x_is_transfer[player_id]);
      const player: TypedPlayer = players[player_id];
      player.name = `${player.first_name.charAt(0)}. ${player.last_name}`;
      player.is_transfer = isTransfer ? transferIcon : '-';

      player.number = (player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[player_id].number) || null;
      player.position = (player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[player_id].position) || null;
      player.height = (player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[player_id].height) || null;
      player.weight = (player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[player_id].weight) || null;
      player.class_year = (player_id in player_id_x_current_player_team_season && player_id_x_current_player_team_season[player_id].class_year) || null;

      if (player_id in player_id_x_traded_player_team_season && player_id_x_traded_player_team_season[player_id].end_date) {
        player.last_game_on_team_date = Dates.format(player_id_x_traded_player_team_season[player_id].end_date, 'M jS y');
      }

      if (player.class_year) {
        player.name = <><ClassSpan class_year={player.class_year} />{player.name}</>;
      }

      if (player_id in player_id_x_traded_player_team_season) {
        traded_playerRows.push(player);
      } else {
        grouped_position_x_playerRows.all.push(player);
      }
    }
  }


  const handleClick = (player_id: string) => {
    navigation.player(`/${path}/player/${player_id}`);
  };

  const handleView = (value: string) => {
    sessionStorage.setItem(`${path}.TEAM.ROSTER.VIEW`, value);
    setView(value);
  };


  const getPlayerTableContents = (): React.JSX.Element => {
    type StatDisplay = {
      label: string;
      value: string;
    }
    let statDisplay: StatDisplay[] = [];

    if (organization_id === Organization.getCBBID()) {
      statDisplay = [
        {
          label: 'Composite',
          value: 'composite',
        },
        {
          label: 'Offense',
          value: 'offense',
        },
        {
          label: 'Defense',
          value: 'defense',
        },
      ];
    }

    const chipContainerStyle = { display: 'flex', justifyContent: 'center' };

    const statDisplayChips: React.JSX.Element[] = [];

    for (let i = 0; i < statDisplay.length; i++) {
      statDisplayChips.push(
        <Chip
          key = {statDisplay[i].value}
          style = {{ margin: '5px 5px 10px 5px' }}
          filled = {view === statDisplay[i].value}
          value = {statDisplay[i].value}
          onClick = {() => { handleView(statDisplay[i].value); }}
          title = {statDisplay[i].label}
        />,
      );
    }


    if (
      organization_id === Organization.getCBBID() ||
      organization_id === Organization.getNBAID()
    ) {
      return (
        <>
          <div className={Style.getStyleClassName(chipContainerStyle)}>{statDisplayChips}</div>
          {getPlayerTableContent('all', grouped_position_x_playerRows.all, getColumns('all'))}
          {traded_playerRows.length ? getPlayerTableContent('traded players (stats when on team)', traded_playerRows, getColumns('all', true)) : ''}
        </>
      );
    }

    if (organization_id === Organization.getCFBID()) {
      return (
        <>
        <div className={Style.getStyleClassName(chipContainerStyle)}>{statDisplayChips}</div>
        {getPlayerTableContent('passing', grouped_position_x_playerRows.passing, getColumns('passing'))}
        {getPlayerTableContent('rushing', grouped_position_x_playerRows.rushing, getColumns('rushing'))}
        {getPlayerTableContent('receiving', grouped_position_x_playerRows.receiving, getColumns('receiving'))}
        </>
      );
    }

    return <></>;
  };

  const getPlayerTableContent = (position: string, playerRows, playerColumns): React.JSX.Element => {
    const defaultPlayerTableSort = 'rank';

    let title = <></>;

    if (position !== 'all') {
      title = <Typography type = 'body1'>{Textor.toSentenceCase(position)}</Typography>;
    }

    let contents = <></>;

    if (!playerRows || !playerRows.length) {
      contents = <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>No player data yet :(</Typography>;
    } else {
      contents =
        <RankTable
          rows={playerRows}
          columns={columns}
          displayColumns={playerColumns}
          rowKey = 'player_id'
          defaultSortOrder = 'asc'
          defaultSortOrderBy = {defaultPlayerTableSort}
          sessionStorageKey = {`${path}.Team.ROSTER.${position}`}
          secondaryKey = 'secondary'
          useAlternateLabel = {true}
          handleRowClick={handleClick}
        />;
    }

    return (
      <>
        {title}
        {contents}
      </>
    );
  };

  return (
    <div style = {{ padding: '10px 5px 0px 5px' }}>
      {getPlayerTableContents()}
    </div>
  );
};


export default Roster;
