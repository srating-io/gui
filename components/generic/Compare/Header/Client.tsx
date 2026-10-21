'use client';

import React, { useTransition } from 'react';


import HelperTeam from '@/components/helpers/Team';
import Url from '@/components/helpers/Url';
import { getBreakPoint } from '@/components/generic/Compare/Header/ClientWrapper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import HighlightOffIcon from '@esmalley/react-material-icons/HighlightOff';
import SwapHorizIcon from '@esmalley/react-material-icons/SwapHoriz';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { setDataKey } from '@/redux/features/compare-slice';
import Organization from '@/components/helpers/Organization';
import General from '@/components/helpers/General';
import { Color } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { IconButton, Skeleton, Typography, Tooltip, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';


const Client = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const breakPoint = getBreakPoint();
  const bestColor = General.getBestColor();
  const worstColor = General.getWorstColor();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const dispatch = useAppDispatch();
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });
  const displayRank = useAppSelector((state) => state.displayReducer.rank);
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);
  const home_team_id = useAppSelector((state) => state.compareReducer.home_team_id);
  const away_team_id = useAppSelector((state) => state.compareReducer.away_team_id);
  const season = useAppSelector((state) => state.compareReducer.season);
  const teams = useAppSelector((state) => state.compareReducer.teams);
  const neutral_site = useAppSelector((state) => state.compareReducer.neutral_site);
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });

  const handleRemove = (team_id: string) => {
    if (team_id === home_team_id) {
      dispatch(setDataKey({ key: 'home_team_id', value: null }));
    } else if (team_id === away_team_id) {
      dispatch(setDataKey({ key: 'away_team_id', value: null }));
    }

    startTransition(() => {
      const current = new URLSearchParams(window.location.search);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathName}${query}`);
    });
  };

  const handleSwap = () => {
    if (home_team_id && away_team_id) {
      dispatch(setDataKey({ key: 'home_team_id', value: away_team_id }));
      dispatch(setDataKey({ key: 'away_team_id', value: home_team_id }));

      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('home_team_id', away_team_id);
      current.set('away_team_id', home_team_id);
      window.history.replaceState(null, '', `?${current.toString()}`);


      const search = current.toString();
      const query = search ? `?${search}` : '';
      startTransition(() => {
        router.replace(`${pathName}${query}`);
      });
    }
  };

  const getTeamHref = (team_id: string) => {
    return Url.team({ sport: path, team: teams?.[team_id], slug: team_id, season });
  };

  const handleTeamClick = (e, team_id: string) => {
    e.preventDefault();
    navigation.team(getTeamHref(team_id));
  };

  const getTeam = (team_id: string) => {
    const team = teams[team_id];
    const teamHelper = new HelperTeam({ team });
    const rank = teamHelper.getRank(displayRank);

    let justifyContent = 'right';
    let teamName = teamHelper.getName();

    if (team_id === away_team_id) {
      justifyContent = 'left';
    }

    if (width < breakPoint) {
      teamName = teamHelper.getNameShort();
    }

    const supStyle: React.CSSProperties = {
      fontSize: 12,
      verticalAlign: 'super',
    };

    if (rank) {
      supStyle.color = Color.lerpColor(bestColor, worstColor, (+(rank / numberOfTeams)));
    }

    const getRemoveButton = () => {
      return (
        <div>
          <Tooltip onClickRemove text = {'Remove team'}>
            <IconButton
              value = 'remove-button'
              onClick = {() => { handleRemove(team_id); }}
              icon = {<HighlightOffIcon style = {{ fontSize: 24, color: theme.error.main }} />}
            />
          </Tooltip>
        </div>
      );
    };

    let headerText = (team_id === home_team_id ? 'Home' : 'Away');
    if (neutral_site) {
      headerText = 'Neutral';
    }

    return (
      <div style = {{ display: 'flex', alignItems: 'center' }}>
        {team_id === home_team_id ? getRemoveButton() : ''}
        <div>
          <div style = {{ display: 'flex', justifyContent }}>
            <Typography type = 'overline' style = {{ lineHeight: 'initial', color: theme.text.secondary }}>{headerText}</Typography>
          </div>
          <div style = {{ display: 'flex', flexWrap: 'nowrap', justifyContent }}>
            <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} type = {'h6'}>
              {rank ? <span style = {supStyle}>{rank} </span> : ''}
              <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { handleTeamClick(e, team_id); }} href = {getTeamHref(team_id)}>{teamName}</a>
            </Typography>
          </div>
          <div style = {{ display: 'flex', justifyContent }}>
            <Typography type = 'overline' style = {{ lineHeight: 'initial', color: theme.text.secondary }}>{(width > breakPoint ? `${team && team.conference_id && team.conference_id in conferences ? conferences[team.conference_id].code : ''} ` : '')}({team?.stats?.wins || 0}-{team?.stats?.losses || 0})</Typography>
          </div>
        </div>
        {team_id === away_team_id ? getRemoveButton() : ''}
      </div>
    );
  };

  const nameStyle: React.CSSProperties = {
    maxWidth: width < breakPoint ? 175 : 'initial',
    minWidth: 100,
  };

  let homeNameElement = <Skeleton style={{ height: 60, transform: 'initial' }} />;
  if (!home_team_id) {
    homeNameElement = <Typography type='body1'>{'Pick a home team'}</Typography>;
  } else if (home_team_id in teams) {
    homeNameElement = getTeam(home_team_id);
  }

  let awayNameElement = <Skeleton style={{ height: 60, transform: 'initial' }} />;
  if (!away_team_id) {
    awayNameElement = <Typography type='body1'>{'Pick an away team'}</Typography>;
  } else if (away_team_id in teams) {
    awayNameElement = getTeam(away_team_id);
  }


  return (
    <div style = {{ display: 'flex', justifyContent: 'space-between', padding: '0px 5px', alignItems: 'center' }}>
      <div style = {nameStyle}>
        {awayNameElement}
      </div>
      <div>
        {
        home_team_id && away_team_id ?
          <Tooltip onClickRemove text = {'Swap teams'}>
            <IconButton
              value = 'swap-button'
              onClick = {handleSwap}
              icon = {<SwapHorizIcon style = {{ fontSize: 24 }} />}
            />
          </Tooltip>
          : ''
        }
      </div>
      <div style = {nameStyle}>
        {homeNameElement}
      </div>
    </div>
  );
};

export default Client;
