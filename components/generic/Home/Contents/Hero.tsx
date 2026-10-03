'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { ChartScatter } from '@/components/generic/Chart';
import General from '@/components/helpers/General';
import { setLoading } from '@/redux/features/loading-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { scatterPoints, SEASON } from './Tour/data/ranking';
import { getMaxWidth, PRICING_ID } from '../ContentsWrapper';

/**
 * The top of the page.
 *
 * The visual is the ranking page's scatter, at full width, because it is the one chart on the site
 * that states the whole proposition without a caption: every team in the league, placed against
 * two measures at once, with the quadrants named. A table of numbers cannot do that, and the
 * quadrant labels do the work a paragraph of marketing copy otherwise would.
 *
 * Two teams are named rather than none. Past eighteen marks the plot stops labelling and leans on
 * hover, which on a landing page means a reader who never moves the mouse sees an anonymous cloud.
 */
const Hero = ({ path }: { path: string }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [, startTransition] = useTransition();

  const handleClick = (e: React.SyntheticEvent, to: string) => {
    e.preventDefault();
    dispatch(setLoading(true));

    startTransition(() => {
      router.push(to);
    });
  };

  const links = [
    { to: `/${path}/ranking`, title: 'Explore the rankings', primary: true },
    { to: `/${path}/projections`, title: 'See the projections', primary: false },
  ];

  /**
   * Straight to the price list, for the reader who came for that and nothing else.
   *
   * Scrolled to rather than linked, because the page scrolls inside a container of its own and a
   * fragment in the address bar would move the document instead - which here does nothing at all.
   * `scrollIntoView` walks whatever ancestor is actually scrolling, so it does not need to know
   * which one that is.
   */
  const handlePricing = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const pricing = document.getElementById(PRICING_ID);

    if (pricing) {
      pricing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // the plot keeps its shape on a phone by losing height rather than marks; below this it is a
  // band of dots, which is still the right picture, just a smaller one
  const chartHeight = width && width < 700 ? 240 : 320;

  return (
    <header style = {{ width: '100%', maxWidth: getMaxWidth(), margin: '0px auto', padding: '8px' }}>
      <Typography
        type = 'h2'
        style = {{ textAlign: 'center', color: theme.text.primary, fontWeight: 600, fontStyle: 'italic', marginBottom: 16 }}
      >
        <span style = {{ color: General.getLogoColorPrimary() }}>s</span>
        <span style = {{ color: General.getLogoColorSecondary() }}>Rating</span>
      </Typography>

      <Typography type = 'h5' style = {{ textAlign: 'center', color: theme.text.primary, marginBottom: 8 }}>
        Analysis tools &amp; projections for 🏀 &amp; 🏈
      </Typography>

      <Typography type = 'body1' style = {{ textAlign: 'center', color: theme.text.secondary, maxWidth: 620, margin: '0px auto 16px auto' }}>
        Rankings, trends and prediction tools for college basketball and football. API access from $25 a
        month, projections from $20/year. No ads,{' '}
        <a style = {{ color: theme.link.primary }} href = 'https://github.com/srating-io/gui' target = '_blank' rel = 'noreferrer'>open-source</a>.
      </Typography>

      <div style = {{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, margin: '0px 0px 18px 0px' }}>
        {links.map((link) => (
          <a
            key = {link.to}
            href = {link.to}
            onClick = {(e) => { handleClick(e, link.to); }}
            style = {{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 4,
              cursor: 'pointer',
              textDecoration: 'none',
              border: `1px solid ${theme.info.dark}`,
              backgroundColor: link.primary ? theme.info.dark : 'transparent',
              color: link.primary ? '#fff' : theme.link.primary,
            }}
          >
            <Typography type = 'body1' style = {{ color: 'inherit' }}>{link.title}</Typography>
          </a>
        ))}
        <a
          href = {`#${PRICING_ID}`}
          onClick = {handlePricing}
          style = {{ display: 'inline-flex', alignItems: 'center', padding: '8px 4px', cursor: 'pointer', textDecoration: 'none', color: theme.link.primary }}
        >
          <Typography type = 'body1' style = {{ color: 'inherit' }}>or see pricing</Typography>
        </a>
      </div>

      <Paper style = {{ width: '100%', padding: '10px 0px' }}>
        <ChartScatter
          points = {scatterPoints}
          xLabel = 'Offensive rating'
          yLabel = 'Defensive rating'
          yLowerIsBetter
          quadrantLabels = {{
            topLeft: 'Defence carries them',
            topRight: 'Strong both ends',
            bottomLeft: 'Struggling both ends',
            bottomRight: 'Offence carries them',
          }}
          height = {chartHeight}
        />
      </Paper>
      <Typography type = 'caption' style = {{ display: 'block', textAlign: 'center', color: theme.text.secondary, margin: '6px 0px 0px 0px' }}>
        {`Every Division I team, ${SEASON}. Real numbers, not a mock-up.`}
      </Typography>
    </header>
  );
};

export default Hero;
