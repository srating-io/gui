'use client';

import { useAppSelector } from '@/redux/hooks';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import GroupsIcon from '@esmalley/react-material-icons/Groups';
import CalendarMonthIcon from '@esmalley/react-material-icons/CalendarMonth';
import FormatListNumberedIcon from '@esmalley/react-material-icons/FormatListNumbered';
import Header from '@/components/generic/FantasyEntry/Header/Client';
import Panel from '@/components/generic/Dashboard/Panel';
import Roster from './Roster';
import { Games } from './Games';
import DraftRecap from './DraftRecap';
import Trends from './Trends';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Tab, Typography, useTheme } from '@esmalley/react-material-ui';


const VIEWS = {
  SCHEDULE: 'schedule',
  DRAFT: 'draft',
  TRENDS: 'trends',
};


const Client = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const view = useAppSelector((state) => state.fantasyEntryReducer.view);
  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_players);
  const player_team_seasons = useAppSelector((state) => state.fantasyEntryReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyEntryReducer.players);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_player_statistic_rankings);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyEntryReducer.fantasy_draft_orders);

  // `drafted` is only set by the final pick, so keying the empty state off it said "not started"
  // for the whole draft. Once the group is locked the roster fills pick by pick, so show it.
  if (!fantasy_group.locked && !fantasy_group.drafted) {
    return (
      <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
        <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Draft has not started yet!</Typography>
      </div>
    );
  }

  const selected = Object.values(VIEWS).includes(view) ? view : VIEWS.SCHEDULE;

  const handleView = (value: string) => {
    navigation.fantasyEntryView({ view: value });
  };

  const getTabContents = () => {
    if (selected === VIEWS.DRAFT) {
      return (
        <Panel icon = {<FormatListNumberedIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Draft recap'>
          <DraftRecap />
        </Panel>
      );
    }

    if (selected === VIEWS.TRENDS) {
      return <Trends />;
    }

    return (
      <Panel icon = {<CalendarMonthIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Schedule'>
        <Games />
      </Panel>
    );
  };


  return (
    <div style={{ padding: 5, maxWidth: 1200, margin: 'auto' }}>
      <Header />

      <Panel icon = {<GroupsIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Roster'>
        <Roster
          fantasy_entry={fantasy_entry}
          fantasy_group = {fantasy_group}
          fantasy_entry_players={fantasy_entry_players}
          player_team_seasons={player_team_seasons}
          players={players}
          fantasy_entry_player_statistic_rankings={fantasy_entry_player_statistic_rankings}
          fantasy_draft_orders={fantasy_draft_orders}
          showName={false}
        />
      </Panel>

      <div style = {{ textAlign: 'center', marginTop: 16 }}>
        <Tab
          key = 'schedule'
          title = 'Schedule'
          value = {VIEWS.SCHEDULE}
          selected = {selected === VIEWS.SCHEDULE}
          onClick = {() => handleView(VIEWS.SCHEDULE)}
        />
        <Tab
          key = 'draft'
          title = 'Draft recap'
          value = {VIEWS.DRAFT}
          selected = {selected === VIEWS.DRAFT}
          onClick = {() => handleView(VIEWS.DRAFT)}
        />
        <Tab
          key = 'trends'
          title = 'Trends'
          value = {VIEWS.TRENDS}
          selected = {selected === VIEWS.TRENDS}
          onClick = {() => handleView(VIEWS.TRENDS)}
        />
      </div>

      {getTabContents()}
    </div>
  );
};

export { Client };
