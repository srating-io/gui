'use client';

import { useAppSelector } from '@/redux/hooks';
import { useMemo, useState } from 'react';
import DraftZonePick from './DraftZonePick';
import PlayerPoolTable from './PlayerPoolTable';
import {
  applyCareerActiveStats,
  getAvailablePlayerRows,
  getCareerActiveRowsByPlayerID,
  getDraftedPlayerTeamSeasonIds,
  getNextAvailablePrePickRows,
  isPoolLoading,
} from './shared';
import { LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';


const DraftZone = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const user = useAppSelector((state) => state.userReducer.user);
  const draft_stat_view = useAppSelector((state) => state.fantasyGroupReducer.draft_stat_view);
  const loadErrorKeys = useAppSelector((state) => state.rankingReducer.loadErrorKeys);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);

  const isCareerActive = draft_stat_view === 'career_active';
  const loadingPool = isPoolLoading({ rankingData, loadErrorKeys, fantasy_group, draft_stat_view });

  const [selectedRow, setSelectedRow] = useState<object | null>(null);


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
      conferences,
    });
  }, [rankingData, fantasy_group, drafted_player_team_season_ids, conferences]);

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

  const fantasy_entry_id_x_pre_pick_row = useMemo(() => {
    return getNextAvailablePrePickRows({
      rows: pool,
      fantasy_entry_pre_picks,
      fantasy_entrys,
      user_id: user && user.user_id,
    });
  }, [pool, fantasy_entry_pre_picks, fantasy_entrys, user]);

  const getContainer = () => {
    if (loadingPool) {
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
        <PlayerPoolTable
          seasonPool = {seasonPool}
          pool = {pool}
          handleRowClick = {(row) => setSelectedRow(row)}
          sessionStoragePrefix = 'FANTASY.DRAFT'
        />
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
