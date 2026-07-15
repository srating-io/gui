'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateTheme } from '../../redux/features/theme-slice';


// import TripleDotsIcon from '@esmalley/react-material-icons/MoreVert';
import { Code as GitHubIcon } from '@esmalley/react-material-icons/Code';
import DarkModeIcon from '@esmalley/react-material-icons/ModeNight';
import LightModeIcon from '@esmalley/react-material-icons/LightMode';
import FormatPaintIcon from '@esmalley/react-material-icons/FormatPaint';
// import BeerIcon from '@esmalley/react-material-icons/SportsBar';
import SettingsIcon from '@esmalley/react-material-icons/Settings';
import RSSFeedIcon from '@esmalley/react-material-icons/RssFeed';
import RankingIcon from '@esmalley/react-material-icons/EmojiEvents';
import ScoresIcon from '@esmalley/react-material-icons/Scoreboard';
import PicksIcon from '@esmalley/react-material-icons/Casino';
import ArticleIcon from '@esmalley/react-material-icons/Article';
import QueryStatsIcon from '@esmalley/react-material-icons/QueryStats';
import { reset } from '@/redux/features/compare-slice';
import { setLoading } from '@/redux/features/loading-slice';
import Organization from '../helpers/Organization';
import { Style } from '@esmalley/ts-utils';
import { useNavigation } from '../hooks/useNavigation';

import sratingLogo from '../../public/favicon-32x32.png';
import { Divider, Typography, useTheme } from '@esmalley/react-material-ui';


const Sidebar = (
  {
    onClick,
  }:
  {
    onClick: () => void,
  },
) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const validSession = useAppSelector((state) => state.userReducer.isValidSession);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const path = Organization.getPath({ organizations, organization_id });

  const pathName = usePathname();


  const handleRanking = () => {
    onClick();
    const newPathName = `/${path}/ranking`;

    if (newPathName !== pathName) {
      dispatch(setLoading(true));
      startTransition(() => {
        router.push(newPathName);
      });
    }
  };

  const handleScores = () => {
    onClick();
    const newPathName = `/${path}/games`;

    if (newPathName !== pathName) {
      dispatch(setLoading(true));
      // sessionStorage.removeItem('CBB.GAMES.DATA');
      startTransition(() => {
        router.push(newPathName);
      });
    }
  };

  const handlePicks = () => {
    onClick();
    const newPathName = `/${path}/picks`;

    if (newPathName !== pathName) {
      dispatch(setLoading(true));
      startTransition(() => {
        router.push(newPathName);
      });
    }
  };

  const handleCompareTool = () => {
    onClick();
    const newPathName = `/${path}/compare`;

    if (newPathName !== pathName) {
      dispatch(setLoading(true));
      startTransition(() => {
        dispatch(reset());
        router.push(newPathName);
      });
    }
  };

  const getButtonContainer = ({ onClick, icon, text }) => {
    const containerStyle = {
      width: '100%',
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      height: 48,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.action.hover,
      },
    };

    return (
      <div className = {Style.getStyleClassName(containerStyle)} onClick={onClick}>
        <div style = {{ display: 'flex', width: 48, alignItems: 'center', margin: '0px 0px 0px 10px' }}>{icon}</div>
        <div><Typography type = 'body1'>{text}</Typography></div>
      </div>
    );
  };

  const iconStyle = {
    color: (theme.mode === 'light' ? theme.grey[600] : '#fff'),
    fontSize: 24,
  };


  return (
    <div style = {{ width: 250 }}>

      {getButtonContainer({
        onClick: () => { router.push('/'); },
        icon: <img src={sratingLogo.src} width = '24' height = '24' />,
        text: 'srating.io',
      })}

      {validSession && getButtonContainer({
        onClick: () => {
          if (pathName !== '/account') {
            navigation.user('/account?view=settings');
          } else if (pathName === '/account') {
            navigation.userView({ view: 'settings' });
          }
        },
        icon: <SettingsIcon style={iconStyle} />,
        text: 'My account',
      })}

      <Divider />

      {getButtonContainer({
        onClick: handleRanking,
        icon: <RankingIcon style={iconStyle} />,
        text: 'Ranking',
      })}

      {getButtonContainer({
        onClick: handleScores,
        icon: <ScoresIcon style={iconStyle} />,
        text: 'Scores',
      })}

      {getButtonContainer({
        onClick: handlePicks,
        icon: <PicksIcon style={iconStyle} />,
        text: 'Picks',
      })}

      {getButtonContainer({
        onClick: handleCompareTool,
        icon: <QueryStatsIcon style={iconStyle} />,
        text: 'Compare tool',
      })}

      <Divider />

      {getButtonContainer({
        onClick: () => { window.open('https://docs.srating.io', '_blank'); },
        icon: <ArticleIcon style={iconStyle} />,
        text: 'API Docs',
      })}

      {getButtonContainer({
        onClick: () => { window.open('https://ux.srating.io', '_blank'); },
        icon: <FormatPaintIcon style={iconStyle} />,
        text: 'UX Docs',
      })}

      {getButtonContainer({
        onClick: () => { window.open('https://github.com/srating-io/gui', '_blank'); },
        icon: <GitHubIcon style={iconStyle} />,
        text: 'Github',
      })}

      {getButtonContainer({
        onClick: () => { onClick(); router.push('/blog'); },
        icon: <RSSFeedIcon style={iconStyle} />,
        text: 'Blog',
      })}

      <Divider />

      {getButtonContainer({
        onClick: () => { dispatch(updateTheme(theme.mode === 'dark' ? 'light' : 'dark')); },
        icon: theme.mode === 'dark' ? <LightModeIcon style={iconStyle} /> : <DarkModeIcon style={iconStyle} />,
        text: theme.mode === 'dark' ? 'Light mode' : 'Dark mode',
      })}

    </div>
  );
};

export default Sidebar;
