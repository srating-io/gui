'use client';

import { Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';
import ButtonSwitch from '@/components/generic/ButtonSwitch';

/**
 * One slate's games, as the things an entry chooses between.
 *
 * The number beside each team is the point of the whole feature: a projection for a sport that has
 * one, the market line where it does not, and failing both the rating gap, which is never withheld.
 * `win_probability_home` arrives null for a caller without a subscription -- that is the paid line,
 * so show the rating instead rather than an empty cell or a made up 50%.
 */

const formatOutlook = (outlook: General.GameOutlook | undefined, isHome: boolean): string => {
  if (!outlook) {
    return '';
  }

  const probability = isHome ? outlook.win_probability_home : outlook.win_probability_away;

  if (probability !== null && probability !== undefined) {
    return `${Math.round(+probability * 100)}%`;
  }

  const elo = isHome ? outlook.elo_home : outlook.elo_away;

  return elo !== null && elo !== undefined ? `${Math.round(+elo)}` : '';
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

    const [awaySide, homeSide] = sides;

    const buildTitle = ({ team, isHome }: { team: General.Team | undefined, isHome: boolean }): string => {
      return `${team ? team.code || team.name : 'Team'} ${formatOutlook(outlook, isHome)}`.trim();
    };

    // a spent team, a game under way and a closed slate are all unpickable, so the side greys out
    const isDisabled = (team_id: string): boolean => locked || started || used_team_ids.includes(team_id);

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
        <ButtonSwitch
          leftTitle = {buildTitle(awaySide)}
          rightTitle = {buildTitle(homeSide)}
          leftValue = {awaySide.team_id}
          rightValue = {homeSide.team_id}
          selected = {selected_team_id}
          leftDisabled = {isDisabled(awaySide.team_id)}
          rightDisabled = {isDisabled(homeSide.team_id)}
          handleClick = {(team_id) => onChoose(game.game_id, team_id)}
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
