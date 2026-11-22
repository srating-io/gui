'use client';

import { useEffect, useState } from 'react';
import { Inputs, MultiPicker, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { Fantasy, General } from '@srating-io/types';
import { Dates, toast } from '@esmalley/ts-utils';
import { useClientAPI } from '@/components/clientAPI';
import HelperTeam from '@/components/helpers/Team';

/**
 * One slate's games, as the things an entry chooses between.
 *
 * A radio per game but one selection per slate: choosing in another game moves it, and clicking the
 * chosen team again clears it. Both rewrite the entry's one row for the slate.
 *
 * The number beside each team is a win probability or nothing at all. It used to fall back to the
 * elo rating, which is never withheld -- but a bare `1494` landed in the same slot a subscriber
 * sees `72%` in, with no unit to tell them apart, so it read as a broken percentage.
 */

const formatOutlook = (outlook: General.GameOutlook | undefined, isHome: boolean): string => {
  if (!outlook) {
    return '';
  }

  const probability = isHome ? outlook.win_probability_home : outlook.win_probability_away;

  // null means "not available to you" rather than even odds: the paid columns arrive empty without
  // a subscription, and a sport with no projection and no money line has nothing to show either
  if (probability === null || probability === undefined) {
    return '';
  }

  return `${Math.round(+probability * 100)}%`;
};

const Slate = (
  {
    fantasy_slate,
    fantasy_entry,
    games,
    teams,
    game_id_x_game_outlook,
    used_team_ids,
    selected_team_id,
    locked,
    onSelected,
  }:
  {
    fantasy_slate: Fantasy.FantasySlate;
    fantasy_entry: Fantasy.FantasyEntry | null;
    games: General.Games;
    teams: General.Teams;
    game_id_x_game_outlook: {[game_id: string]: General.GameOutlook};
    used_team_ids: string[];
    selected_team_id: string | null;
    locked: boolean;
    onSelected: (fantasy_selections: Fantasy.FantasySelections) => void;
  },
) => {
  const theme = useTheme();

  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(selected_team_id);
  const [sending, setSending] = useState(false);

  // the slate or the entry changed under us, or a broadcast moved the selection
  useEffect(() => {
    setSelectedTeamID(selected_team_id);
  }, [selected_team_id]);

  const sorted = Object.values(games).sort((a, b) => +a.start_timestamp - +b.start_timestamp);

  if (!sorted.length) {
    return (
      <Paper style = {{ padding: 16 }}>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No games on this one.</Typography>
      </Paper>
    );
  }

  const handleChange = (value: (string | number)[] | string | number | null, game: General.Game) => {
    if (sending || !fantasy_entry) {
      return;
    }

    const picked = Array.isArray(value) ? value[0] : value;
    const team_id = picked ? String(picked) : null;

    // a null only means "clear" from the game that holds the selection
    const holdsSelection = selectedTeamID === game.home_team_id || selectedTeamID === game.away_team_id;

    if (team_id === selectedTeamID || (!team_id && !holdsSelection)) {
      return;
    }

    const previous = selectedTeamID;

    setSelectedTeamID(team_id);
    setSending(true);

    const rollBack = (message: string) => {
      setSending(false);
      setSelectedTeamID(previous);
      toast.error(message);
    };

    useClientAPI({
      class: 'fantasy_selection',
      function: 'select',
      arguments: {
        fantasy_entry_id: fantasy_entry.fantasy_entry_id,
        fantasy_slate_id: fantasy_slate.fantasy_slate_id,
        game_id: game.game_id,
        team_id,
      },
    })
      .then((data) => {
        if (!data || data.error) {
          rollBack(data && data.error ? data.error : 'Could not save that selection');
          return;
        }

        setSending(false);
        onSelected(data.fantasy_selections || {});
      })
      .catch(() => rollBack('Could not save that selection'));
  };

  const inputHandler = new Inputs();

  const rows = sorted.map((game) => {
    const outlook = game_id_x_game_outlook[game.game_id];
    const home = teams[game.home_team_id];
    const away = teams[game.away_team_id];

    // a game already under way cannot be chosen, whatever the slate's own deadline says
    const started = game.status !== 'pre';

    const sides = [
      { team: away, team_id: game.away_team_id, isHome: false },
      { team: home, team_id: game.home_team_id, isHome: true },
    ];

    const options = sides.map(({ team, team_id, isHome }) => ({
      label: `${team ? new HelperTeam({ team }).getName() : 'Team'} ${formatOutlook(outlook, isHome)}`.trim(),
      value: team_id,
      disabled: locked || started || used_team_ids.includes(team_id),
    }));

    const selected = selectedTeamID && sides.some(({ team_id }) => team_id === selectedTeamID) ? [selectedTeamID] : [];

    const usedNote = sides
      .filter(({ team_id }) => used_team_ids.includes(team_id))
      .map(({ team }) => (team ? new HelperTeam({ team }).getName() : ''))
      .filter((value) => !!value);

    const secondary = [
      Dates.format(Dates.parse(game.start_datetime, true), 'g:i a'),
      started ? 'started' : '',
      usedNote.length ? `already used: ${usedNote.join(', ')}` : '',
    ].filter((value) => !!value).join(' · ');

    return (
      <div key = {game.game_id} style = {{ marginBottom: 12 }}>
        <Tile
          primary = {`${away ? away.name : 'Away'} at ${home ? home.name : 'Home'}`}
          secondary = {secondary}
        />
        <MultiPicker
          inputHandler = {inputHandler}
          isRadio
          options = {options}
          selected = {selected}
          onChange = {(value) => handleChange(value, game)}
        />
      </div>
    );
  });

  return (
    <div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
        {
          locked
            ? 'This one is closed.'
            : 'Choose one team you think will win, or click it again to clear. Everything closes when the first game starts.'
        }
      </Typography>
      {rows}
    </div>
  );
};

export default Slate;
