'use client';

import { useAppSelector } from '@/redux/hooks';
import Blank from '@/components/generic/Blank';
import Url from '@/components/helpers/Url';
import Team from '@/components/helpers/Team';
import { getBoxscoreScore } from '@/components/helpers/FantasyScoring';
import { Dates } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, General } from '@srating-io/types';


const PREVIOUS_SHOWN = 3;
const UPCOMING_SHOWN = 5;


const Games = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const games = useAppSelector((state) => state.fantasyEntryReducer.games);
  const teams = useAppSelector((state) => state.fantasyEntryReducer.teams);
  const player_team_seasons = useAppSelector((state) => state.fantasyEntryReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyEntryReducer.players);
  const player_boxscores = useAppSelector((state) => state.fantasyEntryReducer.player_boxscores);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);

  const live: General.Game[] = [];
  const past: General.Game[] = [];
  const future: General.Game[] = [];

  const now = new Date();

  for (const game_id in games) {
    const row = games[game_id];

    const start = Dates.parse(row.start_datetime, true);

    // A game in progress used to sit in with the upcoming ones, so the game that was actually
    // moving the roster was the hardest one to find.
    if (row.status === 'live') {
      live.push(row);
    } else if (now <= start || row.status === 'pre') {
      future.push(row);
    } else {
      past.push(row);
    }
  }

  // Past games: most recent first, then flipped so the list reads forwards in time.
  past.sort((a, b) => {
    return (Dates.parse(b.start_datetime, true).getTime() - Dates.parse(a.start_datetime, true).getTime());
  });

  const previous_games = past.slice(0, PREVIOUS_SHOWN).reverse();

  future.sort((a, b) => {
    return (Dates.parse(a.start_datetime, true).getTime() - Dates.parse(b.start_datetime, true).getTime());
  });

  const upcoming_games = future.slice(0, UPCOMING_SHOWN);

  const team_id_x_player_id_x_name = {};

  for (const player_team_season_id in player_team_seasons) {
    const row = player_team_seasons[player_team_season_id];

    if (!(row.team_id in team_id_x_player_id_x_name)) {
      team_id_x_player_id_x_name[row.team_id] = {};
    }

    const player = players[row.player_id];

    if (!player) {
      continue;
    }

    team_id_x_player_id_x_name[row.team_id][row.player_id] = `${player.first_name} ${player.last_name}`;
  }

  // What each rostered player did in each game, so a played game can say so rather than just
  // naming who was in it. Empty until the api returns boxscores.
  const game_id_x_player_id_x_boxscore: {
    [game_id: string]: { [player_id: string]: Basketball.PlayerBoxscore };
  } = {};

  for (const player_boxscore_id in (player_boxscores || {})) {
    const row = (player_boxscores || {})[player_boxscore_id];

    if (!(row.game_id in game_id_x_player_id_x_boxscore)) {
      game_id_x_player_id_x_boxscore[row.game_id] = {};
    }

    game_id_x_player_id_x_boxscore[row.game_id][row.player_id] = row;
  }


  const getTile = ({ game }): React.JSX.Element => {
    const home_team = teams[game.home_team_id];
    const away_team = teams[game.away_team_id];

    const homeTeamHelper = new Team({
      team: home_team,
    });

    const awayTeamHelper = new Team({
      team: away_team,
    });

    const getGameHref = () => {
      return Url.game({ organization_id: game.organization_id, game });
    };

    const handleGameClick = (e) => {
      e.preventDefault();
      navigation.game(getGameHref());
    };

    const getTeamHref = (team_id) => {
      return Url.team({ organization_id: game.organization_id, team: teams[team_id], season: game.season });
    };

    const handleTeamClick = (e, team_id) => {
      e.preventDefault();
      navigation.team(getTeamHref(team_id));
    };

    const textBackgroundColor = theme.info.light;

    const titleStyle = {
      margin: '0px 10px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      lineHeight: 'initial',
    };

    // Each of this entry's players in the game, with what the game was worth to them.
    const players_text: string[] = [];

    for (const team_id in team_id_x_player_id_x_name) {
      if (
        team_id === game.away_team_id ||
        team_id === game.home_team_id
      ) {
        for (const player_id in team_id_x_player_id_x_name[team_id]) {
          const name = team_id_x_player_id_x_name[team_id][player_id];
          const boxscore = (game_id_x_player_id_x_boxscore[game.game_id] || {})[player_id];
          const score = boxscore ? getBoxscoreScore(boxscore, fantasy_group.draft_scoring_terminology_id) : null;

          players_text.push(score === null ? name : `${name} ${score}`);
        }
      }
    }

    const isScored = game.status === 'final' || game.status === 'live';

    const getStatusText = (): string => {
      if (game.status === 'final') {
        return 'Final';
      }

      if (game.status === 'live') {
        return [game.current_period, game.clock].filter((part) => !!part).join(' ') || 'Live';
      }

      return Dates.format(game.start_datetime, 'g:i a');
    };

    return (
      <div key = {game.game_id} style = {{ display: 'flex', margin: '5px 0px', justifyContent: 'space-between' }}>
        <div style = {{ display: 'flex' }}>
          <Paper elevation={2} style = {{
            display: 'flex', width: (width <= 475 ? 40 : 75), marginRight: 5, alignContent: 'center', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          }} onClick={handleGameClick}>
            <Typography type = 'caption' style = {{ color: textBackgroundColor, lineHeight: 'initial' }}>
              <a style = {{ cursor: 'pointer', color: textBackgroundColor }} onClick={handleGameClick} href = {getGameHref()}>{Dates.format(`${game.start_date.split('T')[0]} 12:00:00`, (width <= 475 ? 'jS' : 'D jS'))}</a>
            </Typography>
          </Paper>
        </div>
        <Paper elevation={2} style = {{ width: '100%' }}>
          <div style = {{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 40,
            padding: '2px 10px 2px 0px',
          }}>
            <div style = {{ display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
              <div style = {{ marginLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minWidth: 0 }}>
                <div style = {{ display: 'flex', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
                  <Typography style = {titleStyle} type = {'body2'}>
                    <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { handleTeamClick(e, game.home_team_id); }} href = {getTeamHref(game.home_team_id)}>{homeTeamHelper.getName()}</a>
                  </Typography>
                  <Typography type = 'caption' style = {{ color: theme.text.secondary }}>vs</Typography>
                  <Typography style = {titleStyle} type = {'body2'}>
                    <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { handleTeamClick(e, game.away_team_id); }} href = {getTeamHref(game.away_team_id)}>{awayTeamHelper.getName()}</a>
                  </Typography>
                </div>
                {players_text.length ? (
                  <Typography type = 'caption' style = {{ color: theme.text.secondary, margin: '0px 10px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {players_text.join(', ')}
                  </Typography>
                ) : null}
              </div>
            </div>
            <div style = {{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
              {isScored ? (
                <Typography type = 'body2' style = {{ lineHeight: 'initial' }}>
                  {`${game.home_score ?? 0} - ${game.away_score ?? 0}`}
                </Typography>
              ) : null}
              <Typography type = 'caption' style = {{ color: game.status === 'live' ? theme.error.main : theme.text.secondary, lineHeight: 'initial' }}>
                {getStatusText()}
              </Typography>
            </div>
          </div>
        </Paper>
      </div>
    );
  };


  const getSection = (title: string, rows: General.Game[], emptyText: string | null): React.JSX.Element | null => {
    // A live section with nothing in it is noise, so it is dropped rather than shown empty.
    if (!rows.length && emptyText === null) {
      return null;
    }

    return (
      <>
        <Typography type = 'subtitle1'>{title}</Typography>
        {rows.length ?
          rows.map((game) => getTile({ game })) :
          <Blank text={emptyText as string} />
        }
      </>
    );
  };


  return (
    <div style={{ padding: 5 }}>
      {getSection('Live', live, null)}
      {getSection('Previous', previous_games, 'No previous games')}
      {getSection('Upcoming', upcoming_games, 'No upcoming games')}
    </div>
  );
};

export { Games };
