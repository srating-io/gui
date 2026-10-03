'use client';

import InsightsIcon from '@esmalley/react-material-icons/Insights';

import { ChartCalibration } from '@/components/generic/Chart';

import Panel from './Panel';
import Section from './Section';
import { calibrationPoints, SEASON } from './data/team';
import { useTheme } from '@esmalley/react-material-ui';

/**
 * The projections tool, and the chart that audits it.
 *
 * The order is deliberate. Any site can print a number beside a game; the part worth advertising is
 * that this one publishes how often those numbers were right. So the section leads with the claim
 * and then hands the reader the chart that tests it - drawn from a real season, every game of it,
 * which is the only reason the claim is worth anything.
 *
 * The accuracy scatter that belongs beside this - projected margin against what actually happened -
 * is not here, because the stored projections carry no scores to plot it from. It goes in the
 * moment they do; nothing on this page is drawn from numbers invented to fill a panel.
 */
const Projections = ({ path }: { path: string }) => {
  const theme = useTheme();

  return (
    <Section
      eyebrow = 'The projections tool'
      headline = 'A win probability and a projected score for every game. And the receipts.'
      body = {
        'A model trained on twenty seasons - 75,000 basketball games and 20,000 football games - run ' +
        'against every scheduled fixture. Its record is published daily, and this is what it looked ' +
        `like across the whole of ${SEASON}.`
      }
      bullets = {[
        'Every scheduled game',
        'Projected score and margin',
        'A calculator',
        'Accuracy published daily',
      ]}
      icon = {<InsightsIcon style = {{ fontSize: 22, color: theme.success.dark }} />}
      href = {`/${path}/projections`}
      cta = 'Open the projections tool'
    >
      <Panel
        span = {3}
        reserve = {380}
        caption = 'When it says 70%, is it 70%? Claimed confidence against the rate that actually came in - below the line is too bold, above it too timid. A mark is sized by how many games sit behind that band.'
      >
        <ChartCalibration points = {calibrationPoints} height = {340} />
      </Panel>
    </Section>
  );
};

export default Projections;
