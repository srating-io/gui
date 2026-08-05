'use client';


// import FavoritePicker from '@/components/generic/FavoritePicker';
import Organization from '@/components/helpers/Organization';
import HelperTeam from '@/components/helpers/Team';
import HelperPlayer from '@/components/helpers/Player';
import HelperGeneral from '@/components/helpers/General';
import { useAppSelector } from '@/redux/hooks';
import FavoritePicker from '../../FavoritePicker';
import OptionPicker from '../../OptionPicker';
import ClassSpan from '../../ClassSpan';
import { Color, Dates } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Skeleton, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';
import { getSeasonOptions } from '../ContentsWrapper';


/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ overflow: 'hidden', paddingLeft: 5, paddingRight: 5 }}>
      {children}
    </div>
  );
};


/**
 * The first line, containing the player name + buttons
 */
const PrimaryLine = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center' }}>
      {children}
    </div>
  );
};


/**
 * The second line, containing the team
 */
const SecondaryLine = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
  );
};

/**
 * The third line, containing the number, position, height
 */
const TertiaryLine = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
  );
};

const ClientSkeleton = () => {
  return (
    <Contents>
      <PrimaryLine>
        <Skeleton style = {{ width: 320, height: 35, marginBottom: 5 }} />
      </PrimaryLine>
      <SecondaryLine>
        <Skeleton style = {{ width: 200, height: 26, marginBottom: 5 }} />
      </SecondaryLine>
      <TertiaryLine>
        <Skeleton style = {{ width: 200, height: 26 }} />
      </TertiaryLine>
    </Contents>
  );
};

const Client = (
  {
    organization_id,
    division_id,
    player_statistic_ranking,
    statistic_ranking,
    season,
    player_team_season_id
  }:
  {
    organization_id: string,
    division_id: string,
    player_statistic_ranking: Basketball.PlayerStatisticRanking | Football.PlayerStatisticRanking,
    statistic_ranking: Basketball.StatisticRanking | Football.StatisticRanking,
    season: number,
    player_team_season_id: string,
  },
) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const player: General.Player = useAppSelector((state) => state.playerReducer.player);
  const team: General.Team | null = useAppSelector((state) => state.playerReducer.team);
  const player_team_seasons: General.PlayerTeamSeasons = useAppSelector((state) => state.playerReducer.player_team_seasons);
  const player_team_season = useAppSelector((state) => state.playerReducer.player_team_season);
  const teams: General.Teams = useAppSelector((state) => state.playerReducer.teams);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });

  const breakPoint = 475;

  const { width } = useWindowDimensions();


  const teamHelper = new HelperTeam({ team });
  const playerHelper = new HelperPlayer({ player });

  const bestColor = HelperGeneral.getBestColor();
  const worstColor = HelperGeneral.getWorstColor();


  const supStyle: React.CSSProperties = {
    fontSize: '12px',
    verticalAlign: 'super',
  };

  const teamSupStyle: React.CSSProperties = {
    fontSize: '10px',
    verticalAlign: 'super',
  };

  const playerRank = (player_statistic_ranking && player_statistic_ranking.rank) || null;
  const teamRank = (statistic_ranking && statistic_ranking.rank) || null;

  if (playerRank) {
    supStyle.color = Color.lerpColor(bestColor, worstColor, (+(playerRank / player_statistic_ranking.max)));
  }

  if (teamRank) {
    teamSupStyle.color = Color.lerpColor(bestColor, worstColor, (+(teamRank / statistic_ranking.max)));
  }

  const getTeamHref = () => {
    if (!team || !team.team_id) {
      return '/';
    }
    return `/${path}/team/${team.team_id}?season=${season}`;
  };

  const handleTeamClick = (e) => {
    e.preventDefault();
    if (!team || !team.team_id) {
      return;
    }
    navigation.team(getTeamHref());
  };

  const handleSeason = (player_team_season_id: string) => {
    const args: {
      player_team_season_id: string;
      season: number | null;
    } = { player_team_season_id, season: null };

    if (player_team_season_id in player_team_seasons) {
      args.season = player_team_seasons[player_team_season_id].season;
    }
    navigation.playerView(args);
  };

  const seasonOptions = getSeasonOptions(player_team_seasons).map((row) => {
    const team = teams[row.team_id] || null;
    const tHelper = new HelperTeam({ team });
    const teamName = tHelper.getName();

    // Format start_date / end_date for the sublabel if available
    let dateString = '';
    if (row.start_date && row.end_date) {
      dateString = ` - ${Dates.format(row.start_date, 'M jS')} - ${Dates.format(row.end_date, 'M jS')}`;
    } else if (row.start_date) {
      dateString = ` - began ${Dates.format(row.start_date, 'M jS')}`;
    } else if (row.end_date) {
      dateString = ` - to ${Dates.format(row.end_date, 'M jS')}`;
    }
    return {
      value: row.player_team_season_id,
      label: `${row.season - 1} - ${row.season}`,
      sublabel: teamName ? `${teamName}${dateString}` : dateString.trim(),
    };
  });
  

  const player_number = player_team_season && player_team_season.number ? player_team_season.number : player.number;
  const player_position = player_team_season && player_team_season.position ? player_team_season.position : player.position;
  const player_height = player_team_season && player_team_season.height ? player_team_season.height : player.height;


  return (
    <Contents>
      <PrimaryLine>
        <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} type = {(width < breakPoint ? 'h6' : 'h5')}>
          {playerRank ? <span style = {supStyle}>{playerRank} </span> : ''}
          {playerHelper.getName()}
        </Typography>
        {player_team_season && player_team_season.class_year ? <div style = {{ display: 'inline-flex', alignItems: 'center' }}><ClassSpan class_year={player_team_season.class_year} /></div> : ''}
        <FavoritePicker player_id = {player?.player_id} />
        <OptionPicker buttonName = {season.toString()} options = {seasonOptions} selected = {[player_team_season_id]} actionHandler = {handleSeason} isRadio = {true} />
      </PrimaryLine>
      <SecondaryLine>
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>
          {teamRank ? <span style = {teamSupStyle}>{teamRank} </span> : ''}
          <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={handleTeamClick} href = {getTeamHref()} >{teamHelper.getName()}</a>
          <span style = {{ fontSize: '16px', verticalAlign: 'middle', display: 'inline-block', marginLeft: 5 }}>
            <Typography type = 'overline' style = {{ color: theme.text.secondary }}> ({statistic_ranking?.wins || 0}-{statistic_ranking?.losses || 0})</Typography>
          </span>
        </Typography>
      </SecondaryLine>
      <TertiaryLine>
        <span style = {{ fontSize: '16px', verticalAlign: 'middle', display: 'inline-block', marginLeft: 5 }}>
          <Typography type = 'overline' style = {{ color: theme.text.secondary }}> #{player_number || 0} {player_position || 'U'} {player_height ? player_height.replace('-', '\'') : ''}</Typography>
        </span>
      </TertiaryLine>
    </Contents>
  );
};

export { Client, ClientSkeleton };
