'use client';

import { Columns, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';

/**
 * One slate's games, as the things an entry chooses between.
 *
 * Display only for now. Three click paths (Button, ButtonSwitch, MultiPicker) each misfired, so the
 * selection wiring was torn out to be rebuilt from scratch; the tiles still show what is chosen,
 * spent or closed, which is what the rebuild has to preserve.
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
  }:
  {
    games: General.Games;
    teams: General.Teams;
    game_id_x_game_outlook: {[game_id: string]: General.GameOutlook};
    used_team_ids: string[];
    selected_team_id: string | null;
    locked: boolean;
  },
) => {
  const theme = useTheme();

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

    // a spent team greys out while its opponent stays live; a chosen one keeps its fill and only
    // dims on a closed slate, so the selection stays legible
    const options = sides.map(({ team, team_id, isHome }) => {
      const chosen = selected_team_id === team_id;
      const unavailable = locked || started || used_team_ids.includes(team_id);

      let fill: React.CSSProperties = {};

      if (chosen) {
        fill = { backgroundColor: theme.blue[500] };
      } else if (unavailable) {
        fill = { backgroundColor: theme.action.disabledBackground, color: theme.text.disabled };
      }

      const optionStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '8px 16px',
        opacity: unavailable ? 0.6 : 1,
        ...fill,
      };

      return (
        <Paper key = {team_id} style = {optionStyle}>
          <Typography type = 'body1' style = {{ color: 'inherit' }}>
            {`${team ? team.code || team.name : 'Team'} ${formatOutlook(outlook, isHome)}`.trim()}
          </Typography>
        </Paper>
      );
    });

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
        <Columns numberOfColumns = {2} style = {{ gap: 10 }}>
          {options}
        </Columns>
      </div>
    );
  });

  return (
    <div>
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
        {
          locked
            ? 'This one is closed.'
            : 'Choose one team you think will win. Everything closes when the first game starts.'
        }
      </Typography>
      {rows}
    </div>
  );
};

export default Slate;
