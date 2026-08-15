'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { InitialState, setDataKey } from '@/redux/features/fantasy_group-slice';
import { updateDivisionID, updateOrganizationID } from '@/redux/features/organization-slice';
import { AppDispatch } from '@/redux/store';
import { getStore } from '@/app/StoreProvider';
import { Objector } from '@esmalley/ts-utils';
import { Basketball, General } from '@srating-io/types';

export interface FantasyGroupLoadData {
  isOwner: boolean;
  fantasy_group: General.FantasyGroup;
  fantasy_group_users: General.FantasyGroupUsers;
  fantasy_group_invites: General.FantasyGroupInvites;
  fantasy_group_comments: General.FantasyGroupComments;
  fantasy_entrys: General.FantasyEntrys;
  fantasy_draft_orders: General.FantasyDraftOrders;
  fantasy_entry_players: General.FantasyEntryPlayers;
  player_team_seasons: General.PlayerTeamSeasons;
  players: General.Players;
  fantasy_rankings: General.FantasyRankings;
  fantasy_entry_player_statistic_rankings: {
    [fantasy_entry_player_statistic_ranking_id: string]: General.FantasyEntryPlayerStatisticRanking & Basketball.PlayerStatisticRanking
  },
  error?: string;
}

export const handleData = (
  {
    dispatch,
    data,
  }:
  {
    dispatch: AppDispatch;
    data: object;
  },
) => {
  const store = getStore();

  for (const key in data) {
    if (key in store.getState().fantasyGroupReducer) {
      const current_data = store.getState().fantasyGroupReducer[key];
      dispatch(setDataKey({ key: key as keyof InitialState, value: Objector.extender({}, current_data, data[key]) }));
    }
  }
};


export const handleLoad = (
  {
    dispatch,
    data,
  }:
  {
    dispatch: AppDispatch;
    data: FantasyGroupLoadData;
  },
) => {
  dispatch(setDataKey({ key: 'isOwner', value: data.isOwner }));
  dispatch(setDataKey({ key: 'fantasy_group_users', value: data.fantasy_group_users }));
  dispatch(setDataKey({ key: 'fantasy_group_invites', value: data.fantasy_group_invites }));
  dispatch(setDataKey({ key: 'fantasy_group_comments', value: data.fantasy_group_comments }));
  dispatch(setDataKey({ key: 'fantasy_entrys', value: data.fantasy_entrys }));
  dispatch(setDataKey({ key: 'fantasy_draft_orders', value: data.fantasy_draft_orders }));
  dispatch(setDataKey({ key: 'fantasy_entry_players', value: data.fantasy_entry_players }));
  dispatch(setDataKey({ key: 'player_team_seasons', value: data.player_team_seasons }));
  dispatch(setDataKey({ key: 'players', value: data.players }));
  dispatch(setDataKey({ key: 'fantasy_rankings', value: data.fantasy_rankings }));
  dispatch(setDataKey({ key: 'fantasy_entry_player_statistic_rankings', value: data.fantasy_entry_player_statistic_rankings }));
};

const ReduxWrapper = (
  {
    children,
    fantasy_group,
  }:
  {
    children: React.ReactNode;
    fantasy_group: General.FantasyGroup;
  },
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateOrganizationID(fantasy_group.organization_id));
    dispatch(updateDivisionID(fantasy_group.division_id));
    dispatch(setDataKey({ key: 'fantasy_group', value: fantasy_group }));
  }, [dispatch, fantasy_group]);


  return (
    <div>
      {children}
    </div>
  );
};

export default ReduxWrapper;
