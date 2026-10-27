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
import { getAvailablePlayerRows, getDraftedPlayerTeamSeasonIds, getPlayerName } from './shared';


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
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

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

  // seed the editable copy from what is stored, and reseed when the entry changes
  useEffect(() => {
    setList(saved);
  }, [saved]);

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

  const rows = getAvailablePlayerRows({
    rankingData,
    fantasy_group,
    excluded_player_team_season_ids: excluded,
    team_id: selectedTeamID,
    search: playerSearchValue,
  });

  const columns = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player' });
  const displayColumns = TableColumns.getViewableColumns({ organization_id: fantasy_group.organization_id, view: 'player', columnView: 'composite', customColumns: [], positions: [], career: false });

  const inputHandler = new Inputs();

  const isDirty = (
    list.length !== saved.length ||
    list.some((player_team_season_id, index) => player_team_season_id !== saved[index])
  );

  const nameFor = (player_team_season_id: string) => {
    return nameCache[player_team_season_id] || getPlayerName(player_team_season_id, player_team_seasons, players);
  };

  const handleAdd = (row) => {
    if (
      !row ||
      !row.player_team_season ||
      !row.player_team_season.player_team_season_id
    ) {
      return;
    }

    const { player_team_season_id } = row.player_team_season;

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
          sessionStorageKey = {`${fantasy_group.organization_id}.FANTASY.PRE_PICKS`}
        />
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Pre-draft selections</Typography>
      <Paper style = {{ padding: 16, marginBottom: 20 }}>
        <Typography type = 'body1'>
          If your clock runs out, the highest player here who is still available is taken for you. Line up more than
          your roster has spots, because other entries will take some of them before your turn comes around.
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
