'use client';

import { useClientAPI } from '@/components/clientAPI';
import useDebounce from '@/components/hooks/useDebounce';
import { useRef, useState } from 'react';
import SearchIcon from '@esmalley/react-material-icons/Search';
import { Textor } from '@esmalley/ts-utils';
import { Inputs, Menu, MenuOption, TextInput } from '@esmalley/react-material-ui';
import { Fantasy, General } from '@srating-io/types';


const TeamSearch = (
  {
    inputHandler,
    fantasy_group,
    handleSelect,
  }:
  {
    inputHandler: Inputs;
    fantasy_group: Fantasy.FantasyGroup;
    handleSelect: (team_id: string | null) => void;
  },
) => {
  const [teamSearchValue, setTeamSearchValue] = useState('');
  const [teams, setTeams] = useState<General.Team[]>([]);
  const [anchorTeam, setAnchorTeam] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Menu hands the whole option to onSelect, not its value. Taking the label off the option rather
  // than looking the team up again keeps this working regardless of the teams array.
  const handleTeamSelect = (option: MenuOption) => {
    if (!option || !option.value) {
      return;
    }

    setTeamMenuOpen(false);
    setTeamSearchValue(option.label || '');
    handleSelect(option.value as string);
  };

  const menuOptions: MenuOption[] = teams.map((row) => {
    return {
      value: row.team_id,
      selectable: true,
      label: row.alt_name || row.name,
      onSelect: handleTeamSelect,
    };
  });

  menuOptions.sort((a, b) => {
    if (a.label && b.label) {
      return Textor.levenshtein(teamSearchValue, a.label) - Textor.levenshtein(teamSearchValue, b.label);
    }
    return 0;
  });

  if (!menuOptions.length && loading && teamSearchValue) {
    menuOptions.push({
      value: null,
      selectable: false,
      disabled: true,
      label: 'Loading...',
      onSelect: handleTeamSelect,
      style: {
        textAlign: 'center',
        opacity: 1,
      },
    });
  }

  if (!menuOptions.length && !loading && teamSearchValue) {
    menuOptions.push({
      value: null,
      selectable: false,
      disabled: true,
      label: 'No results...',
      onSelect: handleTeamSelect,
      style: {
        textAlign: 'center',
        opacity: 1,
      },
    });
  }

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
        organization_id: fantasy_group.organization_id,
        division_id: fantasy_group.division_id,
        name: teamSearchValue,
        team: 1,
        player: 0,
        coach: 0,
      },
    }, { signal: controller.signal }).then((response) => {
      setTeams((response && response.teams) || []);
      setLoading(false);
    }).catch((e) => {
      // Ignore the error if we intentionally aborted it
      if (e.name === 'AbortError') {
        return;
      }
      setTeams([]);
      setLoading(false);
    });
  }, 200);


  return (
    <>
      <TextInput
        inputHandler={inputHandler}
        placeholder='Team search'
        variant='filled'
        clear
        icon = {<SearchIcon style = {{ fontSize: 20 }} />}
        style = {{ borderRadius: 5 }}
        value = {teamSearchValue}
        onClick={(e) => {
          setAnchorTeam(e.currentTarget);
          if (teamSearchValue.length) {
            setTeamMenuOpen(true);
          }
        }}
        onFocus={(e) => {
          setAnchorTeam(e.currentTarget);
          if (teamSearchValue.length) {
            setTeamMenuOpen(true);
          }
        }}
        onChange={(val) => {
          setTeamSearchValue(val as string);
          if (!val) {
            setTeams([]);
            setLoading(false);
            setTeamMenuOpen(false);
            handleSelect(null);
          } else if (val !== teamSearchValue) {
            setTeamMenuOpen(true);
            setLoading(true);
            debouncedRequest();
          }
        }}
        />
        <Menu
          open = {teamMenuOpen}
          options={menuOptions}
          anchor={anchorTeam}
          onClose={() => {
            setAnchorTeam(null);
            setTeamMenuOpen(false);
          }}
          style = {{ marginTop: 15, width: (anchorTeam?.clientWidth) }}
        />
      </>
  );
};

export default TeamSearch;
