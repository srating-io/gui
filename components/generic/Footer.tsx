'use client';

import { Typography, useTheme } from '@esmalley/react-material-ui';


const Footer = () => {
  const theme = useTheme();
  const hash = process.env.COMMIT_HASH;
  const commitDate = process.env.COMMIT_DATE;


  return (
    <div>
      <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.text.secondary }}
        >
          🚂Boiler up!🚂
        </Typography>
      </div>
      {/* <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.text.secondary }}
        >
          Data from <a underline="hover" href = "https://stats.ncaa.org" target = "_blank">stats.ncaa.org</a>
        </Typography>
      </div> */}
      <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.text.secondary }}
        >
          SRATING LLC
        </Typography>
      </div>
      <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.link.primary }}
        >
          <a href = "https://github.com/esmalleydev/srating.io-gui" target = "_blank">{commitDate} - {hash}</a>
        </Typography>
      </div>
      <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.link.primary }}
        >
          <a href = "mailto:contact@srating.io">contact@srating.io</a>
        </Typography>
      </div>
      <div>
        <Typography
          type="subtitle1"
          style = {{ textAlign: 'center', color: theme.link.primary }}
        >
          <a href = "/ai">Use srating.io in Claude &amp; ChatGPT</a>
        </Typography>
      </div>
    </div>
  );
};

export default Footer;
