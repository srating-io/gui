
export const dynamic = 'force-dynamic';

import { Typography } from '@esmalley/react-material-ui';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'sRating | Privacy policy',
  description: 'College basketball & football sports data API',
  openGraph: {
    title: 'sRating.io college basketball + football API',
    description: 'College basketball & football sports data API',
  },
  twitter: {
    card: 'summary',
    title: 'College basketball & football sports data API',
  },
};

const Privacy = () => {
  return (
    <div>
      <main>
        <div style = {{ padding: 20 }}>
          <Typography type='h5'>SRATING PRIVACY POLICY</Typography>
          <Typography type='body1'>Welcome to srating.io. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</Typography>
          <br />

          <Typography type='h6'>1. Information We Collect</Typography>
          <br />
          <Typography type='body1'>We may collect information in the following ways:</Typography>
          <br />
          <Typography type='body1'>Voluntary Information: Email addresses, usernames, or profile details provided when you register or interact with the rating system.</Typography>
          <Typography type='body1'>Usage Data: IP addresses, browser types, and pages visited, collected automatically via cookies to improve site performance.</Typography>
          <Typography type='body1'>Content: Any ratings, reviews, or comments you publicly post on the platform.</Typography>
          <br />

          <Typography type='h6'>2. How We Use Your Information</Typography>
          <br />
          <Typography type='body1'>We use the data we collect to:</Typography>
          <br />
          <Typography type='body1'>Provide and maintain the srating.io platform.</Typography>
          <Typography type='body1'>Personalize your user experience.</Typography>
          <Typography type='body1'>Monitor site usage and detect technical issues or fraudulent activity.</Typography>
          <Typography type='body1'>Communicate with you regarding updates or support.</Typography>
          <br />

          <Typography type='h6'>3. Data Sharing and Disclosure</Typography>
          <br />
          <Typography type='body1'>We do not sell your personal data. We may share information only in these limited cases:</Typography>
          <br />
          <Typography type='body1'>Service Providers: With trusted third parties who help us run the site (e.g., hosting providers).</Typography>
          <Typography type='body1'>Legal Requirements: If required by law to comply with legal obligations or protect our rights.</Typography>
          <Typography type='body1'>Public Interaction: Comments you post are visible to other users of the site.</Typography>
          <br />

          <Typography type='h6'>4. AI Assistant Connector</Typography>
          <br />
          <Typography type='body1'>Our MCP server at mcp.srating.io lets AI assistants such as Claude, ChatGPT and Codex look up srating.io data. It applies to you only if you connect it to an assistant.</Typography>
          <br />
          <Typography type='body1'>What it receives: only the arguments the assistant sends with each request, such as a team name, a sport or a date. It does not receive your conversation, your assistant account, or any files, and it has no sign-in.</Typography>
          <Typography type='body1'>What it returns: the same public sports data shown on srating.io, such as scores, rankings, and published statistics for teams, players and coaches. It returns nothing about you.</Typography>
          <Typography type='body1'>What it keeps: results are cached briefly and shared by everyone using the connector, so they are not tied to you. Like the rest of the site, our server logs record IP addresses and request times, which we use to keep the service running and to prevent abuse.</Typography>
          <Typography type='body1'>The assistant you use is operated by its own provider, and its handling of your conversation is governed by that provider's privacy policy.</Typography>
          <br />

          <Typography type='h6'>5. Data Security</Typography>
          <br />
          <Typography type='body1'>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</Typography>
          <br />

          <Typography type='h6'>6. Your Rights</Typography>
          <br />
          <Typography type='body1'>Depending on your location, you may have the right to:</Typography>
          <br />
          <Typography type='body1'>Access the personal data we hold about you.</Typography>
          <Typography type='body1'>Request the deletion of your account and associated data.</Typography>
          <br />

          <Typography type='h6'>7. Changes to This Policy</Typography>
          <br />
          <Typography type='body1'>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date."</Typography>
          <br />

          <Typography type='h6'>8. Contact Us</Typography>
          <br />
          <Typography type='body1'>If you have any questions about this Privacy Policy, please contact us at: contact@srating.io</Typography>

          <br />
          <Typography type='body1'>Effective Date: November 23, 2026</Typography>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
