'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import SmartToyIcon from '@esmalley/react-material-icons/SmartToy';
import AnalyticsIcon from '@esmalley/react-material-icons/Analytics';
import CheckCircleOutlineIcon from '@esmalley/react-material-icons/CheckCircleOutline';
import LaunchIcon from '@esmalley/react-material-icons/Launch';
import SportsBasketballIcon from '@esmalley/react-material-icons/SportsBasketball';
import DataObjectIcon from '@esmalley/react-material-icons/DataObject';
import ShowChartIcon from '@esmalley/react-material-icons/ShowChart';
import IntegrationInstructionsIcon from '@esmalley/react-material-icons/IntegrationInstructions';
import Billing from './Billing';
import ButtonSwitch from './ButtonSwitch';
import { Color, Style } from '@esmalley/ts-utils';
import { Columns, Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

type priceOption = {
  code: string;
  name: string;
  description: string;
  price: number;
  type: string;
  price_description: string;
  features: string[];
  usage_limit?: string;
  missing_features: string[];
  priceId?: string;
  disabled?: boolean;
}

const Pricing = ({ view }: { view: string | null; }) => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const theme = useTheme();
  const [billingOpen, setBillingOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState({});

  const leftSwitch = 'Picks';
  const rightSwitch = 'API';

  let s = leftSwitch;
  if (view === 'api') {
    s = rightSwitch;
  }

  const [selectedView, setSelectedView] = useState(s);

  const handleBilling = (priceOption: priceOption) => {
    setSelectedPricing(priceOption);
    setBillingOpen(true);
  };

  const handleBillingClose = () => {
    setBillingOpen(false);
  };

  const picksOptions: priceOption[] = [
    {
      code: 'picks_monthly',
      name: 'Monthly',
      description: '$5 USD per month for picks access',
      price: 5,
      type: 'picks',
      price_description: 'USD per month',
      features: [
        'Predicted win %',
        'Predicted score / spread / over',
        'Betting calculator tool',
      ],
      missing_features: ['API access'],
      priceId: process.env.NEXT_PUBLIC_ENV === 'dev' ? 'price_1NcziSDIZlrOiqc2TY4NEiXc' : 'price_1NczWWDIZlrOiqc2QdE6mTdf',
    },
    {
      code: 'picks_yearly',
      name: 'Yearly',
      description: '$20 USD per year for picks access',
      price: 20,
      type: 'picks',
      price_description: 'USD per year',
      features: [
        'Predicted win %',
        'Predicted score / spread / over',
        'Betting calculator tool',
      ],
      missing_features: ['API access'],
      priceId: process.env.NEXT_PUBLIC_ENV === 'dev' ? 'price_1NcziSDIZlrOiqc2A9maKQwi' : 'price_1NczWWDIZlrOiqc2pKPXv8aj',
    },
  ];

  const apiOptions: priceOption[] = [
    {
      code: 'api_trial',
      name: 'Trial',
      description: 'Free trial limited api access',
      price: 0,
      type: 'api',
      price_description: '',
      usage_limit: '500',
      features: ['Limited access', 'Scrambled data'],
      missing_features: ['Access to picks'],
    },
    {
      code: 'api_basic',
      name: 'Basic',
      description: '$25 USD per month for basic API access',
      price: 25,
      type: 'api',
      price_description: 'USD per month',
      usage_limit: '20,000',
      features: [
        'Access to picks',
        'CSV downloads',
        'Games / Teams / Players / Stats',
        'Live scores',
        'Live odds',
      ],
      disabled: false,
      missing_features: [],
      priceId: process.env.NEXT_PUBLIC_ENV === 'dev' ? 'price_1NehA8DIZlrOiqc2XVZLRjzc' : 'price_1NczfoDIZlrOiqc27QjIZfmt',
    },
    {
      code: 'api_pro',
      name: 'Pro',
      description: '$49 USD per month for pro API access',
      price: 49,
      type: 'api',
      price_description: 'USD per month',
      usage_limit: '100,000',
      features: [
        'Access to picks',
        'CSV downloads',
        'Games / Teams / Players / Stats',
        'Live scores',
        'Live odds',
      ],
      disabled: false,
      missing_features: [],
      priceId: process.env.NEXT_PUBLIC_ENV === 'dev' ? 'price_1NehA8DIZlrOiqc2zPZ8Ikaa' : 'price_1NczfoDIZlrOiqc2eH6dGdGK',
    },
    {
      code: 'api_elite',
      name: 'Elite',
      description: '$99 USD per month for elite API access',
      price: 99,
      type: 'api',
      price_description: 'USD per month',
      usage_limit: '4 Million',
      features: [
        'Access to picks',
        'CSV downloads',
        'Games / Teams / Players / Stats',
        'Live scores',
        'Live odds',
      ],
      disabled: true,
      missing_features: [],
      priceId: process.env.NEXT_PUBLIC_ENV === 'dev' ? 'price_1NqdsnDIZlrOiqc2Jr2BQJ9N' : 'price_1NqdqfDIZlrOiqc2w0H1MYrv',
    },
  ];

  const getPriceCard = (option: priceOption) => {
    const trial = (option.code === 'api_trial');
    const buttonColor = (option.disabled ? theme.grey[500] : theme.blue[700]);
    const textColor = Color.getTextColor('#ffffff', buttonColor);
    return (
      <div style = {{
        width: '100%',
        minWidth: 200,
        maxWidth: 320,
        margin: 10,
      }}>
        <Paper
          hover = {!option.disabled}
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            padding: 10,
            cursor: option.disabled ? 'initial' : 'pointer',
          }}
          onClick = {() => {
            if (option.disabled) {
              return;
            }
            handleBilling(option);
          }}
        >
          {option.disabled ? <Typography style = {{ color: theme.error.main }} type = 'h6'>Coming soon</Typography> : ''}
          <Typography style = {{ color: theme.text.secondary }} type = 'body1'>{option.name}</Typography>
          <Typography style = {{ color: theme.primary.main }} type = 'h3'><Typography style = {{ fontSize: 16, display: 'inline-block', color: theme.primary.main }} type='caption'>$</Typography>{option.price}</Typography>
          <Typography style = {{ color: theme.text.secondary }} type = 'caption'>{option.price_description}</Typography>
          {option.usage_limit ? <div><Typography style = {{ color: theme.primary.main, display: 'inline-block', marginRight: 2.5 }} type = 'caption'>{option.usage_limit}</Typography><Typography style = {{ color: theme.text.secondary, display: 'inline-block' }} type = 'caption'> usage per month</Typography></div> : ''}
          {option.features.map((feature) => {
            return (
              <div key = {feature}>
                <hr />
                <Typography type = 'body2'>{feature}</Typography>
              </div>
            );
          })}
          {option.missing_features.map((missing) => {
            return (
              <div key = {missing}>
                <hr />
                <Typography style = {{ textDecoration: 'line-through', color: theme.text.secondary }} type = 'body2'>{missing}</Typography>
              </div>
            );
          })}
          <div style = {{
            width: '100%',
            marginTop: 10,
            backgroundColor: buttonColor,
            color: textColor,
            height: 30,
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 14,
          }}>{trial ? 'Try now' : 'Subscribe'}</div>
        </Paper>
      </div>
    );
  };

  let breakPoint = 940;
  let numberOfColumns = apiOptions.length;

  if (width < breakPoint && numberOfColumns >= 4) {
    numberOfColumns = 2;
    breakPoint = 500;
  }

  const ulStyle = {
    padding: 0,
    margin: 0,
    listStyle: 'none',
  };

  const liStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    gap: '16px',
  };

  const dividerStyle = {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '8px 0',
    '::before': {
      content: '""',
      flex: 1,
      borderBottom: `1px solid ${theme.grey[(theme.mode === 'dark' ? 700 : 400)]}`,
    },
    '::after': {
      content: '""',
      flex: 1,
      borderBottom: `1px solid ${theme.grey[(theme.mode === 'dark' ? 700 : 400)]}`,
    },
  };


  return (
    <div>
      <Billing open = {billingOpen} closeHandler = {handleBillingClose} pricing = {selectedPricing} />
      <ButtonSwitch leftTitle={leftSwitch} rightTitle={rightSwitch} selected = {selectedView} handleClick={(e) => setSelectedView(e)} />
      {
      selectedView === leftSwitch ?
      <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
          <Typography type='body1' style={{ maxWidth: '600px', margin: 'auto', color: theme.text.secondary }}>
            Start making data-driven decisions with our AI-powered sports predictions.
          </Typography>
          <div style={{ maxWidth: '600px', margin: 0 }}>
            <ul className = {Style.getStyleClassName(ulStyle)}>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <SmartToyIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>AI-Powered Predictive Models</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>Our algorithms are trained on historical datasets: 10+ years of 🏀 (75,000+ games) and 20+ years of 🏈 (20,000+ games).</Typography>
                </div>
              </li>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <AnalyticsIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Daily Data-Driven Picks</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>Receive daily, unbiased picks for College Basketball and Football, generated by our sophisticated analytics engine.</Typography>
                </div>
              </li>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <CheckCircleOutlineIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Proven & Transparent</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>
                    We believe in transparency. View our {' '}
                      <a style={{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { e.preventDefault(); router.push('/cbb/picks?view=stats'); }} href='/cbb/picks?view=stats'>
                        live CBB win-rate stats
                      </a>
                      {' '} or {' '}
                      <a style={{ cursor: 'pointer', color: theme.link.primary }} onClick={(e) => { e.preventDefault(); router.push('/cfb/picks?view=stats'); }} href='/cfb/picks?view=stats'>
                        live CFB
                      </a>
                      {' '}. Live win rate is broken down by season, month, week, and day. Check out the code on <a style = {{ color: theme.link.primary }} href = "https://github.com/esmalleydev/srating.io-gui" target = "_blank">Github</a>.
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className = {Style.getStyleClassName(dividerStyle)}>
          <Typography type="h5" style = {{ margin: '0px 5px' }}>Choose Your Plan</Typography>
        </div>
        <Columns style = {{ maxWidth: 1200, margin: 'auto', justifyItems: 'center', alignItems: (width > breakPoint ? 'self-start' : 'center') }} breakPoint={breakPoint}>
          {picksOptions.map((option) => {
            return getPriceCard(option);
          })}
        </Columns>
      </> :
      <>
        <Typography style = {{ textAlign: 'center', margin: '10px 0px' }} type='h5'>API access <sup style = {{ fontSize: '14px' }}>beta</sup></Typography>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
          <Typography type='body1' style={{ maxWidth: '600px', margin: 'auto', color: theme.text.secondary }}>
            Integrate our powerful sports data and predictions directly into your applications with our flexible API.
          </Typography>
          <div style={{ maxWidth: '600px', margin: 0 }}>
            <ul className = {Style.getStyleClassName(ulStyle)}>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <DataObjectIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Flexible & Powerful Data</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>Access comprehensive data for games, teams, players, stats, live scores, and our AI-powered picks.</Typography>
                </div>
              </li>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <ShowChartIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Live Scores & Betting Odds</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>Get up-to-the-minute game scores and betting odds to power real-time applications and analysis.</Typography>
                </div>
              </li>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <SportsBasketballIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Sports supported</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>College football</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>College basketball (mens)</Typography>
                </div>
              </li>
              <li className = {Style.getStyleClassName(liStyle)}>
                <div style = {{ flexShrink: 0 }}>
                  <IntegrationInstructionsIcon style = {{ fontSize: 24, color: theme.primary.main }} />
                </div>
                <div style = {{ display: 'flex', flexDirection: 'column' }}>
                  <Typography type = 'subtitle1'>Simple & Fast Integration</Typography>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary }}>
                    Start building in minutes. Read our {' '}
                      <a
                        style={{ cursor: 'pointer', color: theme.link.primary }}
                        onClick={(e) => { e.preventDefault(); window.open('https://docs.srating.io/', '_blank'); }}
                        href='https://docs.srating.io/'
                        target="_blank"
                        rel="noopener noreferrer"
                      >API Documentation</a>
                      {' '} and try it free.
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className = {Style.getStyleClassName(dividerStyle)}>
          <Typography type="h5" style = {{ margin: '0px 5px' }}>Choose Your Plan</Typography>
        </div>
        <Columns numberOfColumns={numberOfColumns} style = {{ maxWidth: 1200, margin: 'auto', justifyItems: 'center', alignItems: (width > breakPoint ? 'self-start' : 'center') }} breakPoint={breakPoint}>
          {apiOptions.map((option) => {
            return getPriceCard(option);
          })}
        </Columns>
      </>
      }
    </div>
  );
};

export default Pricing;
