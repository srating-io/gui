'use client';

import EmojiEventsIcon from '@esmalley/react-material-icons/EmojiEvents';

import { ChartCorrelationMatrix, ChartHistogram } from '@/components/generic/Chart';

import RankingExample from './examples/RankingExample';
import Panel from './Panel';
import Section from './Section';
import { correlationMeasures, marginMarker, marginValues, SEASON } from './data/ranking';
import { useTheme } from '@esmalley/react-material-ui';

/**
 * The ranking table, and the three charts that read it sideways.
 *
 * The table is the product's centre of gravity, so it is shown first and shown working - real
 * columns, real sorting, the heat map on. What follows are the questions a sorted column cannot
 * answer, each one a chart the table itself offers.
 */
const Rankings = ({ path }: { path: string }) => {
  const theme = useTheme();

  return (
    <Section
      eyebrow = 'The ranking table'
      headline = 'Every team, player, coach and conference, ranked on every metric.'
      body = {
        `Twenty seasons of college basketball and football - the ${SEASON} table is below. Sort on any ` +
        'column, filter to a conference or a position, search for anyone, and take the whole thing away as a CSV.'
      }
      bullets = {[
        'Teams, players, coaches, conferences and the transfer portal',
        'Any column, any season',
        'Conference, position and class filters',
        'CSV export',
        'color the table by rank',
      ]}
      icon = {<EmojiEventsIcon style = {{ fontSize: 22, color: theme.warning.dark }} />}
      href = {`/${path}/ranking`}
      cta = 'Open the rankings'
    >
      <Panel
        span = {2}
        reserve = {300}
        paper = {false}
      >
        <RankingExample showCta = {false} />
      </Panel>

      <Panel
        span = {1}
        reserve = {260}
        caption = 'Is twentieth good? Where the league bunches up, and where it spreads out.'
      >
        <ChartHistogram
          values = {marginValues}
          marker = {marginMarker}
          xLabel = 'Efficiency margin'
          noun = 'teams'
          height = {240}
        />
      </Panel>

      <Panel
        span = {2}
        reserve = {490}
        caption = 'Which numbers actually matter? Every measure against every other - and one sitting near zero is a statistic that tells nobody anything.'
      >
        <ChartCorrelationMatrix
          measures = {correlationMeasures}
          explanation = 'Darker means the two move together; the color says which way.'
        />
      </Panel>

    </Section>
  );
};

export default Rankings;
