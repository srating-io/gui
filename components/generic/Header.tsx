'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// import { Link } from 'next/link';


// Icons
import MenuIcon from '@esmalley/react-material-icons/Menu';
import AccountCircle from '@esmalley/react-material-icons/AccountCircle';
import SearchIcon from '@esmalley/react-material-icons/Search';
import ArrowBackIcon from '@esmalley/react-material-icons/ArrowBack';
import QueryStatsIcon from '@esmalley/react-material-icons/QueryStats';
// import Settings from '@esmalley/react-material-icons/Settings';
import Logout from '@esmalley/react-material-icons/Logout';
import AccountCircleIcon from '@esmalley/react-material-icons/AccountCircle';
import ShoppingCartIcon from '@esmalley/react-material-icons/ShoppingCart';
import SportsEsportsIcon from '@esmalley/react-material-icons/SportsEsports';
import NotificationsIcon from '@esmalley/react-material-icons/Notifications';
import DashboardIcon from '@esmalley/react-material-icons/Dashboard';

import sratingLogo from '../../public/favicon-32x32.png';

import Sidebar from './Sidebar';
import Search from './Search';
import AccountHandler from '@/components/generic/AccountHandler';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { reset } from '@/redux/features/compare-slice';
import { setLoading } from '@/redux/features/loading-slice';
import OrganizationPicker from './OrganizationPicker';
import Organization from '../helpers/Organization';
import { isAdmin } from '../helpers/Admin';
import { setDataKey } from '@/redux/features/user-slice';
import General from '../helpers/General';
import { Objector, Style } from '@esmalley/ts-utils';
import Notifications from './Notifications';
import { useNavigation } from '../hooks/useNavigation';
import {
  Button, Drawer, IconButton, Menu, MenuDivider, MenuOption, Tooltip, useTheme, useWindowDimensions,
} from '@esmalley/react-material-ui';


// todo hook up settings with router

export const headerBarHeight = 64;

