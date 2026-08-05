'use client';

import React, { Profiler, useState } from 'react';

import HelperGame from '@/components/helpers/Game';
import CompareStatistic, { CompareStatisticRow } from '@/components/generic/CompareStatistic';
import { useAppSelector } from '@/redux/hooks';
import { getNavHeaderHeight, getSubNavHeaderHeight } from '@/components/generic/Game/NavBar';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import Organization from '@/components/helpers/Organization';
// import ButtonSwitch from '../../ButtonSwitch';
import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import HelperGeneral from '@/components/helpers/General';
import { Color, Objector, Style, Textor } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Chip, LinearProgress, Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';




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


const Client = (
  {
    game,
    boxscores,
    player_boxscores,
    players,
  }:
  {
    game: General.Game;
    boxscores: Basketball.Boxscores | Football.Boxscores;
    player_boxscores: Basketball.PlayerBoxscores | Football.PlayerBoxscores;
    players: General.Players;
  },
) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const bestColor = HelperGeneral.getBestColor();
  const worstColor = HelperGeneral.getWorstColor();
  const { width } = useWindowDimensions();

  const numberOfTeams = Organization.getNumberOfTeams({ organization_id: game.organization_id, division_id: game.division_id, season: game.season });


  const player_statistic_rankings = useAppSelector((state) => state.gameReducer.player_statistic_rankings);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id: game.organization_id });

  const columns = Objector.deepClone(TableColumns.getColumns({ organization_id: game.organization_id, view: 'boxscore' }));
  const playerBoxscoreHeaderColumns = Objector.deepClone(TableColumns.getColumns({ organization_id: game.organization_id, view: 'player_boxscore' }));

  if (playerBoxscoreHeaderColumns.name.widths) {
    playerBoxscoreHeaderColumns.name.widths.default = 175;
    playerBoxscoreHeaderColumns.name.widths[425] = 125;
    playerBoxscoreHeaderColumns.name.widths[320] = 100;
  }

  const [boxscore_team_id, set_boxscore_team_id] = useState(game.away_team_id);

  let home_boxscore: Basketball.Boxscore | Football.Boxscore | null = null;
  let away_boxscore: Basketball.Boxscore | Football.Boxscore | null = null;

  let defaultPlayerTableSort = 'minutes_played';

  for (const boxscore_id in boxscores) {
    const row = boxscores[boxscore_id];

    if (row.team_id === game.away_team_id) {
      away_boxscore = row;
    }

    if (row.team_id === game.home_team_id) {
      home_boxscore = row;
    }
  }

  const hasBoxscoreData = away_boxscore && home_boxscore && ('points' in away_boxscore) && ('points' in home_boxscore);

  const player_id_x_player_statistic_ranking = {};

  for (const player_statistic_ranking_id in player_statistic_rankings) {
    const row = player_statistic_rankings[player_statistic_ranking_id];

    player_id_x_player_statistic_ranking[row.player_id] = row;
  }

  const handleClick = (player_id: string) => {
    if (!player_id) {
      throw new Error('Missing player_id');
    }
    navigation.player(`/${path}/player/${player_id}`);
  };

  const Game = new HelperGame({
    game,
  });

  const gameColors = Game.getColors();

  const getBoxscoreSections = () => {
    if (!hasBoxscoreData) {
      return [];
    }

    if (game.organization_id === Organization.getCFBID()) {
      return [
        {
          name: 'Overview',
          keys: ['points', 'passing_rating_college'],
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
      ];
    }

    return [
      {
        name: 'Boxscore',
        keys: [
          'points',
          // 'field_goal',
          // 'field_goal_attempts',
          // 'field_goal_percentage',
          'two_point_field_goal',
          'two_point_field_goal_attempts',
          'two_point_field_goal_percentage',
          'three_point_field_goal',
          'three_point_field_goal_attempts',
          'three_point_field_goal_percentage',
          'free_throws',
          'free_throw_attempts',
          'free_throw_percentage',
          'offensive_rebounds',
          'defensive_rebounds',
          'assists',
          'steals',
          'blocks',
          'turnovers',
          'fouls',
        ],
      },
    ];
  };



  /**
   * Get the team boxscore content
   */
  const getBoxscoreContent = () => {
    if (!hasBoxscoreData) {
      return <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'h5'>No boxscore data yet...</Typography>;
    }

    const sections = getBoxscoreSections();

    if (game.organization_id === Organization.getCFBID()) {
      away_boxscore = away_boxscore as Football.Boxscore;
      home_boxscore = home_boxscore as Football.Boxscore;
    } else {
      away_boxscore = away_boxscore as Basketball.Boxscore;
      home_boxscore = home_boxscore as Basketball.Boxscore;
    }

    return (
      sections.map((section) => {
        const rows: CompareStatisticRow[] = [];

        section.keys.forEach((key) => {
          const row = columns[key] as CompareStatisticRow;
          row.leftRow = away_boxscore || {};
          row.rightRow = home_boxscore || {};
          rows.push(row);
        });

        return (
          <React.Fragment key = {section.name}>
            <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type = 'body1'>{section.name}</Typography>
            <CompareStatistic max = {numberOfTeams} paper = {true} rows = {rows} />
          </React.Fragment>
        );
      })
    );
  };

  const getTopPlayers = (): React.JSX.Element => {
    if (game.organization_id === Organization.getCFBID()) {
      type CFBPlayerPartial = Football.PlayerBoxscore & {
        player_name?: string;
        player_number?: string;
        initials?: string;
        color?: string;
        teamCode?: string;
      }

      let homeQB: CFBPlayerPartial | null = null;
      let awayQB: CFBPlayerPartial | null = null;
      let homeBestRusher: CFBPlayerPartial | null = null;
      let awayBestRusher: CFBPlayerPartial | null = null;
      let homeBestReceiver: CFBPlayerPartial | null = null;
      let awayBestReceiver: CFBPlayerPartial | null = null;

      const StatBlock = ({ value, label }) => (
        <div style = {{ textAlign: 'center' }}>
          <Typography type = {(width <= 425 ? 'body2' : 'body1')}>{value}</Typography>
          <Typography type = 'caption' style = {{ color: theme.text.secondary, textTransform: 'uppercase' }}>{label}</Typography>
        </div>
      );

      const PlayerStatRow = ({ name, number, initials, color, teamCode, blocks }) => {
        const rowStyle = {
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          margin: '4px',
        };

        const teamInfoStyle = {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        };

        const teamLogoStyle = {
          width: '32px',
          height: '32px',
          marginBottom: '0.25rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          color: Color.getTextColor('#ffffff', color),
        };

        const avatarContainerStyle = {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0px 10px',
        };

        let avatarWidth = 50;

        if (width <= 425) {
          avatarWidth = 40;
        }

        const avatarStyle = {
          width: avatarWidth,
          height: avatarWidth,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          color: Color.getTextColor('#ffffff', color),
          fontSize: width <= 425 ? '12px' : '14px',
        };

        const statsContainerStyle = {
          width: '100%',
          paddingLeft: '8px',
        };

        const statsGridStyle = {
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.25rem',
          marginTop: '0.5rem',
        };

        return (
          <div className={Style.getStyleClassName(rowStyle)}>
            {/* Team Logo and Rank */}
            <div className = {Style.getStyleClassName(teamInfoStyle)}>
              <div className = {Style.getStyleClassName(teamLogoStyle)}>
                <Typography style={{ color: teamLogoStyle.color }} type='caption'>{teamCode}</Typography>
              </div>
              {/* <img
                src={null}
                alt={`logo`}
                style={teamLogoStyle}
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40/CCCCCC/FFFFFF?text=Err'; }}
              /> */}
              <Typography type='caption' style = {{ color: theme.text.secondary }}>#{number}</Typography>
            </div>

            {/* Player Avatar */}
            <div className={Style.getStyleClassName(avatarContainerStyle)}>
              <div className={Style.getStyleClassName(avatarStyle)}>
                {initials}
              </div>
            </div>

            {/* Player Name and Stats */}
            <div className={Style.getStyleClassName(statsContainerStyle)}>
              <Typography type='body1'>{name}</Typography>
              <div className={Style.getStyleClassName(statsGridStyle)}>
                {blocks.map((block) => {
                  return (
                    <StatBlock key = {`stat-block-${block.label}-${block.value}`} value={block.value} label={block.label} />
                  );
                })}
              </div>
            </div>
          </div>
        );
      };

      for (const player_boxscore_id in player_boxscores) {
        const row = player_boxscores[player_boxscore_id] as CFBPlayerPartial;

        let player_name = (row.first_name ? `${row.first_name.charAt(0)}. ` : '') + row.last_name;
        let player_number = '1';
        let initials = (row.first_name ? `${row.first_name.charAt(0)}` : '') + (row.last_name ? `${row.last_name.charAt(0)}` : '');

        if (row.player_id && players && row.player_id in players) {
          const player = players[row.player_id];
          player_name = (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name;
          initials = (player.first_name ? `${player.first_name.charAt(0)}` : '') + (player.last_name ? `${player.last_name.charAt(0)}` : '');
          player_number = player.number;
        }

        row.player_name = player_name;
        row.player_number = player_number;
        row.initials = initials;

        row.color = (row.team_id === game.away_team_id ? gameColors.awayColor : gameColors.homeColor);

        row.teamCode = (row.team_id === game.away_team_id ? Game.getTeamNameShort('away') : Game.getTeamNameShort('home'));

        if (row.team_id === game.away_team_id) {
          if (
            row.passing_yards &&
            (!awayQB || row.passing_yards > awayQB.passing_yards)
          ) {
            awayQB = row;
          }

          if (
            row.rushing_yards &&
            (!awayBestRusher || row.rushing_yards > awayBestRusher.rushing_yards)
          ) {
            awayBestRusher = row;
          }

          if (
            row.receiving_yards &&
            (!awayBestReceiver || row.receiving_yards > awayBestReceiver.receiving_yards)
          ) {
            awayBestReceiver = row;
          }
        }

        if (row.team_id === game.home_team_id) {
          if (
            row.passing_yards &&
            (!homeQB || row.passing_yards > homeQB.passing_yards)
          ) {
            homeQB = row;
          }

          if (
            row.rushing_yards &&
            (!homeBestRusher || row.rushing_yards > homeBestRusher.rushing_yards)
          ) {
            homeBestRusher = row;
          }

          if (
            row.receiving_yards &&
            (!homeBestReceiver || row.receiving_yards > homeBestReceiver.receiving_yards)
          ) {
            homeBestReceiver = row;
          }
        }
      }

      return (
        <>
          <div style = {{ textAlign: 'center' }}><Typography type = 'h6'>Top players</Typography></div>
          {
            homeQB || awayQB ?
            <div style = {{ maxWidth: 600, margin: 'auto' }}>
              <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Passing</Typography>
              <Paper>
                {
                  homeQB ? PlayerStatRow({
                    name: homeQB.player_name,
                    number: homeQB.player_number,
                    initials: homeQB.initials,
                    color: homeQB.color,
                    teamCode: homeQB.teamCode,
                    blocks: [
                      { value: `${homeQB.passing_completions || 0}/${homeQB.passing_attempts}`, label: 'Comp/Att' },
                      { value: homeQB.passing_yards || 0, label: 'Yds' },
                      { value: homeQB.passing_touchdowns || 0, label: 'TD' },
                      { value: homeQB.passing_interceptions || 0, label: 'INT' },
                      { value: homeQB.passing_rating_college || 0, label: 'QBR' },
                    ],
                  })
                    : ''
                }
              </Paper>
              <Paper>
                {
                  awayQB ? PlayerStatRow({
                    name: awayQB.player_name,
                    number: awayQB.player_number,
                    initials: awayQB.initials,
                    color: awayQB.color,
                    teamCode: awayQB.teamCode,
                    blocks: [
                      { value: `${awayQB.passing_completions || 0}/${awayQB.passing_attempts}`, label: 'Comp/Att' },
                      { value: awayQB.passing_yards || 0, label: 'Yds' },
                      { value: awayQB.passing_touchdowns || 0, label: 'TD' },
                      { value: awayQB.passing_interceptions || 0, label: 'INT' },
                      { value: awayQB.passing_rating_college || 0, label: 'QBR' },
                    ],
                  })
                    : ''
                }
              </Paper>
            </div>
              : ''
          }
          {
            homeBestRusher || awayBestRusher ?
            <div style = {{ maxWidth: 600, margin: 'auto' }}>
              <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Rushing</Typography>
              <Paper>
                {
                  homeBestRusher ? PlayerStatRow({
                    name: homeBestRusher.player_name,
                    number: homeBestRusher.player_number,
                    initials: homeBestRusher.initials,
                    color: homeBestRusher.color,
                    teamCode: homeBestRusher.teamCode,
                    blocks: [
                      { value: homeBestRusher.rushing_attempts || 0, label: 'Att' },
                      { value: homeBestRusher.rushing_yards || 0, label: 'Yds' },
                      { value: homeBestRusher.rushing_yards_per_attempt || 0, label: 'AVG' },
                      { value: homeBestRusher.rushing_touchdowns || 0, label: 'TD' },
                      { value: homeBestRusher.rushing_long || 0, label: 'Long' },
                      // { value: homeBestRusher.fumbles || 0, label: 'FUML' },
                    ],
                  })
                    : ''
                }
              </Paper>
              <Paper>
                {
                  awayBestRusher ? PlayerStatRow({
                    name: awayBestRusher.player_name,
                    number: awayBestRusher.player_number,
                    initials: awayBestRusher.initials,
                    color: awayBestRusher.color,
                    teamCode: awayBestRusher.teamCode,
                    blocks: [
                      { value: awayBestRusher.rushing_attempts || 0, label: 'Att' },
                      { value: awayBestRusher.rushing_yards || 0, label: 'Yds' },
                      { value: awayBestRusher.rushing_yards_per_attempt || 0, label: 'AVG' },
                      { value: awayBestRusher.rushing_touchdowns || 0, label: 'TD' },
                      { value: awayBestRusher.rushing_long || 0, label: 'Long' },
                      // { value: awayBestRusher.fumbles || 0, label: 'FUML' },
                    ],
                  })
                    : ''
                }
              </Paper>
            </div>
              : ''
          }
          {
            homeBestReceiver || awayBestReceiver ?
            <div style = {{ maxWidth: 600, margin: 'auto' }}>
              <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Receiving</Typography>
              <Paper>
                {
                  homeBestReceiver ? PlayerStatRow({
                    name: homeBestReceiver.player_name,
                    number: homeBestReceiver.player_number,
                    initials: homeBestReceiver.initials,
                    color: homeBestReceiver.color,
                    teamCode: homeBestReceiver.teamCode,
                    blocks: [
                      { value: homeBestReceiver.receptions || 0, label: 'REC' },
                      // { value: `${homeBestReceiver.targets || 0}`, label: 'TGT' },
                      { value: homeBestReceiver.receiving_yards || 0, label: 'Yds' },
                      { value: homeBestReceiver.receiving_yards_per_reception || 0, label: 'AVG' },
                      { value: homeBestReceiver.receiving_touchdowns || 0, label: 'TD' },
                      { value: homeBestReceiver.receiving_long || 0, label: 'Long' },
                    ],
                  })
                    : ''
                }
              </Paper>
              <Paper>
                {
                  awayBestReceiver ? PlayerStatRow({
                    name: awayBestReceiver.player_name,
                    number: awayBestReceiver.player_number,
                    initials: awayBestReceiver.initials,
                    color: awayBestReceiver.color,
                    teamCode: awayBestReceiver.teamCode,
                    blocks: [
                      { value: awayBestReceiver.receptions || 0, label: 'REC' },
                      // { value: `${awayBestReceiver.targets || 0}`, label: 'TGT' },
                      { value: awayBestReceiver.receiving_yards || 0, label: 'Yds' },
                      { value: awayBestReceiver.receiving_yards_per_reception || 0, label: 'AVG' },
                      { value: awayBestReceiver.receiving_touchdowns || 0, label: 'TD' },
                      { value: awayBestReceiver.receiving_long || 0, label: 'Long' },
                    ],
                  })
                    : ''
                }
              </Paper>
            </div>
              : ''
          }
        </>
      );
    }

    return <></>;
  };


  const getPlayerBoxscoreContents = (): React.JSX.Element => {
    const picker = (
      <>
        {/* <ButtonSwitch leftTitle={Game.getTeamName('away')} rightTitle={Game.getTeamName('home')} selected = {boxscore_team_id === 'away' ? 'left' : 'right'} handleClick={() => { set_boxscore_team_id(boxscore_team_id === 'away' ? 'home' : 'away'); }} /> */}
          <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0px' }}>
            <Chip style = {{ margin: '0px 10px 0px 10px' }} filled = {boxscore_team_id === game.away_team_id} value = {game.away_team_id} onClick= {() => { set_boxscore_team_id(game.away_team_id); }} title = {Game.getTeamName('away')} />
            <Chip style = {{ margin: '0px 10px 0px 10px' }} filled = {boxscore_team_id === game.home_team_id} value = {game.home_team_id} onClick= {() => { set_boxscore_team_id(game.home_team_id); }} title = {Game.getTeamName('home')} />
          </div>
      </>
    );

    if (game.organization_id === Organization.getCBBID() || game.organization_id === Organization.getNBAID()) {
      return (
        <>
          {picker}
          {getPlayerBoxscoreContent(null)}
        </>
      );
    }

    if (game.organization_id === Organization.getCFBID()) {
      return (
        <>
        {getTopPlayers()}
        {picker}
        {getPlayerBoxscoreContent('passing')}
        {getPlayerBoxscoreContent('rushing')}
        {getPlayerBoxscoreContent('receiving')}
        </>
      );
    }

    return <></>;
  };

  /**
   * Get the player boxscore content
   */
  const getPlayerBoxscoreContent = (position: string | null): React.JSX.Element => {
    let playerColumns: string[] = [];

    if (Organization.getCBBID() === game.organization_id || game.organization_id === Organization.getNBAID()) {
      playerColumns = ['name', 'minutes_played', 'points', 'two_fg', 'three_fg', 'ft', 'offensive_rebounds', 'defensive_rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'fouls'];
    }


    if (Organization.getCFBID() === game.organization_id) {
      if (position === 'passing') {
        defaultPlayerTableSort = 'passing_yards';
        playerColumns = [
          'name',
          'passing_completions_and_attempts',
          'passing_yards',
          'passing_yards_per_attempt',
          'passing_touchdowns',
          'passing_interceptions',
          'passing_rating_college',
          // 'passing_long',
        ];
      }

      if (position === 'rushing') {
        defaultPlayerTableSort = 'rushing_yards';
        playerColumns = [
          'name',
          'rushing_attempts',
          'rushing_yards',
          'rushing_yards_per_attempt',
          'rushing_touchdowns',
          'rushing_long',
        ];
      }

      if (position === 'receiving') {
        defaultPlayerTableSort = 'receiving_yards';
        playerColumns = [
          'name',
          'receptions',
          'receiving_yards',
          'receiving_yards_per_reception',
          'receiving_touchdowns',
          'receiving_long',
        ];
      }
    }


    type PartialPlayerBoxscore = Partial<Basketball.PlayerBoxscore | Football.PlayerBoxscore> & {
      name?: string | React.JSX.Element;
      name_secondary?: string;
      // fg?: string;
      // fg_secondary?: string;
      two_fg?: string;
      two_fg_secondary?: string;
      three_fg?: string;
      three_fg_secondary?: string;
      ft?: string;
      ft_secondary?: string;
      passing_completions?: string;
      passing_attempts?: string;
      passing_completions_and_attempts?: string;
      passing_completions_and_attempts_secondary?: string;
      passing_yards?: string;
      passing_yards_per_attempt?: string;
      passing_touchdowns?: string;
      passing_interceptions?: string;
      passing_rating_college?: string;
    }
    const playerRows: PartialPlayerBoxscore[] = [];

    const footerRow: PartialPlayerBoxscore = {
      name: 'Total',
    };

    for (const player_boxscore_id in player_boxscores) {
      let row = player_boxscores[player_boxscore_id];

      if (!row.minutes_played && Organization.getCBBID() === game.organization_id) {
        continue;
      }

      if (boxscore_team_id !== row.team_id) {
        continue;
      }


      let player_name: string | React.JSX.Element = (row.first_name ? `${row.first_name.charAt(0)}. ` : '') + row.last_name;
      let player_number: string | null = null;

      if (row.player_id && players && row.player_id in players) {
        const player = players[row.player_id];
        let rank = null;
        const supStyle: React.CSSProperties = {
          verticalAlign: 'super',
          fontSize: 10,
          // fontWeight: 500,
        };

        if (row.player_id in player_id_x_player_statistic_ranking) {
          rank = player_id_x_player_statistic_ranking[row.player_id].rank;
          supStyle.color = Color.lerpColor(bestColor, worstColor, (+(player_id_x_player_statistic_ranking[row.player_id].rank / player_id_x_player_statistic_ranking[row.player_id].max)));
        }

        const name = (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name;

        if (rank) {
          player_name = <><span style = {supStyle}>{rank} </span> {name}</>;
        } else {
          player_name = name;
        }

        player_number = `#${player.number}`;
      }

      // skip people with no passing attempts
      if (
        (
          position === 'passing' &&
          (
            !('passing_attempts' in row) ||
            !row.passing_attempts
          )
        ) ||
        // skip people with no rushing attempts
        (
          position === 'rushing' &&
          (
            !('rushing_attempts' in row) ||
            !row.rushing_attempts
          )
        ) ||
        // skip people with no receiving attempts
        (
          position === 'receiving' &&
          (
            !('receptions' in row) ||
            !row.receptions
          )
        )
      ) {
        continue;
      }

      const formattedRow = Objector.deepClone(row) as PartialPlayerBoxscore;

      formattedRow.name = player_name;
      if (player_number) {
        formattedRow.name_secondary = player_number;
      }

      if (Organization.getCBBID() === game.organization_id || Organization.getNBAID() === game.organization_id) {
        // # just typescript things
        row = row as Basketball.PlayerBoxscore;

        // formattedRow.fg = `${row.field_goal || 0}-${row.field_goal_attempts || 0}`;
        // formattedRow.fg_secondary = `${row.field_goal_percentage || 0}%`;

        formattedRow.two_fg = `${row.two_point_field_goal || 0}-${row.two_point_field_goal_attempts || 0}`;
        formattedRow.two_fg_secondary = `${row.two_point_field_goal_percentage || 0}%`;

        formattedRow.three_fg = `${row.three_point_field_goal || 0}-${row.three_point_field_goal_attempts || 0}`;
        formattedRow.three_fg_secondary = `${row.three_point_field_goal_percentage || 0}%`;

        formattedRow.ft = `${row.free_throws || 0}-${row.free_throw_attempts || 0}`;
        formattedRow.ft_secondary = `${row.free_throw_percentage || 0}%`;
      }

      if (Organization.getCFBID() === game.organization_id) {
        // # just typescript things
        row = row as Football.PlayerBoxscore;
        formattedRow.passing_completions_and_attempts = `${row.passing_completions || 0}/${row.passing_attempts || 0}`;
        formattedRow.passing_completions_and_attempts_secondary = `${row.passing_completion_percentage || 0}%`;
      }

      for (const key in row) {
        let value;

        if (row[key] && key === 'minutes_played') {
          const splat = row[key].toString().split('.');
          const seconds = (+splat[1] || 0) + +splat[0] * 60;

          if (!(key in footerRow)) {
            value = seconds / 60;
          } else {
            value = +(+(footerRow[key] || 0) + (seconds / 60)).toFixed(2);
          }
        } else if (!(key in footerRow)) {
          value = row[key];
        } else {
          value = +(+footerRow[key] + +row[key]).toFixed(2);
        }

        footerRow[key] = value;
      }

      playerRows.push(formattedRow);
    }

    if (Organization.getCBBID() === game.organization_id || Organization.getNBAID() === game.organization_id) {
      // # just typescript things
      const footy = footerRow as Basketball.PlayerBoxscore;

      // footerRow.fg = `${footy.field_goal || 0}-${footy.field_goal_attempts || 0}`;
      // footerRow.fg_secondary = footy.field_goal_attempts !== undefined && footy.field_goal_attempts > 0 ? `${(((footy.field_goal || 0) / footy.field_goal_attempts) * 100).toFixed(2)}%` : '0%';

      footerRow.two_fg = `${footy.two_point_field_goal || 0}-${footy.two_point_field_goal_attempts || 0}`;
      footerRow.two_fg_secondary = footy.two_point_field_goal_attempts !== undefined && footy.two_point_field_goal_attempts > 0 ? `${(((footy.two_point_field_goal || 0) / footy.two_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

      footerRow.three_fg = `${footy.three_point_field_goal || 0}-${footy.three_point_field_goal_attempts || 0}`;
      footerRow.three_fg_secondary = footy.three_point_field_goal_attempts !== undefined && footy.three_point_field_goal_attempts > 0 ? `${(((footy.three_point_field_goal || 0) / footy.three_point_field_goal_attempts) * 100).toFixed(2)}%` : '0%';

      footerRow.ft = `${footy.free_throws || 0}-${footy.free_throw_attempts || 0}`;
      footerRow.ft_secondary = footy.free_throw_attempts !== undefined && footy.free_throw_attempts > 0 ? `${(((footy.free_throws || 0) / footy.free_throw_attempts) * 100).toFixed(2)}%` : '0%';
    }

    if (Organization.getCFBID() === game.organization_id) {
      footerRow.passing_completions_and_attempts = `${footerRow.passing_completions || 0}/${footerRow.passing_attempts || 0}`;
      footerRow.passing_completions_and_attempts_secondary = footerRow.passing_attempts !== undefined && +footerRow.passing_attempts > 0 ? `${(((+(footerRow.passing_completions ?? 0) / +footerRow.passing_attempts) * 100).toFixed(2))}%` : '0%';
    }

    let title = <></>;

    if (position) {
      title = <Typography type = 'body1'>{Textor.toSentenceCase(position)}</Typography>;
    }

    if (!playerRows.length) {
      return <></>;
    }

    return (
      <>
        {title}
        <RankTable
          key = {boxscore_team_id}
          rows={playerRows}
          footerRow={footerRow}
          columns={playerBoxscoreHeaderColumns}
          displayColumns={playerColumns}
          rowKey = 'player_id'
          defaultSortOrder = 'asc'
          defaultSortOrderBy = {defaultPlayerTableSort}
          sessionStorageKey = {`${path}.GAME.BOXSCORE.${position}`}
          secondaryKey = 'secondary'
          handleRowClick={handleClick}
          />
      </>
    );
  };

  return (
    <Profiler id="BoxscoreClient" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      <div>
        <div style = {{ padding: '10px 5px' }}>
          <Profiler id="getBoxscoreContent" onRender={(id, phase, actualDuration) => {
            console.log(id, phase, actualDuration);
          }}>
          {getBoxscoreContent()}
          </Profiler>
        </div>
      </div>
      <div style = {{ padding: '0px 5px 10px 5px' }}>
        <Profiler id="getPlayerBoxscoreContents" onRender={(id, phase, actualDuration) => {
          console.log(id, phase, actualDuration);
        }}>
        {getPlayerBoxscoreContents()}
        </Profiler>
      </div>
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
