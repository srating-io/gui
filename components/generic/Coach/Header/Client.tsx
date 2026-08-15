'use client';

// import FavoritePicker from '@/components/generic/FavoritePicker';
import HelperTeam from '@/components/helpers/Team';
import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import GeneralHelper from '@/components/helpers/General';
import { Color } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Skeleton, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import OptionPicker from '../../OptionPicker';

import type { General } from '@srating-io/types';


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
 * The first line, containing the team name + buttons
 */
const PrimaryLine = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ display: 'flex', flexWrap: 'nowrap' }}>
      {children}
    </div>
  );
};


/**
 * The second line, containing the conference + coach
 */
const SecondaryLine = ({ children }): React.JSX.Element => {
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
        <Skeleton style={{ width: 320, height: 30, marginBottom: 5 }} />
      </PrimaryLine>
      <SecondaryLine>
        <Skeleton style={{ width: 200, height: 28 }} />
      </SecondaryLine>
    </Contents>
  );
};

const Client = ({ organization_id, division_id, coach_statistic_rankings, season }) => {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const navigation = useNavigation();
  const coach: General.Coach = useAppSelector((state) => state.coachReducer.coach);
  const coach_team_seasons = useAppSelector((state) => state.coachReducer.coach_team_seasons);
  const teams = useAppSelector((state) => state.coachReducer.teams);
  const statistic_rankings = useAppSelector((state) => state.coachReducer.statistic_rankings);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });

  const season_x_team_id = {};

  let maxSeason: number | null = null;

  for (const coach_team_season_id in coach_team_seasons) {
    const row = coach_team_seasons[coach_team_season_id];
    season_x_team_id[row.season] = row.team_id;

    if (!maxSeason || maxSeason < row.season) {
      maxSeason = row.season;
    }
  }

  console.log('coach_team_seasons', coach_team_seasons)
  console.log('maxSeason', maxSeason)
  console.log('Object.keys(teams)[0]', Object.keys(teams)[0])

  const lastSeason = (season in season_x_team_id ? season : (
    maxSeason || Object.keys(teams)[0]
  ));

  const season_x_coach_statistic_ranking_id = {};

  for (const coach_statistic_ranking_id in coach_statistic_rankings) {
    const row = coach_statistic_rankings[coach_statistic_ranking_id];

    season_x_coach_statistic_ranking_id[row.season] = coach_statistic_ranking_id;
  }

  const season_x_statistic_ranking_id = {};

  for (const statistic_ranking_id in statistic_rankings) {
    const row = statistic_rankings[statistic_ranking_id];

    if (row.team_id === season_x_team_id[lastSeason]) {
      season_x_statistic_ranking_id[row.season] = statistic_ranking_id;
    }
  }

  const coach_statistic_ranking = coach_statistic_rankings[season_x_coach_statistic_ranking_id[lastSeason]];
  const statistic_ranking = statistic_rankings[season_x_statistic_ranking_id[lastSeason]];

  let team: General.Team = teams[season_x_team_id[lastSeason]];
  if (season && season_x_team_id[season]) {
    team = teams[season_x_team_id[season]];
  }
  const breakPoint = 475;


  const teamHelper = new HelperTeam({ team });

  const bestColor = GeneralHelper.getBestColor();
  const worstColor = GeneralHelper.getWorstColor();


  const supStyle: React.CSSProperties = {
    fontSize: (width < breakPoint ? '12px' : '16px'),
    verticalAlign: 'super',
  };

  const teamSupStyle: React.CSSProperties = {
    fontSize: '10px',
    verticalAlign: 'super',
  };

  const coachRank = coach_statistic_ranking ? coach_statistic_ranking.rank : null;
  const teamRank = statistic_ranking ? statistic_ranking.rank : null;

  if (coachRank) {
    supStyle.color = Color.lerpColor(bestColor, worstColor, (+(coachRank / numberOfTeams)));
  }

  if (teamRank) {
    teamSupStyle.color = Color.lerpColor(bestColor, worstColor, (+(teamRank / numberOfTeams)));
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

  const handleSeason = (season_) => {
    // navigation.coachView({ season });
  };

  const seasonOptions = Object.values(Object.keys(season_x_team_id)).sort((a, b) => +b - +a).map((season_) => {
    const team = teams[season_x_team_id[season_]] || null;
    const tHelper = new HelperTeam({ team });
    return {
      value: season_.toString(),
      label: `${+season_ - 1} - ${+season_}`,
      sublabel: tHelper.getName(),
    };
  });

  console.log('season', season);
  console.log('lastSeason', lastSeason);

  // throw new Error(' todo start here do coachView navigation next')


  return (
    <Contents>
      <PrimaryLine>
        <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} type = {(width < breakPoint ? 'h6' : 'h5')}>
          {coachRank ? <span style = {supStyle}>{coachRank} </span> : ''}
          {`${coach.first_name} ${coach.last_name}`}
          <span style = {{ fontSize: '16px', verticalAlign: 'middle', display: 'inline-block', marginLeft: 5 }}>
            <Typography type = 'overline' style = {{ color: theme.text.secondary }}> ({coach_statistic_ranking?.wins || 0}-{coach_statistic_ranking?.losses || 0}){Organization.getCFBID() === organization_id ? '* since \'00' : ''}</Typography>
          </span>
        </Typography>
      </PrimaryLine>
      <SecondaryLine>
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>
          {teamRank ? <span style = {teamSupStyle}>{teamRank} </span> : ''}
          <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={handleTeamClick} href = {getTeamHref()}>{teamHelper.getName()}</a>
        </Typography>
        {!maxSeason ? <div>loading...</div> : <OptionPicker buttonName = {lastSeason ? lastSeason.toString() : 'Loading...'} options = {seasonOptions} selected = {[lastSeason.toString()]} actionHandler = {handleSeason} isRadio = {true} />}
      </SecondaryLine>
    </Contents>
  );
};

export { Client, ClientSkeleton };
