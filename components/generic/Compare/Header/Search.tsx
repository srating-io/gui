'use client';

import { useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import SearchIcon from '@esmalley/react-material-icons/Search';

import useDebounce from '@/components/hooks/useDebounce';
import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/compare-slice';
import { Color, Textor } from '@esmalley/ts-utils';
import { Inputs, Menu, MenuOption, TextInput } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

const Search = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState('');
  const [teams, setTeams] = useState<General.Team[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const home_team_id = useAppSelector((state) => state.compareReducer.home_team_id); // || searchParams?.get('home_team_id') || null;
  const away_team_id = useAppSelector((state) => state.compareReducer.away_team_id); // || searchParams?.get('away_team_id') || null;
  const next_search = useAppSelector((state) => state.compareReducer.next_search);

  const abortControllerRef = useRef<AbortController | null>(null);

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
        team: 1,
        player: 0,
      },
      signal: controller.signal,
    }).then((response) => {
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

  const handleClick = (option: MenuOption) => {
    if (!option) {
      return;
    }

    const new_team_id = (option && option.value);

    if (new_team_id) {
      let key = next_search;

      if (!away_team_id) {
        key = 'away';
      } else if (!home_team_id) {
        key = 'home';
      }

      if (!key) {
        key = 'away';
      }

      if (key === 'away') {
        dispatch(setDataKey({ key: 'away_team_id', value: new_team_id }));
        dispatch(setDataKey({ key: 'next_search', value: 'home' }));
      } else if (key === 'home') {
        dispatch(setDataKey({ key: 'home_team_id', value: new_team_id }));
        dispatch(setDataKey({ key: 'next_search', value: 'away' }));
      }

      startTransition(() => {
        const current = new URLSearchParams(window.location.search);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.replace(`${pathName}${query}`);
      });

      setMenuOpen(false);
      setValue('');
      setTeams([]);
    }
  };


  const menuOptions: MenuOption[] = teams.map((team) => {
    return {
      value: team.team_id,
      selectable: true,
      label: team.alt_name || team.name,
      onSelect: handleClick,
    };
  }).sort((a, b) => {
    if (a.label && b.label) {
      return Textor.levenshtein(value, a.label) - Textor.levenshtein(value, b.label);
    }
    return 0;
  });

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

  const containerStyle = {
    height: 35,
    minWidth: 250,
    borderRadius: '4px',
    backgroundColor: Color.alphaColor('#fff', 0.15),
    '&:hover': {
      backgroundColor: Color.alphaColor('#fff', 0.25),
    },
    width: '100%',
  };

  return (
    <div>
      <TextInput
        style = {containerStyle}
        inputHandler={inputHandler}
        placeholder='Add a team'
        variant='filled'
        clear
        value = {value}
        showError = {false}
        transformPlaceholder = {false}
        icon = {<SearchIcon style = {{ fontSize: 20 }} />}
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

