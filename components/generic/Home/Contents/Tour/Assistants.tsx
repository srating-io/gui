'use client';

import SmartToyIcon from '@esmalley/react-material-icons/SmartToy';

import Section from './Section';
import { CodeBlock, useTheme } from '@esmalley/react-material-ui';

/**
 * The MCP server, for people who would rather ask than browse.
 *
 * Like the API tab its preview is the thing itself: the url is the whole setup in most clients.
 */
const snippet = `https://mcp.srating.io/mcp

# or in Claude Code
claude mcp add --transport http srating https://mcp.srating.io/mcp`;

const Assistants = () => {
  const theme = useTheme();

  return (
    <Section
      eyebrow = 'AI assistants'
      headline = 'Ask Claude or ChatGPT. Get srating.io answers.'
      body = {
        'Connect your AI assistant to srating.io and ask about rankings, scores, teams, players and coaches in plain ' +
        'English. Free, with no account and no API key.'
      }
      bullets = {[
        'Works in Claude, ChatGPT, Codex and Cursor',
        'College basketball and football',
        'Every answer links back to srating.io',
        'Free, no sign-in',
      ]}
      icon = {<SmartToyIcon style = {{ fontSize: 22, color: theme.primary.main }} />}
      href = '/ai'
      cta = 'Set it up'
    >
      <div style = {{ gridColumn: '1 / -1' }}>
        <CodeBlock code = {snippet} lang = 'sh' />
      </div>
    </Section>
  );
};

export default Assistants;
