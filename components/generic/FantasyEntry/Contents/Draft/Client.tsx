'use client';

import { useAppSelector } from '@/redux/hooks';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import GroupsIcon from '@esmalley/react-material-icons/Groups';
import CalendarMonthIcon from '@esmalley/react-material-icons/CalendarMonth';
import FormatListNumberedIcon from '@esmalley/react-material-icons/FormatListNumbered';
import Panel from '@/components/generic/Dashboard/Panel';
import Ranking from '@/components/generic/FantasyGroup/Contents/Home/Ranking';
import Roster from './Roster';
import { Games } from './Games';
import DraftRecap from './DraftRecap';
import Trends from './Trends';
import Summary from './Summary';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Tab, Typography, useTheme } from '@esmalley/react-material-ui';


const VIEWS = {
  OVERVIEW: 'overview',
  SCHEDULE: 'schedule',
  DRAFT: 'draft',
  TRENDS: 'trends',
  LEAGUE: 'league',
};

const TABS = [
  { value: VIEWS.OVERVIEW, title: 'Overview' },
  { value: VIEWS.SCHEDULE, title: 'Schedule' },
  { value: VIEWS.DRAFT, title: 'Draft recap' },
  { value: VIEWS.TRENDS, title: 'Trends' },
  { value: VIEWS.LEAGUE, title: 'League' },
];


const Client = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const view = useAppSelector((state) => state.fantasyEntryReducer.view);
  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entrys);
  const fantasy_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_rankings);
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

  const selected = TABS.some((tab) => tab.value === view) ? view : VIEWS.OVERVIEW;

  const handleView = (value: string) => {
    navigation.fantasyEntryView({ view: value });
  };

  const getTabContents = () => {
    if (selected === VIEWS.SCHEDULE) {
      // Each game is already its own Paper, so this section brings no surface of its own.
      return (
        <Panel icon = {<CalendarMonthIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Schedule' paper = {false}>
          <Games />
        </Panel>
      );
    }

    if (selected === VIEWS.DRAFT) {
      return (
        <Panel icon = {<FormatListNumberedIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Draft recap' paper = {true}>
          <DraftRecap />
        </Panel>
      );
    }

    if (selected === VIEWS.TRENDS) {
      return <Trends />;
    }

    // The league's own page carries this table too, but reaching it from here meant leaving the
    // entry. It gets a tab rather than the top of the overview, where it repeated that page.
    if (selected === VIEWS.LEAGUE) {
      return (
        <Ranking
          fantasy_group = {fantasy_group}
          fantasy_rankings = {fantasy_rankings}
          fantasy_entrys = {fantasy_entrys}
          highlight_fantasy_entry_id = {fantasy_entry.fantasy_entry_id}
        />
      );
    }

    return (
      <>
        <Summary />

        <Panel icon = {<GroupsIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Roster' paper = {false}>
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
      </>
    );
  };


  return (
    <div style={{ padding: 5, maxWidth: 1200, margin: 'auto' }}>
      {/* The tabs sit above everything. Below the roster they were far enough down the page that
          switching one moved them, which read as the page jumping. */}
      <div style = {{ textAlign: 'center' }}>
        {TABS.map((tab) => (
          <Tab
            key = {tab.value}
            title = {tab.title}
            value = {tab.value}
            selected = {selected === tab.value}
            onClick = {() => handleView(tab.value)}
          />
        ))}
      </div>

      {getTabContents()}
    </div>
  );
};

export { Client };
