'use client';

import { useAppSelector } from '@/redux/hooks';
import Blank from '@/components/generic/Blank';
import Organization from '@/components/helpers/Organization';
import Team from '@/components/helpers/Team';
import { Dates } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';




const Games = ({ fantasy_entry_id }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);

  const games = useAppSelector((state) => state.fantasyEntryReducer.games);
  const teams = useAppSelector((state) => state.fantasyEntryReducer.teams);
  const player_team_seasons = useAppSelector((state) => state.fantasyEntryReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyEntryReducer.players);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id: fantasy_group.organization_id });

  const past: General.Game[] = [];
  const future: General.Game[] = [];

  const now = new Date();

  for (const game_id in games) {
    const row = games[game_id];

    const start = Dates.parse(row.start_date, true);

    if (now <= start || row.status === 'live' || row.status === 'pre') {
      future.push(row);
    } else {
      past.push(row);
    }
  }

  // Sort and trim to get exactly three of each
  // Past games: Sort descending (most recent first)
  past.sort((a, b) => {
    return (new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  });

  const last_three_games = past.slice(0, 3).reverse();

  // Future games: Sort ascending (soonest first)
  future.sort((a, b) => {
    return (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  });

  const next_three_games = future.slice(0, 5);

  const team_id_x_player_id_x_name = {};

  for (const player_team_season_id in player_team_seasons) {
    const row = player_team_seasons[player_team_season_id];

    if (!(row.team_id in team_id_x_player_id_x_name)) {
      team_id_x_player_id_x_name[row.team_id] = {};
    }

    const player = players[row.player_id];

    team_id_x_player_id_x_name[row.team_id][row.player_id] = `${player.first_name} ${player.last_name}`;
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
      return `/${path}/games/${game.game_id}`;
    };

    const handleGameClick = (e) => {
      e.preventDefault();
      navigation.game(getGameHref());
    };

    const getTeamHref = (team_id) => {
      return `/${path}/team/${team_id}?season=${game.season}`;
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

    const players_text: string[] = [];

    for (const team_id in team_id_x_player_id_x_name) {
      if (
        team_id === game.away_team_id ||
        team_id === game.home_team_id
      ) {
        for (const player_id in team_id_x_player_id_x_name[team_id]) {
          players_text.push(team_id_x_player_id_x_name[team_id][player_id]);
        }
      }
    }

    return (
      <div style = {{ display: 'flex', margin: '5px 0px', justifyContent: 'space-between' }}>
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
            height: 40,
          }}>
            <div style = {{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <div style = {{ marginLeft: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' /* 'flexWrap': 'nowrap' */ }}>
                <Typography style = {titleStyle} type = {'body2'}>
                  <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { handleTeamClick(e, game.home_team_id); }} href = {getTeamHref(game.home_team_id)}>{homeTeamHelper.getName()}</a>
                </Typography>
                <Typography type = 'caption' style = {{ color: theme.text.secondary }}>vs</Typography>
                <Typography style = {titleStyle} type = {'body2'}>
                  <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { handleTeamClick(e, game.away_team_id); }} href = {getTeamHref(game.away_team_id)}>{awayTeamHelper.getName()}</a>
                </Typography>
                <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{players_text.join(', ')}</Typography>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  };


  const getPast = () => {
    const tiles: React.JSX.Element[] = [];
    if (last_three_games.length) {
      for (let i = 0; i < last_three_games.length; i++) {
        tiles.push(getTile({ game: last_three_games[i] }));
      }
    }

    return (
      <>
        <Typography type = 'subtitle1'>Previous</Typography>
        {tiles.length ?
          tiles :
          <Blank text='No previous games' />
        }
      </>
    );
  };

  const getFuture = () => {
    const tiles: React.JSX.Element[] = [];
    if (next_three_games.length) {
      for (let i = 0; i < next_three_games.length; i++) {
        tiles.push(getTile({ game: next_three_games[i] }));
      }
    }

    return (
      <>
        <Typography type = 'subtitle1'>Next</Typography>
        {tiles.length ?
          tiles :
          <Blank text='No upcoming games' />
        }
      </>
    );
  };


  return (
    <div style={{ padding: 5 }}>
      <Typography type = 'h6'>Games</Typography>
      {getPast()}
      {getFuture()}
    </div>
  );
};

export { Games };
