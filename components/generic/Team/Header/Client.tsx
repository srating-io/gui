'use client';

import { useTransition } from 'react';

import FavoritePicker from '@/components/generic/FavoritePicker';
import HelperTeam from '@/components/helpers/Team';
import HelperGeneral from '@/components/helpers/General';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import OptionPicker from '@/components/generic/OptionPicker';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { setLoading } from '@/redux/features/loading-slice';
import Organization from '@/components/helpers/Organization';
import { Color } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Skeleton, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';
import { CustomizedTeam } from '@/types/general';


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
        <Skeleton style = {{ width: 200, height: 28 }} />
      </SecondaryLine>
    </Contents>
  );
};

const Client = (
  {
    team,
    season,
    organization_id,
    division_id,
    seasons,
    coach,
    coach_statistic_ranking,
    conference_statistic_ranking,
  }:
  {
    team: CustomizedTeam,
    season: number,
    organization_id: string,
    division_id: string,
    seasons: number[],
    coach: General.Coach | null,
    coach_statistic_ranking: General.CoachStatisticRanking | null,
    conference_statistic_ranking: Basketball.ConferenceStatisticRanking | Football.ConferenceStatisticRanking
  },
) => {
  const breakPoint = 475;

  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const { width } = useWindowDimensions();
  const [isPending, startTransition] = useTransition();

  const displayRank = useAppSelector((state) => state.displayReducer.rank);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);
  const path = Organization.getPath({ organizations, organization_id });
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });

  const teamHelper = new HelperTeam({ team });

  const conferenceName = teamHelper.getConference(conferences);
  const conferenceNumber = Organization.getNumberOfConferences({ organization_id, division_id, season });

  const bestColor = HelperGeneral.getBestColor();
  const worstColor = HelperGeneral.getWorstColor();


  const supStyle: React.CSSProperties = {
    fontSize: (width < breakPoint ? '12px' : '16px'),
    verticalAlign: 'super',
  };

  const coachSupStyle: React.CSSProperties = {
    fontSize: '10px',
    verticalAlign: 'super',
  };

  const conferenceSupStyle: React.CSSProperties = {
    fontSize: '10px',
    verticalAlign: 'super',
  };

  const rank = teamHelper.getRank(displayRank);
  const coachRank = coach_statistic_ranking ? coach_statistic_ranking.rank : null;
  const conferenceRank = conference_statistic_ranking.rank;

  if (rank) {
    supStyle.color = Color.lerpColor(bestColor, worstColor, (+(rank / numberOfTeams)));
  }

  if (coachRank) {
    coachSupStyle.color = Color.lerpColor(bestColor, worstColor, (+(coachRank / numberOfTeams)));
  }

  if (conferenceRank) {
    conferenceSupStyle.color = Color.lerpColor(bestColor, worstColor, (+(conferenceRank / conferenceNumber)));
  }

  const handleSeason = (newSeason) => {
    if (newSeason !== season) {
      if (searchParams) {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('season', newSeason);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        dispatch(setLoading(true));
        startTransition(() => {
          router.push(`${pathName}${query}`);
        });
      }
    }
  };

  const seasonOptions = seasons.sort((a, b) => b - a).map((value) => {
    return {
      value: value.toString(),
      label: `${value - 1} - ${value}`,
    };
  });

  const getCoachHref = () => {
    return `/${path}/coach/${coach?.coach_id}`/* +'?season='+season */;
  };

  const handleCoach = (e) => {
    e.preventDefault();
    navigation.coach(getCoachHref());
  };

  const getConferenceHref = () => {
    return `/${path}/conference/${team.conference_id}?season=${season}`;
  };

  const handleConference = (e) => {
    e.preventDefault();
    navigation.conference(getConferenceHref());
  };

  return (
    <Contents>
      <PrimaryLine>
        <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} type = {(width < breakPoint ? 'h6' : 'h5')}>
          {rank ? <span style = {supStyle}>{rank} </span> : ''}
          {teamHelper.getName()}
          <span style = {{ fontSize: '16px', verticalAlign: 'middle', display: 'inline-block', marginLeft: 5 }}>
            <Typography type = 'overline' style = {{ color: theme.text.secondary }}> ({team?.stats?.wins || 0}-{team?.stats?.losses || 0})</Typography>
          </span>
        </Typography>
        <FavoritePicker team_id = {team?.team_id} />
        <OptionPicker buttonName = {season.toString()} options = {seasonOptions} selected = {[season.toString()]} actionHandler = {handleSeason} isRadio = {true} />
      </PrimaryLine>
      <SecondaryLine>
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>{conferenceRank ? <span style = {conferenceSupStyle}>{conferenceRank} </span> : ''}<a onClick = {handleConference} href = {getConferenceHref()} style={{ cursor: 'pointer', color: theme.link.primary }}>{conferenceName}</a> | {coachRank ? <span style = {coachSupStyle}>{coachRank} </span> : ''}{coach ? <a onClick = {handleCoach} href = {getCoachHref()} style={{ cursor: 'pointer', color: theme.link.primary }}>{`${coach.first_name.charAt(0)}. ${coach.last_name}`}</a> : 'UNKNOWN'}</Typography>
      </SecondaryLine>
    </Contents>
  );
};

export { Client, ClientSkeleton };
