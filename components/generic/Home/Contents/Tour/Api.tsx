'use client';

import DataObjectIcon from '@esmalley/react-material-icons/DataObject';

import Section from './Section';
import { CodeBlock, Paper, useTheme } from '@esmalley/react-material-ui';

/**
 * API access.
 *
 * The one section with no chart in it, and the only one whose preview is the thing itself. Until
 * now the API's entire presence on this page was a tile that linked to the price list, which asks
 * a developer to buy before they have seen the shape of a single request.
 *
 * The snippet is the real call - one endpoint, one body of class, function and arguments, the key
 * in a header - because the pitch here is that there is nothing more to it than that.
 */
/**
 * The endpoint is read from the environment rather than written in.
 *
 * The base url is not in this repository - only the development host is - and a marketing page is
 * the last place to guess at one. The docs this section links to carry the real address, and a
 * snippet that reads it from a variable is what a developer would write anyway.
 */
const snippet = `curl "https://api.srating.io/v1" \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "class": "game",
    "function": "getGames",
    "arguments": {
      "organization_id": "f1c37c98-3b4c-11ef-94bc-2a93761010b8",
      "division_id": "bf602dc4-3b4a-11ef-94bc-2a93761010b8",
      "start_date": "2023-04-03"
    }
  }'`;

const Api = () => {
  const theme = useTheme();

  return (
    <Section
      eyebrow = 'API access'
      headline = 'Pull every data point yourself.'
      body = {
        'The same data behind every page on this site, over one endpoint. One request shape, one ' +
        'header, and a free trial that needs no card.'
      }
      bullets = {[
        'Games, teams, players, stats and live scores',
        'Projections included from Basic',
        'CSV downloads',
        'Free trial, 500 calls',
      ]}
      icon = {<DataObjectIcon style = {{ fontSize: 22, color: theme.warning.main }} />}
      href = 'https://docs.srating.io'
      cta = 'Read the API docs'
      external
    >
      <div style = {{ gridColumn: '1 / -1' }}>
        <CodeBlock code = {snippet} lang = 'sh' />
      </div>
    </Section>
  );
};

export default Api;
