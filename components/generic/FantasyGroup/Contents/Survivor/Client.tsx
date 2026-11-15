'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Columns, LinearProgress, Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { Dates } from '@esmalley/ts-utils';
import { Fantasy, General } from '@srating-io/types';
import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { getOwnEntries } from '@/components/helpers/FantasyGroup';
import { findSlateByDate, getEligibleDates, getSlateEasternRange, getSlateLabel, hasSurvivorDateBar } from '@/components/helpers/FantasySlate';
import DateBar, { getDateBarHeight, getMarginTop } from '@/components/generic/DateBar';
import { getNavHeaderHeight } from '@/components/generic/FantasyGroup/NavBar';
import Slate from './Slate';
import TeamsRemaining from './TeamsRemaining';

/**
 * The survivor room: the slate that is open, what this entry has already spent, and the choice.
 *
 * Two loads rather than one. The strip of slates changes once a day at most, while the open slate
 * moves with the schedule and has to come back fresh after a selection -- holding both in one call
 * meant refetching the whole run to show one changed row.
 *
 * The strip lives in the store rather than in here, because that is where the group's broadcasts
 * land: generate, lockDue and resolveDue all push `fantasy_slates`, so a lock or an elimination
 * arrives on its own instead of waiting for a reload.
 */

type SlateData = {
  fantasy_slate: Fantasy.FantasySlate;
  games: General.Games;
  teams: General.Teams;
  total_teams: number;
  game_id_x_game_outlook: {[game_id: string]: General.GameOutlook};
  fantasy_selections: Fantasy.FantasySelections;
  fantasy_entry_id_x_used_team_ids: {[fantasy_entry_id: string]: string[]};
  error?: string;
};

const ClientSkeleton = () => {
  const theme = useTheme();

  return (
    <div style = {{ padding: 20 }}>
      <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%', margin: 'auto' }} />
    </div>
  );
};

/**
 * `seasonDates` is every date the sport plays on this season, read on the server because the api
 * blacklists that call for a client. The league's own run is not stored anywhere -- only two slates
 * exist at a time -- so the stretch of days it will cover is derived from it here.
 */
