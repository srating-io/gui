'use client';

import { useAppSelector } from '@/redux/hooks';


import SearchIcon from '@esmalley/react-material-icons/Search';
import { useCallback, useMemo, useState } from 'react';
import TableColumns from '@/components/helpers/TableColumns';
import TeamSearch from './TeamSearch';
import { decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import DraftZonePick from './DraftZonePick';
import { filterPlayerRows, getAvailablePlayerRows, getDraftedPlayerTeamSeasonIds, getNextAvailablePrePickRows } from './shared';
import { Columns, Inputs, LinearProgress, TextInput, Typography, useTheme, VirtualTable } from '@esmalley/react-material-ui';


const DraftZone = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const user = useAppSelector((state) => state.userReducer.user);
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

  const [playerSearchValue, setPlayerSearchValue] = useState('');
  const [selectedRow, setSelectedRow] = useState<object | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);


  const drafted_player_team_season_ids = useMemo(() => {
    return getDraftedPlayerTeamSeasonIds({
      fantasy_group,
      fantasy_entrys,
      fantasy_entry_players,
      user_id: user && user.user_id,
    });
  }, [fantasy_group, fantasy_entrys, fantasy_entry_players, user]);

  // the whole available pool, unfiltered: the prefill has to see every player the list can name,
  // not just the ones left after a team or a search narrows the table
  const pool = useMemo(() => {
    return getAvailablePlayerRows({
      rankingData,
      fantasy_group,
      excluded_player_team_season_ids: drafted_player_team_season_ids,
    });
  }, [rankingData, fantasy_group, drafted_player_team_season_ids]);

  const rows = useMemo(() => {
    return filterPlayerRows({
      rows: pool,
      team_id: selectedTeamID,
      search: playerSearchValue,
    });
  }, [pool, selectedTeamID, playerSearchValue]);

  const fantasy_entry_id_x_pre_pick_row = useMemo(() => {
    return getNextAvailablePrePickRows({
      rows: pool,
      fantasy_entry_pre_picks,
      fantasy_entrys,
      user_id: user && user.user_id,
    });
  }, [pool, fantasy_entry_pre_picks, fantasy_entrys, user]);

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
        <DraftZonePick
          selectedRow = {selectedRow}
          onPick = {() => setSelectedRow(null)}
          fantasy_entry_id_x_pre_pick_row = {fantasy_entry_id_x_pre_pick_row}
          onSelect = {(row) => setSelectedRow(row)}
        />
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
