'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import SmartToyIcon from '@esmalley/react-material-icons/SmartToy';
import LaunchIcon from '@esmalley/react-material-icons/Launch';

import { setLoading } from '@/redux/features/loading-slice';
import { useAppDispatch } from '@/redux/hooks';
import { CodeBlock, Paper, Tab, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

import { getColumns, getMaxWidth } from '../Home/ContentsWrapper';

const MCP_URL = 'https://mcp.srating.io/mcp';
const DOCS_URL = 'https://docs.srating.io/mcp';
const CONNECT_ID = 'connect';

// prompts the nine tools can actually answer -- nothing that needs projections, which they do not return
const questions = [
  'Who are the top 10 college basketball teams right now?',
  'How has Duke played this season?',
  'What were the college football scores last Saturday?',
  'Who coaches Alabama football, and what is their record?',
  'How does the Big Ten compare to the SEC this season?',
  'What does elo mean on srating.io?',
];

/** Setup per client, copied from docs.srating.io/mcp so the two never disagree. */
const clients: { value: string; title: string; steps: string; code?: string; lang?: 'sh' | 'js' }[] = [
  {
    value: 'claude',
    title: 'Claude',
    steps: 'Open the connector directory, search for "srating" and add it. Works on claude.ai and in the Claude desktop and mobile apps. ' +
      'Or add a custom connector with this url:',
    code: MCP_URL,
    lang: 'sh',
  },
  {
    value: 'chatgpt',
    title: 'ChatGPT',
    steps: 'Turn on developer mode in settings, create a connector with this url, and set authentication to none.',
    code: MCP_URL,
    lang: 'sh',
  },
  {
    value: 'codex',
    title: 'Codex',
    steps: 'Add it from the command line, or in ~/.codex/config.toml.',
    code: `codex mcp add srating --url ${MCP_URL}\n\n# or in ~/.codex/config.toml\n[mcp_servers.srating]\nurl = "${MCP_URL}"`,
    lang: 'sh',
  },
  {
    value: 'claude_code',
    title: 'Claude Code',
    steps: 'One command:',
    code: `claude mcp add --transport http srating ${MCP_URL}`,
    lang: 'sh',
  },
  {
    value: 'json',
    title: 'Cursor & VS Code',
    steps: 'Any client configured with JSON takes the same block in its mcp.json:',
    code: `{\n  "mcpServers": {\n    "srating": {\n      "url": "${MCP_URL}"\n    }\n  }\n}`,
    lang: 'js',
  },
];

const tools = [
  { title: 'Rankings', body: 'The top teams in a division for any season, in srating.io order with elo ratings.' },
  { title: 'Scores', body: 'Every game on a date, with the score, clock and status.' },
  { title: 'Games', body: 'One game\'s result and team box score totals.' },
  { title: 'Teams', body: 'Conference, coach, elo rating and season stats, each ranked inside the division.' },
  { title: 'Players', body: 'Position and stats for a season or a whole career, ranked inside the division.' },
  { title: 'Coaches', body: 'Record and rating for a season or a career.' },
  { title: 'Conferences', body: 'Aggregate stats and rating, ranked among conferences.' },
  { title: 'Search', body: 'Teams, players and coaches by name, so the assistant can find the right one.' },
  { title: 'Stat definitions', body: 'What elo, aEM, aSOS and the rest mean, including the ones that read wrong.' },
];

const notes = [
  { title: 'Free, no sign-in', body: 'No account and no API key. Add it and ask.' },
  { title: 'Every answer links back', body: 'Results carry a srating.io link for each team, player, coach, conference and game.' },
  { title: 'College basketball and football', body: 'Men\'s basketball D1, D2 and D3, and football FBS and FCS. Seasons are named by their ending year.' },
  { title: 'Projections are not included', body: 'Win probability and projected scores stay on srating.io and in the API.' },
  { title: 'Capacity is shared', body: 'Everyone draws from one monthly allowance. For volume you can count on, use the API with your own key.' },
];

/**
 * The /ai landing page: what the MCP server is, how to connect it, and what it can reach.
 *
 * Everything here renders without the API, so it is the one marketing page a crawler always gets whole.
 */
const Contents = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [, startTransition] = useTransition();
  const [client, setClient] = useState(clients[0].value);

  const columns = getColumns(width);
  const selected = clients.find((row) => row.value === client) || clients[0];

  const sectionStyle: React.CSSProperties = { width: '100%', maxWidth: getMaxWidth(), margin: '0px auto', padding: '28px 8px 8px 8px' };
  const linkStyle: React.CSSProperties = { color: theme.link.primary, textDecoration: 'none', cursor: 'pointer' };

  const handleInternal = (e: React.SyntheticEvent, to: string) => {
    e.preventDefault();
    dispatch(setLoading(true));

    startTransition(() => {
      router.push(to);
    });
  };

  // the page scrolls inside its own container, so a fragment in the address bar would not move it
  const handleConnect = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = document.getElementById(CONNECT_ID);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getHeading = (title: string, body?: string) => (
    <>
      <Typography type = 'h5' style = {{ color: theme.text.primary, margin: '0px 0px 6px 0px' }}>{title}</Typography>
      {body ? <Typography type = 'body1' style = {{ color: theme.text.secondary, maxWidth: 680, margin: '0px 0px 14px 0px' }}>{body}</Typography> : ''}
    </>
  );

  const getExternal = (href: string, text: string) => (
    <a href = {href} target = '_blank' rel = 'noreferrer' style = {{ ...linkStyle, display: 'inline-flex', alignItems: 'center' }}>
      <Typography type = 'body1' style = {{ color: 'inherit' }}>{text}</Typography>
      <LaunchIcon style = {{ fontSize: 18, marginLeft: 4 }} />
    </a>
  );

  const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 10, alignItems: 'stretch' };

  return (
    <div style = {{ paddingBottom: 24 }}>
      <header style = {{ ...sectionStyle, padding: '24px 8px 8px 8px', textAlign: 'center' }}>
        <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0px 0px 6px 0px' }}>
          <SmartToyIcon style = {{ fontSize: 22, color: theme.primary.main, marginRight: 8 }} />
          <Typography type = 'overline' style = {{ color: theme.text.secondary, letterSpacing: 1 }}>AI assistants</Typography>
        </div>
        <Typography type = 'h4' style = {{ color: theme.text.primary, margin: '0px 0px 10px 0px' }}>
          Ask your AI assistant about college sports
        </Typography>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, maxWidth: 640, margin: '0px auto 16px auto' }}>
          Connect Claude, ChatGPT, Codex or Cursor to srating.io and get answers about college basketball and football from our data:
          rankings, scores, teams, players, coaches and conferences. Free, with no account and no API key.
        </Typography>

        <div style = {{ maxWidth: 520, margin: '0px auto 16px auto', textAlign: 'left' }}>
          <CodeBlock code = {MCP_URL} lang = 'sh' />
        </div>

        <div style = {{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <a
            href = {`#${CONNECT_ID}`}
            onClick = {handleConnect}
            style = {{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 4,
              cursor: 'pointer',
              textDecoration: 'none',
              border: `1px solid ${theme.info.dark}`,
              backgroundColor: theme.info.dark,
              color: '#fff',
            }}
          >
            <Typography type = 'body1' style = {{ color: 'inherit' }}>Set it up</Typography>
          </a>
          <span style = {{ padding: '8px 4px' }}>{getExternal(DOCS_URL, 'Read the docs')}</span>
        </div>
      </header>

      <section style = {sectionStyle}>
        {getHeading('Just ask', 'Your assistant chooses the right lookup, and every answer links back to the page on srating.io it came from.')}
        <div style = {grid}>
          {questions.map((question) => (
            <Paper key = {question} style = {{ padding: '12px 14px' }}>
              <Typography type = 'body1' style = {{ color: theme.text.primary, fontStyle: 'italic' }}>&ldquo;{question}&rdquo;</Typography>
            </Paper>
          ))}
        </div>
      </section>

      <section id = {CONNECT_ID} style = {sectionStyle}>
        {getHeading('Connect', 'It is a remote MCP server: streamable HTTP, no authentication. Pick your assistant.')}
        <div style = {{ display: 'flex', flexWrap: 'wrap', borderBottom: `1px solid ${theme.grey[theme.mode === 'dark' ? 800 : 300]}`, margin: '0px 0px 14px 0px' }}>
          {clients.map((row) => (
            <Tab
              key = {row.value}
              title = {row.title}
              value = {row.value}
              selected = {row.value === client}
              onClick = {() => { setClient(row.value); }}
            />
          ))}
        </div>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, maxWidth: 680, margin: '0px 0px 10px 0px' }}>{selected.steps}</Typography>
        {selected.code ? <div style = {{ maxWidth: 680 }}><CodeBlock code = {selected.code} lang = {selected.lang} /></div> : ''}
        <Typography type = 'body2' style = {{ color: theme.text.secondary, margin: '12px 0px 0px 0px' }}>
          Then try: <i>&ldquo;{questions[0]}&rdquo;</i>
        </Typography>
      </section>

      <section style = {sectionStyle}>
        {getHeading('What it can reach', 'Nine read-only tools covering both sports, current season by default and past seasons on request.')}
        <div style = {grid}>
          {tools.map((tool) => (
            <Paper key = {tool.title} style = {{ padding: '12px 14px' }}>
              <Typography type = 'subtitle1' style = {{ color: theme.text.primary }}>{tool.title}</Typography>
              <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{tool.body}</Typography>
            </Paper>
          ))}
        </div>
        <div style = {{ margin: '12px 0px 0px 0px' }}>{getExternal(`${DOCS_URL}/tools`, 'See every tool and argument')}</div>
      </section>

      <section style = {sectionStyle}>
        {getHeading('Good to know')}
        <div style = {grid}>
          {notes.map((note) => (
            <div key = {note.title}>
              <Typography type = 'subtitle1' style = {{ color: theme.text.primary }}>{note.title}</Typography>
              <Typography type = 'body2' style = {{ color: theme.text.secondary }}>{note.body}</Typography>
            </div>
          ))}
        </div>
      </section>

      <section style = {sectionStyle}>
        {getHeading(
          'Building something?',
          'The MCP server is for an assistant answering you. For your own code, the API has every endpoint, bulk downloads, ' +
          'live box scores and projections, metered per key, with a free trial that needs no card.',
        )}
        <div style = {{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          <a href = '/pricing?view=api' onClick = {(e) => { handleInternal(e, '/pricing?view=api'); }} style = {linkStyle}>
            <Typography type = 'body1' style = {{ color: 'inherit' }}>See API pricing</Typography>
          </a>
          {getExternal('https://docs.srating.io', 'Read the API docs')}
        </div>
      </section>

      <section style = {sectionStyle}>
        <Typography type = 'body2' style = {{ color: theme.text.secondary, maxWidth: 680 }}>
          The MCP server receives only the arguments your assistant sends, such as a team name or a date. It never sees your conversation
          and returns nothing about you. See the{' '}
          <a href = '/privacy' onClick = {(e) => { handleInternal(e, '/privacy'); }} style = {linkStyle}>privacy policy</a>, or write to{' '}
          <a href = 'mailto:contact@srating.io' style = {linkStyle}>contact@srating.io</a>.
        </Typography>
      </section>
    </div>
  );
};

export default Contents;
