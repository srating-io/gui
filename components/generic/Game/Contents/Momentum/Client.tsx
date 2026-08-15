'use client';

import CompareStatistic, { CompareStatisticRow } from '@/components/generic/CompareStatistic';

import HelperGame from '@/components/helpers/Game';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { Dates, Objector } from '@esmalley/ts-utils';
import { LinearProgress, Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight() + getSubNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 120;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};


// TODO update to show differential from season averages, build it into stats compare component?


const Client = ({ game, momentumData, stats }) => {
  const { width } = useWindowDimensions();

  const Game = new HelperGame({
    game,
  });

  const numberOfTeams = Organization.getNumberOfTeams({ organization_id: game.organization_id, division_id: game.division_id, season: game.season });

  const awayStats = (game.away_team_id in stats) ? stats[game.away_team_id] : {};
  const homeStats = (game.home_team_id in stats) ? stats[game.home_team_id] : {};

  const awayMomentumStats = (momentumData && momentumData[game.away_team_id] && momentumData[game.away_team_id].stats) || {};
  const homeMomentumStats = (momentumData && momentumData[game.home_team_id] && momentumData[game.home_team_id].stats) || {};

  const awayTeamGames: General.Games = (momentumData && momentumData[game.away_team_id] && momentumData[game.away_team_id].games) || {};
  const homeTeamGames: General.Games = (momentumData && momentumData[game.home_team_id] && momentumData[game.home_team_id].games) || {};

  const columns = Objector.deepClone(TableColumns.getColumns({ organization_id: game.organization_id, view: 'team' }));


  const getSections = () => {
    // Ones up here are shared by both CBB and CFB (for now)
    const marginRows = [
      'win_margin',
      'loss_margin',
      'confwin_margin',
      'confloss_margin',
    ];

    const recordRows = [
      'wins',
      'losses',
      'confwins',
      'conflosses',
      'neutralwins',
      'neutrallosses',
      'homewins',
      'homelosses',
      'roadwins',
      'roadlosses',
    ];

    if (Organization.isCFB()) {
      return [
        {
          name: 'Overview',
          keys: [
            'record',
            'passing_rating_college',
            'points',
            'opponent_points',
          ],
        },
        {
          name: 'Efficiency',
          keys: [
            'yards_per_play',
            'points_per_play',
            // 'offensive_dvoa',
            // 'defensive_dvoa',
          ],
        },
        {
          name: 'Passing',
          keys: [
            'passing_attempts',
            'passing_completions',
            'passing_yards',
            'passing_completion_percentage',
            'passing_yards_per_attempt',
            'passing_yards_per_completion',
            'passing_touchdowns',
            'passing_interceptions',
            'passing_long',
          ],
        },
        {
          name: 'Rushing',
          keys: [
            'rushing_attempts',
            'rushing_yards',
            'rushing_yards_per_attempt',
            'rushing_touchdowns',
            'rushing_long',
          ],
        },
        {
          name: 'Receiving',
          keys: [
            'receptions',
            'receiving_yards',
            'receiving_yards_per_reception',
            'receiving_touchdowns',
            'receiving_long',
          ],
        },
        {
          name: 'Margin',
          keys: marginRows,
        },
        {
          name: 'Record',
          keys: recordRows,
        },
        {
          name: 'Defensive',
          keys: [
            'opponent_points',
            'opponent_yards_per_play',
            'opponent_points_per_play',
            'opponent_passing_attempts',
            'opponent_passing_completions',
            'opponent_passing_yards',
            'opponent_passing_completion_percentage',
            'opponent_passing_yards_per_attempt',
            'opponent_passing_yards_per_completion',
            'opponent_passing_touchdowns',
            'opponent_passing_interceptions',
            'opponent_passing_long',
            'opponent_rushing_attempts',
            'opponent_rushing_yards',
            'opponent_rushing_yards_per_attempt',
            'opponent_rushing_touchdowns',
            'opponent_rushing_long',
            'opponent_receptions',
            'opponent_receiving_yards',
            'opponent_receiving_yards_per_reception',
            'opponent_receiving_touchdowns',
            'opponent_receiving_long',
          ],
        },
      ];
    }

    // defaulting to CBB
    return [
      {
        name: 'Overview',
        keys: [
          'record',
          'offensive_rating',
          'defensive_rating',
          'points',
          'opponent_points',
        ],
      },
      {
        name: 'Offense',
        keys: [
          'possessions',
          'pace',
          'field_goal',
          'field_goal_attempts',
          'field_goal_percentage',
          'two_point_field_goal',
          'two_point_field_goal_attempts',
          'two_point_field_goal_percentage',
          'three_point_field_goal',
          'three_point_field_goal_attempts',
          'three_point_field_goal_percentage',
          'free_throws',
          'free_throw_attempts',
          'free_throw_percentage',
        ],
      },
      {
        name: 'Special',
        keys: [
          'offensive_rebounds',
          'defensive_rebounds',
          'assists',
          'steals',
          'blocks',
          'turnovers',
          'fouls',
        ],
      },
      {
        name: 'Margin',
        keys: marginRows,
      },
      {
        name: 'Record',
        keys: recordRows,
      },
      {
        name: 'Defensive',
        keys: [
          'opponent_field_goal',
          'opponent_field_goal_attempts',
          'opponent_field_goal_percentage',
          'opponent_offensive_rebounds',
          'opponent_defensive_rebounds',
          'opponent_assists',
          'opponent_steals',
          'opponent_blocks',
          'opponent_turnovers',
          'opponent_fouls',
        ],
      },
    ];
  };

  const sections = getSections();

  const sortedHomeGames: General.Game[] = Object.values(homeTeamGames).sort((a, b) => {
    return a.start_date < b.start_date ? -1 : 1;
  });

  const sortedAwayGames: General.Game[] = Object.values(awayTeamGames).sort((a, b) => {
    return a.start_date < b.start_date ? -1 : 1;
  });

  const flexContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-evenly',
    marginBottom: '10px',
    flexWrap: 'nowrap',
  };

  if (width < 700) {
    flexContainerStyle.flexDirection = 'column';
  }

  let moreThanOneGame = false;

  if (momentumData) {
    for (const team_id in momentumData) {
      const counter = Object.keys(momentumData[team_id].games).length;
      if (counter > 1) {
        moreThanOneGame = true;
      }
    }
  }


  return (
    <Contents>
      <div style = {{ padding: '0px 5px 20px 5px' }}>
        {
          momentumData !== null && moreThanOneGame ?
          <div>
            <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h6'>Last 5 game stat comparison</Typography>
              <div style = {flexContainerStyle}>
              <Paper elevation = {3} style = {{ padding: 10, margin: '0px 5px 10px 5px' }}>
                <table style = {{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <th colSpan = {3}><Typography type = 'caption'>{Game.getTeamName('away')}</Typography></th>
                    </tr>
                    {
                      sortedAwayGames.map((game_) => {
                        const G = new HelperGame({
                          game: game_,
                        });

                        const won = ((game_.home_score || 0) > (game_.away_score || 0) && game_.home_team_id === game.away_team_id) || ((game_.home_score || 0) < (game_.away_score || 0) && game_.away_team_id === game.away_team_id);

                        return (<tr>
                          <td style = {{ padding: '0px 5px' }}><Typography type = 'caption'>{Dates.format(game_.start_datetime, 'n/j')}</Typography></td>
                          <td style = {{ padding: '0px 5px' }}><Typography type = 'caption'>{game_.away_team_id === game.away_team_id ? `@ ${G.getTeamName('home')}` : `vs ${G.getTeamName('away')}`}</Typography></td>
                          <td style = {{ padding: '0px 5px', textAlign: 'right' }}><Typography type = 'caption'>{won ? 'W' : 'L'} {game_.away_score} - {game_.home_score}</Typography></td>
                        </tr>);
                      })
                    }
                  </tbody>
                </table>
                <Typography type = 'caption'>{Game.getTeamName('away')} offense is trending {awayMomentumStats.offensive_rating > awayStats.offensive_rating ? 'up' : 'down'}, Defense is trending {awayMomentumStats.defensive_rating < awayStats.defensive_rating ? 'up' : 'down'}.</Typography>
                </Paper>
                <Paper elevation = {3} style = {{ padding: 10, margin: '0px 5px 10px 5px' }}>
                <table style = {{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <th colSpan = {3}><Typography type = 'caption'>{Game.getTeamName('home')}</Typography></th>
                    </tr>
                    {
                      sortedHomeGames.map((game_) => {
                        const G = new HelperGame({
                          game: game_,
                        });

                        const won = ((game_.home_score || 0) > (game_.away_score || 0) && game_.home_team_id === game.home_team_id) || ((game_.home_score || 0) < (game_.away_score || 0) && game_.away_team_id === game.home_team_id);

                        return (<tr>
                          <td style = {{ padding: '0px 5px' }}><Typography type = 'caption'>{Dates.format(game_.start_datetime, 'n/j')}</Typography></td>
                          <td style = {{ padding: '0px 5px' }}><Typography type = 'caption'>{game_.home_team_id === game.home_team_id ? `@ ${G.getTeamName('away')}` : `vs ${G.getTeamName('home')}`}</Typography></td>
                          <td style = {{ padding: '0px 5px', textAlign: 'right' }}><Typography type = 'caption'>{won ? 'W' : 'L'} {game_.away_score} - {game_.home_score}</Typography></td>
                        </tr>);
                      })
                    }
                  </tbody>
                </table>
                <Typography type = 'caption'>{Game.getTeamName('home')} offense is trending {homeMomentumStats.offensive_rating > homeStats.offensive_rating ? 'up' : 'down'}. Defense is trending {homeMomentumStats.defensive_rating < homeStats.defensive_rating ? 'up' : 'down'}.</Typography>
                </Paper>
              </div>
              {// <Typography style = {{'margin': '10px 0px'}} type = 'body2'>Below shows the averages of the last 5 games. Next to each statisic shows the team's season average.</Typography>
              }
            {sections.map((section) => {
              const rows: CompareStatisticRow[] = [];

              section.keys.forEach((key) => {
                const row = columns[key] as CompareStatisticRow;

                row.leftRow = awayMomentumStats;
                row.rightRow = homeMomentumStats;

                rows.push(row);
              });
              return (
                <>
                  <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'body1'>{section.name}</Typography>
                  <CompareStatistic max = {numberOfTeams} paper = {true} rows = {rows} />
                </>
              );
            })}
          </div>
            : ''
        }
        {
          momentumData !== null && !moreThanOneGame ?
          <div style={{ textAlign: 'center' }}>
            <Typography type = 'h5'>Not enough data to determine momentum yet.</Typography>
          </div>
            : ''
        }
      </div>
    </Contents>
  );
};

export { Client, ClientSkeleton };