const Client = (
  { fantasy_group_id, seasonDates = [] }:
  { fantasy_group_id: string; seasonDates?: string[] },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_slates = useAppSelector((state) => state.fantasyGroupReducer.fantasy_slates);
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const user_id = useAppSelector((state) => state.userReducer.user.user_id);
  const session_id = useAppSelector((state) => state.userReducer.session_id);

  const [selectedSlateID, setSelectedSlateID] = useState<string | null>(null);
  const [slateData, setSlateData] = useState<SlateData | null>(null);
  const [loadedSlates, setLoadedSlates] = useState(false);
  const [loadingSlate, setLoadingSlate] = useState(false);

  // Which of this user's entries the room is acting for. An id rather than an index, so the
  // selection survives the list reordering under a broadcast.
  const [selectedEntryID, setSelectedEntryID] = useState<string | null>(null);

  const requesting = useRef(false);
  // the slate load in flight, so a run of clicks along the strip cannot paint an earlier reply
  const loadingSlateID = useRef<string | null>(null);

  // Holding several entries is ordinary in a survivor pool, so the room offers all of them rather
  // than silently acting for whichever one came back first.
  const own_fantasy_entrys = getOwnEntries(fantasy_entrys, user_id);
  const fantasy_entry = own_fantasy_entrys.find((row) => row.fantasy_entry_id === selectedEntryID)
    || (own_fantasy_entrys.length ? own_fantasy_entrys[0] : null);

  const loadSlates = useCallback(() => {
    if (requesting.current) {
      return;
    }
    requesting.current = true;

    useClientAPI({
      class: 'fantasy_slate',
      function: 'loadGroupSlates',
      arguments: { fantasy_group_id },
    }).then((data) => {
      requesting.current = false;
      setLoadedSlates(true);

      if (!data || data.error || !data.fantasy_slates) {
        return;
      }

      dispatch(setDataKey({ key: 'fantasy_slates', value: data.fantasy_slates }));
    }).catch(() => {
      requesting.current = false;
      setLoadedSlates(true);
    });
  }, [fantasy_group_id, session_id, dispatch]);

  const loadSlate = useCallback((fantasy_slate_id: string) => {
    setLoadingSlate(true);
    loadingSlateID.current = fantasy_slate_id;

    useClientAPI({
      class: 'fantasy_slate',
      function: 'load',
      arguments: { fantasy_slate_id },
    }).then((data: SlateData) => {
      // a reply for a slate the strip has since moved off must not be painted
      if (loadingSlateID.current !== fantasy_slate_id) {
        return;
      }

      loadingSlateID.current = null;
      setLoadingSlate(false);

      if (!data || data.error) {
        setSlateData(null);
        return;
      }

      setSlateData(data);
    }).catch(() => {
      if (loadingSlateID.current !== fantasy_slate_id) {
        return;
      }

      loadingSlateID.current = null;
      setLoadingSlate(false);
      setSlateData(null);
    });
  }, [session_id]);

  useEffect(() => {
    loadSlates();
  }, [loadSlates]);

  const ordered = Object.values(fantasy_slates || {}).sort((a, b) => +a.ordinal - +b.ordinal);

  // Which days already have a round behind them. Built once per slate rather than range tested per
  // day, because the eastern date costs an Intl read and a season is ~160 of each.
  const coveredDates = useMemo(() => {
    const covered: {[date: string]: boolean} = {};

    for (const row of Object.values(fantasy_slates || {})) {
      const range = getSlateEasternRange(row);

      if (range) {
        covered[range.first] = true;
      }
    }

    return covered;
  }, [fantasy_slates]);

  const eligibleDates = useMemo(() => {
    return getEligibleDates(fantasy_group, seasonDates);
  }, [fantasy_group, seasonDates]);

  const upcomingDates = useMemo(() => {
    return eligibleDates.filter((row) => !coveredDates[row]);
  }, [eligibleDates, coveredDates]);

  const selectedRange = getSlateEasternRange(ordered.find((row) => row.fantasy_slate_id === selectedSlateID));
  const selectedDate = selectedRange ? selectedRange.first : null;

  // ContentsWrapper holds this view back until the slice holds this league, so the group is ours
  const showDateBar = hasSurvivorDateBar(fantasy_group, seasonDates);

  // Hangs under the group nav bar, which sits at the header margin. getMarginTop reads the window,
  // so it is a hook -- it cannot be called from the branch below.
  const dateBarTop = getMarginTop() + getNavHeaderHeight();

  // Open on the one still accepting a selection, since that is the only one anyone can act on.
  // Falls back to the most recent, so a finished league still shows its last result. Only ever
  // chooses when nothing is chosen -- a broadcast must not move the strip under someone.
  useEffect(() => {
    if (selectedSlateID || !ordered.length) {
      return;
    }

    const open = ordered.find((row) => +row.locked === 0);

    setSelectedSlateID((open || ordered[ordered.length - 1]).fantasy_slate_id);
  }, [ordered, selectedSlateID]);

  useEffect(() => {
    if (selectedSlateID) {
      loadSlate(selectedSlateID);
    }
  }, [selectedSlateID, loadSlate]);

  if (!loadedSlates) {
    return <ClientSkeleton />;
  }

  if (!ordered.length) {
    return (
      <div style = {{ padding: 5, maxWidth: 1200, margin: 'auto' }}>
        <Paper style = {{ padding: 16 }}>
          <Typography type = 'body1'>Nothing to choose yet.</Typography>
          <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
            The first round appears once the schedule for it is known.
          </Typography>
        </Paper>
      </div>
    );
  }

  const fantasy_slate = slateData ? slateData.fantasy_slate : null;
  const used_team_ids = (fantasy_entry && slateData && slateData.fantasy_entry_id_x_used_team_ids[fantasy_entry.fantasy_entry_id]) || [];

  // this entry's selection on the open slate, which is also what the picker renders as chosen
  const own_selection = fantasy_entry && slateData
    ? Object.values(slateData.fantasy_selections).find((row) => row.fantasy_entry_id === fantasy_entry.fantasy_entry_id)
    : null;

  const locked = fantasy_slate ? +fantasy_slate.locked === 1 : true;

  const alive = Object.values(fantasy_entrys || {}).filter((row) => +row.eliminated === 0).length;
  const total = Object.keys(fantasy_entrys || {}).length;

  return (
    // the date bar is fixed, so the room clears it itself -- the wrapper only clears the nav bar
    <div style = {{ padding: 5, paddingTop: showDateBar ? getDateBarHeight() + 5 : 5, maxWidth: 1200, margin: 'auto' }}>
      {
        own_fantasy_entrys.length > 1 ? (
          <div style = {{ marginBottom: 12 }}>
            <Typography type = 'caption' style = {{ color: theme.text.secondary }}>Choosing for</Typography>
            <div style = {{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {own_fantasy_entrys.map((row) => (
                <Button
                  key = {row.fantasy_entry_id}
                  value = {row.fantasy_entry_id}
                  title = {`${row.name}${+row.eliminated === 1 ? ' (out)' : ''}`}
                  ink = {fantasy_entry ? row.fantasy_entry_id !== fantasy_entry.fantasy_entry_id : true}
                  onClick = {() => setSelectedEntryID(row.fantasy_entry_id)}
                />
              ))}
            </div>
          </div>
        ) : ''
      }

      {
        showDateBar ? (
          <DateBar
            dates = {eligibleDates}
            date = {selectedDate}
            disabledDates = {upcomingDates}
            top = {dateBarTop}
            onSelect = {(value) => {
              const slate = findSlateByDate(fantasy_slates, value);

              if (slate) {
                setSelectedSlateID(slate.fantasy_slate_id);
              }
            }}
          />
        ) : (
          <div style = {{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {ordered.map((row) => (
              <Button
                key = {row.fantasy_slate_id}
                value = {row.fantasy_slate_id}
                title = {getSlateLabel(row)}
                ink = {row.fantasy_slate_id !== selectedSlateID}
                onClick = {() => setSelectedSlateID(row.fantasy_slate_id)}
              />
            ))}
          </div>
        )
      }

      <Paper style = {{ padding: 16, marginBottom: 12 }}>
        <Typography type = 'h6'>{getSlateLabel(fantasy_slate)}</Typography>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>
          {
            fantasy_slate && !locked && fantasy_slate.lock_datetime
              ? `Closes ${Dates.format(Dates.parse(fantasy_slate.lock_datetime, true), 'M jS @ g:i a')}`
              : 'Closed'
          }
        </Typography>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
          {`${alive} of ${total} still alive`}
          {fantasy_entry && +fantasy_entry.eliminated === 1 ? ' · your entry is out' : ''}
          {own_selection && own_selection.team_id && slateData && slateData.teams[own_selection.team_id]
            ? ` · you chose ${slateData.teams[own_selection.team_id].name}${+own_selection.auto === 1 ? ' (chosen for you)' : ''}`
            : ''}
        </Typography>
      </Paper>

      {
        loadingSlate || !slateData
          ? <ClientSkeleton />
          : (
            <Columns numberOfColumns={2}>
              <Slate
                games = {slateData.games}
                teams = {slateData.teams}
                game_id_x_game_outlook = {slateData.game_id_x_game_outlook}
                used_team_ids = {used_team_ids}
                selected_team_id = {own_selection ? own_selection.team_id : null}
                locked = {locked || !fantasy_entry || +fantasy_entry.eliminated === 1}
              />
              <TeamsRemaining
                teams = {slateData.teams}
                used_team_ids = {used_team_ids}
                total_teams = {slateData.total_teams}
              />
            </Columns>
          )
      }
    </div>
  );
};

export { Client, ClientSkeleton };
