'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import ArrowForwardIcon from '@esmalley/react-material-icons/ArrowForward';
import LaunchIcon from '@esmalley/react-material-icons/Launch';

import { setLoading } from '@/redux/features/loading-slice';
import { useAppDispatch } from '@/redux/hooks';
import { Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { getColumns, getMaxWidth } from '../../ContentsWrapper';

/**
 * One tool, on the tour.
 *
 * Every section on the landing page is this component with different content, so none of them can
 * drift into being laid out slightly differently from its neighbours - which is the usual fate of
 * a long marketing page assembled one block at a time.
 *
 * The shape is: what the tool is called, what it does, what it can do, then the charts that live
 * inside it, then a way in. The previews come last of the reading order but first in the eye, and
 * that is the intent - a reader who only looks at pictures should still end up at the link.
 */
const Section = (
  {
    eyebrow,
    headline,
    body,
    bullets,
    icon,
    href,
    cta,
    /** Opens in a new tab and takes the launch glyph. For the docs, which are not this app. */
    external = false,
    children,
  }:
  {
    eyebrow: string;
    headline: string;
    body: string;
    bullets?: string[];
    icon: React.JSX.Element;
    href: string;
    cta: string;
    external?: boolean;
    children: React.ReactNode;
  },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [, startTransition] = useTransition();

  const columns = getColumns(width);

  /**
   * The link is a real anchor that is then handled in the client.
   *
   * The href has to be there whether or not the click is intercepted: it is what a crawler reads,
   * what a middle click opens, and what the status bar shows on hover. The interception is only
   * so an internal move is a transition rather than a page load.
   */
  const handleClick = (e: React.SyntheticEvent) => {
    if (external) {
      return;
    }

    e.preventDefault();
    dispatch(setLoading(true));

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <section style = {{ width: '100%', maxWidth: getMaxWidth(), margin: '0px auto', padding: '28px 8px 8px 8px' }}>
      <div style = {{ display: 'flex', alignItems: 'center', margin: '0px 0px 4px 0px' }}>
        <span style = {{ display: 'flex', marginRight: 8 }}>{icon}</span>
        <Typography type = 'overline' style = {{ color: theme.text.secondary, letterSpacing: 1 }}>{eyebrow}</Typography>
      </div>
      <Typography type = 'h5' style = {{ color: theme.text.primary, margin: '0px 0px 6px 0px' }}>{headline}</Typography>
      <Typography type = 'body1' style = {{ color: theme.text.secondary, maxWidth: 680, margin: '0px 0px 10px 0px' }}>{body}</Typography>

      {
        bullets && bullets.length ?
          <div style = {{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', margin: '0px 0px 14px 0px' }}>
            {bullets.map((bullet) => (
              <div key = {bullet} style = {{ display: 'flex', alignItems: 'baseline' }}>
                {/* the dot is a bullet rather than a tick: these are capabilities, not a checklist
                    against somebody else's product */}
                <span style = {{ color: theme.primary.main, marginRight: 6 }}>&middot;</span>
                <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{bullet}</Typography>
              </div>
            ))}
          </div> :
          ''
      }

      <div style = {{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 10, alignItems: 'start' }}>
        {children}
      </div>

      <div style = {{ margin: '12px 0px 0px 0px' }}>
        <a
          href = {href}
          onClick = {handleClick}
          target = {external ? '_blank' : undefined}
          rel = {external ? 'noreferrer' : undefined}
          style = {{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: theme.link.primary, textDecoration: 'none' }}
        >
          <Typography type = 'body1' style = {{ color: 'inherit' }}>{cta}</Typography>
          {
            external ?
              <LaunchIcon style = {{ fontSize: 18, marginLeft: 4 }} /> :
              <ArrowForwardIcon style = {{ fontSize: 18, marginLeft: 4 }} />
          }
        </a>
      </div>
    </section>
  );
};

export default Section;
