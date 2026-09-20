'use client';

import { Profiler, useEffect, useState } from 'react';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { getNavHeaderHeight } from '../../NavBar';
import { useClientAPI } from '@/components/clientAPI';
import MyGroups from './MyGroups';
import { useAppSelector } from '@/redux/hooks';
import PublicBracketsGroups from './PublicBracketsGroups';
import PublicDraftGroups from './PublicDraftGroups';
import CreateGroup from './CreateGroup';
import { Columns, LinearProgress, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';


interface Data {
  fantasy_groups: Fantasy.FantasyGroups;
  fantasy_group_users?: Fantasy.FantasyGroupUsers;
  fantasy_entrys?: Fantasy.FantasyEntrys;
}

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: 5 }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = getNavHeaderHeight();

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 84;
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

const Client = () => {
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const season = useAppSelector((state) => state.organizationReducer.season);
  const session_id = useAppSelector((state) => state.userReducer.session_id);

  const [request, setRequest] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    setLoaded(false);
    setRequest(false);
    setData(null);
  }, [session_id]);


  const loadHome = () => {
    setRequest(true);
    useClientAPI({
      class: 'fantasy_group',
      function: 'loadHome',
      arguments: {
        organization_id,
        division_id,
        season,
      },
    }).then((fantasyData: Data) => {
      setLoaded(true);
      setData(fantasyData);
    }).catch((err) => {
      // nothing for now
    });
  };

  if (!request) {
    loadHome();
  }

  if (!loaded) {
    return <ClientSkeleton />;
  }

  const my_fantasy_groups: Fantasy.FantasyGroups = {};
  if (
    data?.fantasy_group_users &&
    data.fantasy_groups
  ) {
    for (const fantasy_group_user_id in data.fantasy_group_users) {
      const row = data.fantasy_group_users[fantasy_group_user_id];
      if (row.fantasy_group_id in data.fantasy_groups) {
        my_fantasy_groups[row.fantasy_group_id] = data.fantasy_groups[row.fantasy_group_id];
      }
    }
  }

  const fantasy_group_id_x_fantasy_entrys: {[fantasy_group_id: string]: Fantasy.FantasyEntrys} = {};
  if (data?.fantasy_entrys) {
    for (const fantasy_entry_id in data.fantasy_entrys) {
      const row = data.fantasy_entrys[fantasy_entry_id];

      if (!(row.fantasy_group_id in fantasy_group_id_x_fantasy_entrys)) {
        fantasy_group_id_x_fantasy_entrys[row.fantasy_group_id] = {};
      }

      fantasy_group_id_x_fantasy_entrys[row.fantasy_group_id][fantasy_entry_id] = row;
    }
  }

  // const fantasy_group_type_terminology_id_x_public_fantasy_groups = {};
  const public_bracket_groups: Fantasy.FantasyGroups = {};
  const public_draft_groups: Fantasy.FantasyGroups = {};
  for (const fantasy_group_id in data?.fantasy_groups) {
    const row = data.fantasy_groups[fantasy_group_id];

    if (
      row.private === 1 ||
      !row.fantasy_group_type_terminology_id
    ) {
      continue;
    }

    // ncaa bracket
    if (row.fantasy_group_type_terminology_id === '3e72a9f3-e034-11f0-bc34-529c3ffdbb93') {
      public_bracket_groups[fantasy_group_id] = row;
    }

    // draft
    if (row.fantasy_group_type_terminology_id === '7ca1ccce-e033-11f0-bc34-529c3ffdbb93') {
      public_draft_groups[fantasy_group_id] = row;
    }

    // if (!(row.fantasy_group_type_terminology_id in fantasy_group_type_terminology_id_x_public_fantasy_groups)) {
    //   fantasy_group_type_terminology_id_x_public_fantasy_groups[row.fantasy_group_type_terminology_id] = {};
    // }

    // fantasy_group_type_terminology_id_x_public_fantasy_groups[row.fantasy_group_type_terminology_id][fantasy_group_id] = row;
  }


  return (
    <Profiler id="Fantasy.Contents.Home.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      <div style = {{ maxWidth: 1200, margin: 'auto' }}>
        <CreateGroup />
        <MyGroups fantasy_groups = {my_fantasy_groups} />
        <Columns style = {{ marginTop: 20 }}>
          <PublicBracketsGroups fantasy_groups = {public_bracket_groups} fantasy_group_id_x_fantasy_entrys = {fantasy_group_id_x_fantasy_entrys} />
          <PublicDraftGroups fantasy_groups = {public_draft_groups} fantasy_group_id_x_fantasy_entrys = {fantasy_group_id_x_fantasy_entrys} />
        </Columns>
      </div>
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
