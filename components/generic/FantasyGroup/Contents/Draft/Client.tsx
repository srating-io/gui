'use client';

import { Profiler } from 'react';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Title from './Title';
import DraftBoard from './DraftBoard';
import DraftZone from './DraftZone';
import Loader from '@/components/generic/Ranking/Contents/Loader';
import MyPicks from './MyPicks';
import { useNavigation } from '@/components/hooks/useNavigation';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { Button, Columns, LinearProgress, Tab, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';



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
  const paddingTop = 0;

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

const Client = ({ fantasy_group_id }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const subview = useAppSelector((state) => state.fantasyGroupReducer.subview);
  const { width } = useWindowDimensions();

  const getContents = () => {
    if (fantasy_group.drafted) {
      return (
        <>
          <Title />
          <div style = {{ textAlign: 'center' }}>
            <Button value = 'view-league' title = 'View league' onClick = {() => navigation.fantasyGroupView({ view: 'home' })} buttonStyle={{ backgroundColor: theme.info[theme.mode] }} />
          </div>
          <Columns>
            <MyPicks />
            <DraftBoard />
          </Columns>
        </>
      );
    }

    return (
      <>
        {
          fantasy_group &&
          fantasy_group.fantasy_group_id ?
          <Loader organization_id={fantasy_group.organization_id} division_id={fantasy_group.division_id} season = {fantasy_group.season} view = 'player' career={0} career_active={0} />
            : ''
        }
        {
          width <= 475 ?
            <>
              <div style = {{ textAlign: 'center' }}>
                <Tab key = {'draft-board'} title = {'Draft board'} value = {'draft_board'} selected = {subview === 'draft_board'} onClick={() => dispatch(setDataKey({ key: 'subview', value: 'draft_board' }))}/>
                <Tab key = {'draft-board'} title = {'Draft zone'} value = {'draft_zone'} selected = {subview === 'draft_zone'} onClick={() => dispatch(setDataKey({ key: 'subview', value: 'draft_zone' }))}/>
              </div>
              <Title />
              {
                subview === 'draft_board' &&
                <Columns>
                  <MyPicks />
                  <DraftBoard />
                </Columns>
              }
              {
                subview === 'draft_zone' && <DraftZone />
              }
            </>
            :
            <>
              <Title />
              <Columns>
                <MyPicks />
                <DraftBoard />
              </Columns>
              <DraftZone />
            </>
        }
      </>
    );
  };


  return (
    <Profiler id="FantasyGroup.Contents.Draft.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      {getContents()}
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
