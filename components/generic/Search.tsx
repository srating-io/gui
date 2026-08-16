'use client';

import { useRef, useState } from 'react';
import useDebounce from '@/components/hooks/useDebounce';
import SearchIcon from '@esmalley/react-material-icons/Search';

import { useClientAPI } from '../clientAPI';
import { useAppSelector } from '@/redux/hooks';
import Organization from '../helpers/Organization';
import Division from '../helpers/Division';
import { Color, Textor } from '@esmalley/ts-utils';
import { useNavigation } from '../hooks/useNavigation';
import { Inputs, Menu, MenuOption, TextInput, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';



const Search = (
  { onRouter, focus }:
  { onRouter?: () => void; focus: boolean },
) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });

  const abortControllerRef = useRef<AbortController | null>(null);

  let division_id: string | null = null;

  if (Organization.getCBBID() === organization_id) {
    division_id = Division.getD1();
  } else if (Organization.getNBAID() === organization_id) {
    division_id = Division.getNBA();
  } else if (Organization.getCFBID() === organization_id) {
    division_id = Division.getFBS();
  }


  type searchPlayer = General.Player & {
    begin: string;
    end: string;
  };

  type searchCoach = General.Coach & {
    begin: string;
    end: string;
  };

  const [value, setValue] = useState('');
  // const [autoCompleteValue, setAutoCompleteValue] = useState(null);
  const [teams, setTeams] = useState<General.Team[]>([]);
  const [players, setPlayers] = useState<searchPlayer[]>([]);
  const [coaches, setCoaches] = useState<searchCoach[]>([]);
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);
  const [loading, setLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [anchorSearch, setAnchorSearch] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const inputHandler = new Inputs();

  const menuStyle = {
    marginTop: 10,
    width: (anchorSearch?.clientWidth),
  };


  const debouncedRequest = useDebounce(() => {
    // Abort the previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    useClientAPI({
      class: 'search',
      function: 'search',
      arguments: {
        organization_id,
        division_id,
        name: value,
      },
      signal: controller.signal,
    }).then((response) => {
      setTeams((response && response.teams) || []);
      setPlayers((response && response.players) || []);
      setCoaches((response && response.coaches) || []);
      setLoading(false);
    }).catch((e) => {
      // Ignore the error if we intentionally aborted it
      if (e.name === 'AbortError') {
        return;
      }
      setTeams([]);
      setPlayers([]);
      setCoaches([]);
      setLoading(false);
    });
  }, 200);


  const handleClick = (option) => {
    if (!option || (!option.player_id && !option.team_id && !option.coach_id)) {
      return;
    }
    if (option && option.coach_id) {
      navigation.coach(`/${path}/coach/${option.coach_id}`, onRouter);
    } else if (option && option.player_id) {
      navigation.player(`/${path}/player/${option.player_id}`, onRouter);
    } else if (option && option.team_id) {
      navigation.team(`/${path}/team/${option.team_id}`, onRouter);
    }
    setMenuOpen(false);
    setValue('');
    setTeams([]);
    setPlayers([]);
    setCoaches([]);
  };



  const teamOptions: MenuOption[] = teams.map((team) => {
    return {
      group: 'Teams',
      value: team.team_id,
      selectable: true,
      label: team.alt_name || team.name,
      team_id: team.team_id,
      onSelect: handleClick,
    };
  });

  if (value.length) {
    teamOptions.sort((a, b) => {
      if (a.label && b.label) {
        return Textor.levenshtein(value, a.label) - Textor.levenshtein(value, b.label);
      }
      return 0;
    });
  }

  const playerOptions: MenuOption[] = players.map((player) => {
    return {
      group: 'Players',
      value: player.player_id,
      selectable: true,
      label: `${player.first_name} ${player.last_name} (${player.begin}-${player.end})`,
      player_id: player.player_id,
      onSelect: handleClick,
    };
  });

  if (value.length) {
    playerOptions.sort((a, b) => {
      if (a.label && b.label) {
        return Textor.levenshtein(value, a.label) - Textor.levenshtein(value, b.label);
      }
      return 0;
    });
  }

  const coachOptions: MenuOption[] = coaches.map((coach) => {
    return {
      group: 'Coaches',
      value: coach.coach_id,
      selectable: true,
      label: `${coach.first_name} ${coach.last_name} (${coach.begin}-${coach.end})`,
      coach_id: coach.coach_id,
      onSelect: handleClick,
    };
  });

  if (value.length) {
    coachOptions.sort((a, b) => {
      if (a.label && b.label) {
        return Textor.levenshtein(value, a.label) - Textor.levenshtein(value, b.label);
      }
      return 0;
    });
  }

  // todo include conferences in search, but needs to be filtered in js first
  // const conferenceOptions: MenuOption[] = Object.values(conferences).map((conference) => {
  //   return {
  //     group: 'Conference',
  //     coach_id: conference.conference_id,
  //     name: conference.name,
  //   };
  // });

  const menuOptions: MenuOption[] = [
    ...teamOptions,
    ...playerOptions,
    ...coachOptions,
  ];


  if (!menuOptions.length && loading && value) {
    menuOptions.push({
      value: null,
      selectable: false,
      disabled: true,
      label: 'Loading...',
      onSelect: handleClick,
      style: {
        textAlign: 'center',
        opacity: 1,
      },
    });
  }

  if (!menuOptions.length && !loading && value) {
    menuOptions.push({
      value: null,
      selectable: false,
      disabled: true,
      label: 'No results...',
      onSelect: handleClick,
      style: {
        textAlign: 'center',
        opacity: 1,
      },
    });
  }

  const standardWidth = 200;
  const expandedWidth = 250;

  const containerStyle: Record<string, unknown> = {
    height: 35,
    borderRadius: '4px',
    backgroundColor: Color.alphaColor('#fff', 0.15),
    '&:hover': {
      backgroundColor: Color.alphaColor('#fff', 0.25),
    },
    transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    width: '100%',
    '@media (min-width:600px)': {
      width: value ? expandedWidth : standardWidth,
      '&:focus': {
        width: expandedWidth,
      },
    },
  };

  const placeholderStyle: Record<string, unknown> = {};
  const clearIconStyle: Record<string, unknown> = {};
  const searchIconStyle: Record<string, unknown> = {
    fontSize: 24,
  };

  if (theme.mode === 'light') {
    placeholderStyle.color = '#fff';
    containerStyle.color = '#fff';
    clearIconStyle.color = theme.grey[300];
    searchIconStyle.color = '#fff';
  }


  return (
    <div>
      <TextInput
        style = {containerStyle}
        inputHandler={inputHandler}
        placeholderStyle={placeholderStyle}
        clearIconStyle={clearIconStyle}
        placeholder='Search'
        variant='filled'
        clear
        autoFocus = {focus}
        value = {value}
        showError = {false}
        transformPlaceholder = {false}
        icon = {<SearchIcon style = {searchIconStyle} />}
        onClick={(e) => {
          setAnchorSearch(e.currentTarget);
          if (value.length) {
            setMenuOpen(true);
          }
        }}
        onFocus={(e) => {
          setAnchorSearch(e.currentTarget);
          if (value.length) {
            setMenuOpen(true);
          }
        }}
        onChange={(val) => {
          setValue(val as string);
          if (!val) {
            setValue('');
            setTeams([]);
            setPlayers([]);
            setCoaches([]);
            setLoading(false);
            setMenuOpen(false);
          } else if (val !== value) {
            setMenuOpen(true);
            setLoading(true);
            debouncedRequest();
          }
        }}
      />
      <Menu
        open = {menuOpen}
        options={menuOptions}
        anchor={anchorSearch}
        onClose={() => {
          setAnchorSearch(null);
          setMenuOpen(false);
        }}
        style = {menuStyle}
      />
    </div>
  );
};

export default Search;

