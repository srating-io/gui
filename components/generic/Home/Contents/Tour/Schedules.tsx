'use client';

import EventIcon from '@esmalley/react-material-icons/Event';

import {
  ChartBandLine, ChartDivergingBars, ChartDumbbell, ChartRankStrip, ChartSequenceStrip, ChartSmallMultiples, getChartPalette, SmallMultiplePanel, SmallMultipleSeries,
} from '@/components/generic/Chart';
import GameFlow from '@/components/generic/Game/Contents/Charts/GameFlow';

import Panel from './Panel';
import Section from './Section';
import { gameFlowAway, gameFlowHome, gameFlowRows, gameFlowTitle, marketLineRows } from './data/game';
import { divergingBars, dumbbellRows, LEAGUE_SIZE, rankStripRows, SEASON, sequenceCells, TEAM_NAME } from './data/team';
import { trendRows } from './data/trends';
import { useTheme } from '@esmalley/react-material-ui';

/**
 * Teams, their schedules, and the games on them.
 *
 * The deepest part of the product and so the longest section, broken into the four questions a team
 * page actually gets asked rather than run as one wall of charts: how hard was the season, what are
 * they good at, what has been happening, and what was that one game like.
 *
 * Every panel is one real team's real season, so a reader is looking at a season rather than at six
 * unrelated demos - and the last two are a game from the end of that same season.
 */

/** The three statistics the trends snapshot carries, as a small-multiples grid. */
const panels: SmallMultiplePanel[] = [
  { key: 'adjusted_efficiency_rating', label: 'aEM', dataKey: 'adjusted_efficiency_rating' },
  { key: 'points', label: 'PTS', dataKey: 'points' },
  { key: 'three_point_field_goal_percentage', label: '3FG%', dataKey: 'three_point_field_goal_percentage' },
];

/**
 * The team against the two things worth measuring it by.
 *
 * Slots rather than positions: the color belongs to the entity, so the team is slot 0 wherever it
 * appears on this page and stays slot 0 if a reader switches one of the other two off.
 */
const series: SmallMultipleSeries[] = [
  { key: 'team', name: 'Team', prefix: '', slot: 0 },
  { key: 'conference', name: 'Conference', prefix: 'conf_', slot: 1 },
  { key: 'league', name: 'League', prefix: 'league_', slot: 2 },
];

const Schedules = ({ path }: { path: string }) => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  return (
    <Section
      eyebrow = 'Teams and schedules'
      headline = 'A whole season on one screen.'
      body = {
        'Every team gets a schedule, a full stat sheet with its standing on each line, and every ' +
        `statistic plotted over the year. Below is ${TEAM_NAME}'s ${SEASON}, and every game on that ` +
        'schedule has a page of its own too.'
      }
      bullets = {[
        'Every game, shaded by opponent',
        'A standing on every statistic',
        'Home and road splits',
        'The whole season plotted',
        'Live scores and game pages',
      ]}
      icon = {<EventIcon style = {{ fontSize: 22, color: theme.secondary.main }} />}
      href = {`/${path}/ranking`}
      cta = 'Browse the teams'
    >
      <Panel
        span = {3}
        reserve = {100}
        caption = {`How hard was the run? One cell per game, shaded by the opponent, with the result underneath - so all three of ${TEAM_NAME}'s losses falling among the dozen hardest games on it is something you see rather than work out.`}
      >
        <ChartSequenceStrip
          cells = {sequenceCells}
          title = {`${TEAM_NAME} ${SEASON}`}
          scaleLow = 'weaker'
          scaleHigh = 'stronger'
        />
      </Panel>

      <Panel
        span = {1}
        reserve = {230}
        caption = {`Second of what? Second of ${LEAGUE_SIZE} is a season worth remembering; second of eighteen is a conference. A position on a track carries both numbers at once.`}
      >
        <ChartRankStrip rows = {rankStripRows} max = {LEAGUE_SIZE} title = 'Where they rank' />
      </Panel>

      <Panel
        span = {1}
        reserve = {290}
        caption = 'What stands out, taken from both ends - so a team that finished near the top of the country is not just ten bars all saying "good".'
      >
        <ChartDivergingBars bars = {divergingBars} title = 'What stands out' limit = {10} />
      </Panel>

      <Panel
        span = {1}
        reserve = {180}
        caption = 'Same team, different week? Win rate at home against on the road, and inside the conference against everyone else, on one shared scale.'
      >
        <ChartDumbbell
          rows = {dumbbellRows}
          domain = {[0, 100]}
          fromLabel = 'home / conference'
          toLabel = 'road / non-conference'
          title = 'Same team, different week'
        />
      </Panel>

      {/* <Panel
        span = {3}
        reserve = {200}
        caption = 'Every statistic, a whole season each, on one shared clock - so a rise in one beside a fall in another is a single read rather than two charts a few seconds apart.'
      >
        <ChartSmallMultiples
          rows = {trendRows}
          panels = {panels}
          series = {series}
          xAxisDataKey = 'date_friendly'
        />
      </Panel>

      <Panel
        span = {2}
        reserve = {460}
        caption = {`Was it ever in doubt? The ${gameFlowTitle}: margin and win probability on one clock. Six points at the final buzzer, never more than eleven ahead, three behind inside the first half - and the market never once had ${gameFlowHome} below two in three.`}
      >
        <GameFlow
          rows = {gameFlowRows}
          homeColor = {palette.series(0)}
          awayColor = {palette.series(1)}
          homeName = {gameFlowHome}
          awayName = {gameFlowAway}
        />
      </Panel>

      <Panel
        span = {1}
        reserve = {280}
        caption = 'And what the market made of that same game while it ran: the consensus line with the gap between the books behind it. Where the band closes, they agree.'
      >
        <ChartBandLine
          rows = {marketLineRows}
          bandKey = 'range'
          lineKey = 'consensus'
          xAxisDataKey = 'time'
          yAxisLabel = 'Market line'
          height = {280}
        />
      </Panel> */}
    </Section>
  );
};

export default Schedules;
