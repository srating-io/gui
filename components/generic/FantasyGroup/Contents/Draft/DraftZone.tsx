'use client';

import { useAppSelector } from '@/redux/hooks';


import SearchIcon from '@esmalley/react-material-icons/Search';
import { useCallback, useMemo, useState } from 'react';
import TableColumns from '@/components/helpers/TableColumns';
import TeamSearch from './TeamSearch';
import { decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import DraftZonePick from './DraftZonePick';
import StatViewSwitch from './StatViewSwitch';
import {
  applyCareerActiveStats,
  filterPlayerRows,
  getAvailablePlayerRows,
  getCareerActiveRowsByPlayerID,
  getDraftDisplayColumns,
  getDraftedPlayerTeamSeasonIds,
  getNextAvailablePrePickRows,
} from './shared';
import { Columns, Inputs, LinearProgress, TextInput, Typography, useTheme, VirtualTable } from '@esmalley/react-material-ui';


const DraftZone = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const user = useAppSelector((state) => state.userReducer.user);
  const draft_stat_view = useAppSelector((state) => state.fantasyGroupReducer.draft_stat_view);
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

  const isCareerActive = draft_stat_view === 'career_active';

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
  const seasonPool = useMemo(() => {
    return getAvailablePlayerRows({
      rankingData,
      fantasy_group,
      excluded_player_team_season_ids: drafted_player_team_season_ids,
    });
  }, [rankingData, fantasy_group, drafted_player_team_season_ids]);

  // Career stats laid over the season rows, never in place of them -- a career row carries no
  // player_team_season_id, which is the whole of what a pick submits.
  const pool = useMemo(() => {
    if (!isCareerActive) {
      return seasonPool;
    }

    return applyCareerActiveStats({
      rows: seasonPool,
      player_id_x_career_row: getCareerActiveRowsByPlayerID({ rankingData, fantasy_group }),
    });
  }, [seasonPool, isCareerActive, rankingData, fantasy_group]);

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

  const columns = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player', career: isCareerActive });
  const displayColumns = getDraftDisplayColumns({ organization_id: fantasy_group.organization_id, career: isCareerActive });


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
        // keyed per stat view, so a sort saved on a column only one of them has does not carry over
        sessionStorageKey = {`${fantasy_group.organization_id}.FANTASY.DRAFT.${draft_stat_view}`}
        // secondaryKey = 'secondary'
      />
    );
  }, [rows, columns, displayColumns, draft_stat_view]);




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
        <StatViewSwitch rows = {seasonPool} />
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