const Header = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const validSession = useAppSelector((state) => state.userReducer.isValidSession);
  const user = useAppSelector((state) => state.userReducer.user);
  const notifications = useAppSelector((state) => state.userReducer.notifications);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const path = Organization.getPath({ organizations, organization_id });


  const activeNotifications = Object.values(notifications || {}).filter((r) => {
    if (r.cleared) {
      return false;
    }

    return true;
  });

  const router = useRouter();
  const pathName = usePathname();
  const { width } = useWindowDimensions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [fullSearch, setFullSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [viewNotifications, setViewNotifications] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const logoPrimaryColor = General.getLogoColorPrimary();
  const logoSecondaryColor = General.getLogoColorSecondary();


  useEffect(() => {
    setIsLoading(false);
  }, []);


  const handleHome = () => {
    if (pathName !== '/') {
      dispatch(setLoading(true));
      startTransition(() => {
        router.push('/');
      });
    }
  };

  const handleCompare = () => {
    if (pathName !== `/${path}/compare`) {
      dispatch(setLoading(true));
      dispatch(reset());
      startTransition(() => {
        router.push(`/${path}/compare`);
      });
    }
  };


  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };


  const handleAccount = () => {
    handleClose();
    if (validSession) {
      if (pathName !== '/account') {
        navigation.user('/account?view=settings');
      } else if (pathName === '/account') {
        navigation.userView({ view: 'settings' });
      }

      return;
    }
    setAccountOpen(true);
  };

  const handleAccountSubscriptions = () => {
    handleClose();
    if (validSession) {
      if (pathName !== '/account') {
        navigation.user('/account?view=subscriptions');
      } else if (pathName === '/account') {
        navigation.userView({ view: 'subscriptions' });
      }

      return;
    }
    setAccountOpen(true);
  };

  const handleAccountFantasy = () => {
    handleClose();
    if (validSession) {
      if (pathName !== '/account') {
        navigation.user('/account?view=fantasy');
      } else if (pathName === '/account') {
        navigation.userView({ view: 'fantasy' });
      }

      return;
    }
    setAccountOpen(true);
  };

  /**
   * The dashboard is admin only, but the gate is the api's, not this menu's. The entry is hidden
   * from everyone else because it would be useless to them, not because hiding it protects
   * anything -- `/dashboard` renders its shell for whoever types it and the panels come back empty.
   */
  const handleDashboard = () => {
    handleClose();

    if (pathName !== '/dashboard') {
      startTransition(() => {
        router.push('/dashboard');
      });
    }
  };

  const handleAccountClose = () => {
    setAccountOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(setDataKey({ key: 'session_id', value: null }));
    dispatch(setDataKey({ key: 'isValidSession', value: false }));
    startTransition(() => {
      router.push('/');
    });
  };

  const toggleViewNotifications = () => {
    setViewNotifications(!viewNotifications);
  };


  const logoStyle: React.CSSProperties = {
    // 'fontFamily': 'Consolas',
    // 'fontFamily': 'Courier New',
    fontWeight: 600,
    fontSize: '20px',
    fontStyle: 'italic',
    verticalAlign: 'middle',
    cursor: 'pointer',
  };

  const shrinkName = width <= 425;

  const headerStyle = {
    position: 'fixed',
    width: '100%',
    zIndex: Style.getZIndex().appBar,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.header.main,
    color: '#fff',
  };

  const toolBarStyle = {
    minHeight: 56,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    '@media (min-width: 600px)': {
      minHeight: 64,
    },
  };

  const menuOptions: MenuOption[] = [
    {
      value: 'account',
      selectable: true,
      label: 'My account',
      onSelect: handleAccount,
      icon: <AccountCircleIcon style = {{ fontSize: 20 }} />,
    },
    {
      value: 'subscriptions',
      selectable: true,
      label: 'My subscriptions',
      onSelect: handleAccountSubscriptions,
      icon: <ShoppingCartIcon style = {{ fontSize: 20 }} />,
    },
    {
      value: 'fantasy',
      selectable: true,
      label: 'My fantasy legaues',
      onSelect: handleAccountFantasy,
      icon: <SportsEsportsIcon style = {{ fontSize: 20 }} />,
    },
    ...(validSession && isAdmin(user) ? [{
      value: 'dashboard',
      selectable: true,
      label: 'Dashboard',
      onSelect: handleDashboard,
      icon: <DashboardIcon style = {{ fontSize: 20 }} />,
    }] : []),
    {
      value: null,
      selectable: false,
      customLabel: <MenuDivider />,
    },
    {
      value: 'notifications',
      selectable: true,
      label: `View ${activeNotifications.length} notification${activeNotifications.length > 1 ? 's' : ''}`,
      onSelect: toggleViewNotifications,
      icon: <NotificationsIcon style = {{ fontSize: 20, color: (activeNotifications.length ? theme.red[700] : theme.text.primary) }} />,
    },
    {
      value: 'logout',
      selectable: true,
      label: 'Logout',
      onSelect: handleLogout,
      icon: <Logout style = {{ fontSize: 20 }} />,
    },
  ];

  return (
    <div className={Style.getStyleClassName(headerStyle)}>
      <div style = {{ padding: '0px 20px' }}>
      {
        fullSearch ?
          <div className = {Style.getStyleClassName(toolBarStyle)}>
            <IconButton onClick = {() => { setFullSearch(false); }} value = 'back' icon = {<ArrowBackIcon style = {{ fontSize: 24 }} />} />
            <div style={{ width: '100%' }}>
              <Search onRouter = {() => { setFullSearch(false); }} focus = {true} />
            </div>
          </div> :
          <div className = {Style.getStyleClassName(toolBarStyle)}>
            <IconButton onClick = {toggleDrawer} containerStyle = {{ marginRight: 16 }} style={{ color: '#fff' }} value = 'sidebar' icon = {<MenuIcon style = {{ fontSize: 24 }} />} />
            <Drawer
              open={drawerOpen}
              onClose={toggleDrawer}
            >
              <Sidebar onClick = {toggleDrawer} />
            </Drawer>
            <div style = {Objector.extender({ display: 'flex', marginRight: 5, alignItems: 'center' }, logoStyle)} onClick = {handleHome}>
              {width > 425 ? <img src={sratingLogo.src} width = '20' height = '20' style = {{ marginRight: 5 }} /> : ''}
              <><span style = {{ color: (theme.mode === 'dark' ? logoPrimaryColor : '#fff') }}>S</span><span style = {{ color: (theme.mode === 'dark' ? logoSecondaryColor : '#31ff00') }}>R{shrinkName ? '' : 'ATING'}</span></>
            </div>
            <div style = {{ display: 'flex', marginRight: 5, alignItems: 'center' }}>
              <OrganizationPicker />
            </div>
            <div style={{ flexGrow: 1, display: 'flex' }}>
            </div>
            <div style={{ flexGrow: 0, lineHeight: 'initial' }}>{width > 320 ? <Tooltip onClickRemove text = {'Compare tool'}><IconButton onClick={handleCompare} value = 'compare' icon = {<QueryStatsIcon style = {{ fontSize: 24 }} />} style={{ color: (theme.mode === 'light' ? '#fff' : theme.info.main) }} /></Tooltip> : ''}</div>
            <div style={{ flexGrow: 0, marginRight: (width < 600 ? 0 : '5px'), lineHeight: 'initial' }}>
              {width < 625 ? <IconButton onClick={() => { setFullSearch(true); }} style={{ color: (theme.mode === 'light' ? '#fff' : theme.info.main) }} value = 'search' icon = {<SearchIcon style = {{ fontSize: 24 }} />} /> : <Search focus={false} />}
            </div>
            <div style={{ flexGrow: 0, lineHeight: 'initial' }}>
              {
              validSession ?
                <>
                  <IconButton onClick={handleMenu} value = 'account' icon = {<AccountCircle style = {{ fontSize: 24 }} />} style={{ color: '#fff' }} badge={activeNotifications.length} />
                  <Menu
                    anchor={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    options={menuOptions}
                  />
                </>
                :
                <div>
                  {/* {width >= 425 ? <SignUpButton style = {{'marginRight': 5}} variant = 'outlined' disableElevation onClick={() => {router.push('/pricing');}}>Sign up</SignUpButton> : ''} */}
                  <Button buttonStyle = {{ backgroundColor: (theme.mode === 'light' ? theme.secondary.main : theme.success.dark) }} onClick={handleAccount} title = {(width > 550 ? 'Signup / Login' : 'Login')} value = 'login' />
                </div>
              }
            </div>
          </div>
        }
        </div>
      <AccountHandler open = {accountOpen} closeHandler = {handleAccountClose} />
      <Notifications open = {viewNotifications} closeHandler={toggleViewNotifications} />
    </div>
  );
};

export default Header;
