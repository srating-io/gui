'use client';

import { useAppSelector } from '@/redux/hooks';


import SearchIcon from '@esmalley/react-material-icons/Search';
import { useCallback, useState } from 'react';
import TableColumns from '@/components/helpers/TableColumns';
import { getCachedDataKey } from '@/components/generic/Ranking/Contents/Loader';
import TeamSearch from './TeamSearch';
import { decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import DraftZonePick from './DraftZonePick';
import { Objector } from '@esmalley/ts-utils';
import { TERMINOLOGY_ID } from '@srating-io/common';
import { Columns, Inputs, LinearProgress, TextInput, Typography, useTheme, VirtualTable } from '@esmalley/react-material-ui';


const DraftZone = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const user = useAppSelector((state) => state.userReducer.user);
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

  const [playerSearchValue, setPlayerSearchValue] = useState('');
  const [selectedRow, setSelectedRow] = useState<object | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);


  const cached_key = getCachedDataKey({ organization_id: fantasy_group.organization_id, division_id: fantasy_group.division_id, season: fantasy_group.season, view: 'player', career: 0, career_active: 0 });

  // A free for all draft lets two entries hold the same player, so there only this user's own
  // roster is off the board. Everywhere else a drafted player is gone for everyone.
  const isFreeForAll = fantasy_group.draft_type_terminology_id === TERMINOLOGY_ID.DRAFT_TYPE.FREE_FOR_ALL;

  const my_fantasy_entry_ids = new Set(
    Object.values(fantasy_entrys)
      .filter((row) => row.user_id === user.user_id)
      .map((row) => row.fantasy_entry_id),
  );

  const drafted_player_team_season_ids = new Set<string>();

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    const row = fantasy_entry_players[fantasy_entry_player_id];

    if (!isFreeForAll || my_fantasy_entry_ids.has(row.fantasy_entry_id)) {
      drafted_player_team_season_ids.add(row.player_team_season_id);
    }
  }

  const data: object = (
    rankingData &&
    cached_key in rankingData &&
    rankingData[cached_key].data
  ) ? Objector.deepClone(rankingData[cached_key].data) : {};

  let rows: object[] = [];
  for (const id in data) {
    const row = data[id];

    // the cache holds whatever the ranking load returned, so do not assume every value is a row
    if (!row || typeof row !== 'object') {
      continue;
    }

    if (selectedTeamID && row.team_id !== selectedTeamID) {
      continue;
    }

    // Built purely from the ranking data before, so a player already on someone's roster stayed
    // in the list and the pick came back rejected with the clock running.
    if (
      row.player_team_season &&
      drafted_player_team_season_ids.has(row.player_team_season.player_team_season_id)
    ) {
      continue;
    }

    row.rank_delta_combo = `${row.rank_delta_one || '-'}/${row.rank_delta_seven || '-'}`;
    row.name = row.player ? (`${row.player.first_name} ${row.player.last_name}`) : null;

    row.number = (row.player_team_season && row.player_team_season.number) || (row.player && row.player.number) || null;
    row.position = (row.player_team_season && row.player_team_season.position) || (row.player && row.player.position) || null;
    row.height = (row.player_team_season && row.player_team_season.height) || (row.player && row.player.height) || null;
    row.weight = (row.player_team_season && row.player_team_season.weight) || (row.player && row.player.weight) || null;
    row.class_year = (row.player_team_season && row.player_team_season.class_year) || null;

    rows.push(row);
  }

  if (playerSearchValue) {
    // a plain substring match: this was a RegExp built from raw input, so typing "(" threw and
    // blanked the whole draft zone
    const search = playerSearchValue.toLowerCase();
    rows = rows.filter((row) => {
      return 'name' in row && typeof row.name === 'string' && row.name.toLowerCase().includes(search);
    });
  }

  const columns = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player' });
  const displayColumns = TableColumns.getViewableColumns({ organization_id: fantasy_group.organization_id, view: 'player', columnView: 'composite', customColumns: [], positions: [], career: false });


  const inputHandler = new Inputs();


  const getContents = useCallback(() => {
    return (
      <VirtualTable
        rows={rows}
        columns={columns}
        displayColumns={displayColumns}
        rowKey = 'player_statistic_ranking_id'
        height={300}
        handleRowClick={(row) => {
          setSelectedRow(row);
        }}
        decorateRows={decorateRows}
        decorateHeaderRow={decorateHeaderRow}
        defaultSortOrder = 'asc'
        defaultSortOrderBy = {'rank'}
        sessionStorageKey = {`${fantasy_group.organization_id}.FANTASY.DRAFT`}
        // secondaryKey = 'secondary'
      />
    );
  }, [rows, columns, displayColumns]);




  const getContainer = () => {
    if (loadingRankingData) {
      return (
        <div style = {{ display: 'flex', justifyContent: 'center', height: 40, alignItems: 'center' }}>
          <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
      );
    }

    return (
      <div>
        <DraftZonePick selectedRow = {selectedRow} onPick = {() => setSelectedRow(null)} />
        <Columns breakPoint={320}>
          <TeamSearch
            inputHandler={inputHandler}
            fantasy_group={fantasy_group}
            handleSelect={(val) => setSelectedTeamID(val)}
          />
          <TextInput
            inputHandler={inputHandler}
            placeholder='Player search'
            variant='filled'
            icon = {<SearchIcon style = {{ fontSize: 20 }} />}
            style = {{ borderRadius: 5 }}
            onChange = {(val) => setPlayerSearchValue(val as string)}
          />
        </Columns>
        {getContents()}
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Draft zone</Typography>
      {getContainer()}
    </div>
  );
};

export default DraftZone;
