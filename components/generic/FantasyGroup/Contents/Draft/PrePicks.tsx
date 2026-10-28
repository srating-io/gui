'use client';

import { useEffect, useMemo, useState } from 'react';

import ArrowUpwardIcon from '@esmalley/react-material-icons/ArrowUpward';
import ArrowDownwardIcon from '@esmalley/react-material-icons/ArrowDownward';
import CloseIcon from '@esmalley/react-material-icons/Close';
import SearchIcon from '@esmalley/react-material-icons/Search';

import {
  Button, Columns, IconButton, Inputs, LinearProgress, Paper, TextInput, Tile, Typography, useTheme, VirtualTable,
} from '@esmalley/react-material-ui';
import { toast } from '@esmalley/ts-utils';
import { Fantasy, General } from '@srating-io/types';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { useClientAPI } from '@/components/clientAPI';
import TableColumns from '@/components/helpers/TableColumns';
import { decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import OptionPicker from '@/components/generic/OptionPicker';
import TeamSearch from './TeamSearch';
import StatViewSwitch from './StatViewSwitch';
import {
  applyCareerActiveStats,
  filterPlayerRows,
  getAvailablePlayerRows,
  getCareerActiveRowsByPlayerID,
  getDraftDisplayColumns,
  getDraftedPlayerTeamSeasonIds,
  getPlayerName,
} from './shared';


type SetPrePicksResponse = {
  fantasy_entry_pre_picks?: Fantasy.FantasyEntryPrePicks;
  player_team_seasons?: General.PlayerTeamSeasons;
  players?: General.Players;
  error?: string;
};


/**
 * The players to take for an entry if its pick clock runs out.
 *
 * This is for missing the draft: the scraper takes the highest name still available and only
 * falls back to a random player once the list is exhausted. Nothing here fires while someone is
 * actually at the draft making their own picks.
 */
const PrePicks = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const player_team_seasons = useAppSelector((state) => state.fantasyGroupReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyGroupReducer.players);
  const user = useAppSelector((state) => state.userReducer.user);
  const draft_stat_view = useAppSelector((state) => state.fantasyGroupReducer.draft_stat_view);
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

  const isCareerActive = draft_stat_view === 'career_active';

  const my_fantasy_entrys = useMemo(() => {
    return Object.values(fantasy_entrys).filter((row) => user && row.user_id === user.user_id);
  }, [fantasy_entrys, user]);

  const [fantasy_entry_id, setFantasyEntryID] = useState<string | null>(null);
  const [list, setList] = useState<string[]>([]);
  const [nameCache, setNameCache] = useState<Record<string, string>>({});
  const [playerSearchValue, setPlayerSearchValue] = useState('');
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // pre-picks are per entry, and entries_per_user lets someone hold more than one
  const selected_fantasy_entry_id = fantasy_entry_id || (my_fantasy_entrys.length ? my_fantasy_entrys[0].fantasy_entry_id : null);

  const saved = useMemo(() => {
    return Object.values(fantasy_entry_pre_picks)
      .filter((row) => row.fantasy_entry_id === selected_fantasy_entry_id)
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((row) => row.player_team_season_id);
  }, [fantasy_entry_pre_picks, selected_fantasy_entry_id]);

  const saved_key = saved.join(',');

  // Reseed the editable copy only when the stored list really changed, or the entry did. The group
  // load re-dispatches this key on every refresh, so keying this on the array identity threw away
  // whatever was half arranged at the time.
  useEffect(() => {
    setList(saved);
  }, [saved_key]);

  const drafted_player_team_season_ids = getDraftedPlayerTeamSeasonIds({
    fantasy_group,
    fantasy_entrys,
    fantasy_entry_players,
    user_id: user && user.user_id,
  });

  // anything already on the list comes off the table, so it cannot be added twice
  const excluded = new Set<string>(drafted_player_team_season_ids);
  for (const player_team_season_id of list) {
    excluded.add(player_team_season_id);
  }

  // the set itself is new every render, so the pool is keyed on its contents instead
  const excluded_key = [...excluded].sort().join(',');

  // Built once per pool rather than once per keystroke: getAvailablePlayerRows deep clones the
  // whole cached payload, and filterPlayerRows below is what narrows it.
  const seasonPool = useMemo(() => {
    return getAvailablePlayerRows({
      rankingData,
      fantasy_group,
      excluded_player_team_season_ids: excluded,
    });
  }, [rankingData, fantasy_group, excluded_key]);

  // Career stats laid over the season rows, never in place of them -- a career row carries no
  // player_team_season_id, which is the whole of what a pre-pick stores.
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

  const columns = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player', career: isCareerActive });
  const displayColumns = getDraftDisplayColumns({ organization_id: fantasy_group.organization_id, career: isCareerActive });

  const inputHandler = new Inputs();

  const isDirty = (
    list.length !== saved.length ||
    list.some((player_team_season_id, index) => player_team_season_id !== saved[index])
  );

  const nameFor = (player_team_season_id: string) => {
    return nameCache[player_team_season_id] || getPlayerName(player_team_season_id, player_team_seasons, players);
  };

  const handleAdd = (row) => {
    // the id is a column on the ranking row; the nested player_team_season object is not sent
    if (
      !row ||
      !row.player_team_season_id
    ) {
      return;
    }

    const { player_team_season_id } = row;

    // the group load only carries lookups for drafted and stored players, so remember this one
    if (row.name) {
      setNameCache((current) => ({ ...current, [player_team_season_id]: row.name }));
    }

    setList((current) => (current.includes(player_team_season_id) ? current : [...current, player_team_season_id]));
  };

  const handleMove = (index: number, direction: number) => {
    const target = index + direction;

    if (target < 0 || target >= list.length) {
      return;
    }

    setList((current) => {
      const next = [...current];
      const held = next[index];
      next[index] = next[target];
      next[target] = held;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setList((current) => current.filter((value, i) => i !== index));
  };

  const handleSave = () => {
    if (sending || !selected_fantasy_entry_id) {
      return;
    }

    setSending(true);

    useClientAPI({
      class: 'fantasy_entry_pre_pick',
      function: 'setPrePicks',
      arguments: {
        fantasy_entry_id: selected_fantasy_entry_id,
        player_team_season_ids: list,
      },
    }).then((data: SetPrePicksResponse) => {
      setSending(false);

      if (!data || data.error) {
        toast.error((data && data.error) || 'Could not save your selections');
        return;
      }

      // A replace, not a merge: handleData extends and never removes, so a shortened list would
      // keep the players that were taken out of it. Any other entry rows are carried over by hand.
      const next: Fantasy.FantasyEntryPrePicks = {};

      for (const fantasy_entry_pre_pick_id in fantasy_entry_pre_picks) {
        if (fantasy_entry_pre_picks[fantasy_entry_pre_pick_id].fantasy_entry_id !== selected_fantasy_entry_id) {
          next[fantasy_entry_pre_pick_id] = fantasy_entry_pre_picks[fantasy_entry_pre_pick_id];
        }
      }

      dispatch(setDataKey({ key: 'fantasy_entry_pre_picks', value: { ...next, ...(data.fantasy_entry_pre_picks || {}) } }));

      // so the names still resolve once the group reloads
      if (data.player_team_seasons) {
        dispatch(setDataKey({ key: 'player_team_seasons', value: { ...player_team_seasons, ...data.player_team_seasons } }));
      }

      if (data.players) {
        dispatch(setDataKey({ key: 'players', value: { ...players, ...data.players } }));
      }

      toast.success('Pre-draft selections saved');
    }).catch((err) => {
      console.log(err);
      setSending(false);
      toast.error('Could not save your selections');
    });
  };

  if (!my_fantasy_entrys.length) {
    return (
      <div>
        <Typography type = 'h6'>Pre-draft selections</Typography>
        <Typography type = 'body1'>You need an entry in this league before you can line up players.</Typography>
      </div>
    );
  }

  const entryOptions = my_fantasy_entrys.map((row) => {
    return {
      value: row.fantasy_entry_id,
      label: row.name || 'My entry',
    };
  });

  const selectedEntryOption = entryOptions.find((option) => option.value === selected_fantasy_entry_id);

  const getList = () => {
    if (!list.length) {
      return <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No players lined up yet. Add them from the table below, best first.</Typography>;
    }

    return (
      <div>
        {list.map((player_team_season_id, index) => {
          return (
            <Tile
              key = {player_team_season_id}
              primary = {`${index + 1}. ${nameFor(player_team_season_id)}`}
              buttons = {[
                <IconButton
                  key = 'up'
                  value = 'up'
                  disabled = {index === 0}
                  icon = {<ArrowUpwardIcon style = {{ fontSize: 20 }} />}
                  onClick = {() => handleMove(index, -1)}
                />,
                <IconButton
                  key = 'down'
                  value = 'down'
                  disabled = {index === list.length - 1}
                  icon = {<ArrowDownwardIcon style = {{ fontSize: 20 }} />}
                  onClick = {() => handleMove(index, 1)}
                />,
                <IconButton
                  key = 'remove'
                  value = 'remove'
                  icon = {<CloseIcon style = {{ fontSize: 20, color: theme.error.main }} />}
                  onClick = {() => handleRemove(index)}
                />,
              ]}
            />
          );
        })}
      </div>
    );
  };

  const getTable = () => {
    if (loadingRankingData) {
      return (
        <div style = {{ display: 'flex', justifyContent: 'center', height: 40, alignItems: 'center' }}>
          <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
      );
    }

    return (
      <div>
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
        <VirtualTable
          rows={rows}
          columns={columns}
          displayColumns={displayColumns}
          rowKey = 'player_statistic_ranking_id'
          height={300}
          handleRowClick={handleAdd}
          decorateRows={decorateRows}
          decorateHeaderRow={decorateHeaderRow}
          defaultSortOrder = 'asc'
          defaultSortOrderBy = {'rank'}
          // keyed per stat view, so a sort saved on a column only one of them has does not carry over
          sessionStorageKey = {`${fantasy_group.organization_id}.FANTASY.PRE_PICKS.${draft_stat_view}`}
        />
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Pre-draft selections</Typography>
      <Paper style = {{ padding: 16, marginBottom: 20 }}>
        <Typography type = 'body1'>
          If you are not here for the live draft, you can select a list of players that we will auto-select for you on your turn (if they are still available).
        </Typography>
        {
          my_fantasy_entrys.length > 1 ?
            <div style = {{ marginTop: 10 }}>
              <OptionPicker
                buttonName = {selectedEntryOption ? selectedEntryOption.label : 'My entry'}
                options = {entryOptions}
                selected = {[selected_fantasy_entry_id]}
                actionHandler = {(value) => setFantasyEntryID(value as string)}
                isRadio = {true}
              />
            </div>
            : ''
        }
        <div style = {{ marginTop: 10 }}>{getList()}</div>
        <div style = {{ textAlign: 'center', marginTop: 10 }}>
          <Button
            value = 'save_pre_picks'
            title = {sending ? 'Saving' : 'Save selections'}
            onClick = {handleSave}
            disabled = {!isDirty || sending}
          />
        </div>
      </Paper>
      {getTable()}
    </div>
  );
};

export default PrePicks;
