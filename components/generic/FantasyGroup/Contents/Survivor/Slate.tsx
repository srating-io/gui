'use client';

import { Inputs, MultiPicker, MultiPickerOption, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';

/**
 * One slate's games, as the things an entry chooses between.
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
    games,
    teams,
    game_id_x_game_outlook,
    used_team_ids,
    selected_team_id,
    locked,
    onChoose,
  }:
  {
    games: General.Games;
    teams: General.Teams;
    game_id_x_game_outlook: {[game_id: string]: General.GameOutlook};
    used_team_ids: string[];
    selected_team_id: string | null;
    locked: boolean;
    onChoose: (game_id: string, team_id: string) => void;
  },
) => {
  const theme = useTheme();

  // one handler for the whole slate, the same way the create wizard shares one across its step
  const inputHandler = new Inputs();

  const sorted = Object.values(games).sort((a, b) => +a.start_timestamp - +b.start_timestamp);

  if (!sorted.length) {
    return (
      <Paper style = {{ padding: 16 }}>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No games on this one.</Typography>
      </Paper>
    );
  }

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

    // a spent team cannot be chosen again, so its option greys out while its opponent stays live
    const options: MultiPickerOption[] = sides.map(({ team, team_id, isHome }) => ({
      label: `${team ? team.code || team.name : 'Team'} ${formatOutlook(outlook, isHome)}`.trim(),
      value: team_id,
      disabled: used_team_ids.includes(team_id),
    }));

    const usedNote = sides
      .filter(({ team_id }) => used_team_ids.includes(team_id))
      .map(({ team }) => (team ? team.code || team.name : ''))
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
          options = {options}
          selected = {selected_team_id ? [selected_team_id] : []}
          isRadio
          numberOfColumns = {2}
          disabled = {locked || started}
          onChange = {(value) => {
            const team_id = Array.isArray(value) ? value[0] : value;

            if (team_id) {
              onChoose(game.game_id, String(team_id));
            }
          }}
        />
      </div>
    );
  });

  return (
    <Paper style = {{ padding: 16 }}>
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
        {
          locked
            ? 'This one is closed.'
            : 'Choose one team you think will win. Everything closes when the first game starts.'
        }
      </Typography>
      {rows}
    </Paper>
  );
};

export default Slate;
