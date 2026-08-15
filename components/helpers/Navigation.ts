'use client';

import { updateDataKey as updateDataKeyDisplay } from '@/redux/features/display-slice';
import { InitialState as InitialStatePlayer, InitialStateKeys as InitialStateKeysPlayer, resetDataKey as resetDataKeyPlayer, reset as resetPlayer, setDataKey as setDataKeyPlayer } from '@/redux/features/player-slice';
import { reset as resetCompare } from '@/redux/features/compare-slice';
import { reset as resetCoach } from '@/redux/features/coach-slice';
import { reset as resetConference } from '@/redux/features/conference-slice';
import { reset as resetTeam } from '@/redux/features/team-slice';
import { reset as resetGames } from '@/redux/features/games-slice';
import { reset as resetGame } from '@/redux/features/game-slice';
import { reset as resetPicks, setDataKey as setDataKeyPicks, InitialStateKeys as InitialStateKeysPicks, InitialState as InitialStatePicks } from '@/redux/features/picks-slice';
import { AppDispatch } from '@/redux/store';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { TransitionStartFunction } from 'react';
import { InitialState as InitialStateRanking, InitialStateKeys as InitialStateKeysRanking, resetDataKey as resetDataKeyRanking, reset as resetRanking, setDataKey as setDataKeyRanking } from '@/redux/features/ranking-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { reset as resetFantasy, setDataKey as setDataKeyFantasy, InitialStateKeys as InitialStateKeysFantasy, InitialState as InitialStateFantasy, stateController as FantasyStateController } from '@/redux/features/fantasy-slice';
import { resetDataKey as resetDataKeyUser, setDataKey as setDataKeyUser, InitialStateKeys as InitialStateKeysUser, InitialState as InitialStateUser, stateController as UserStateController } from '@/redux/features/user-slice';
import { reset as resetFantasyGroup, setDataKey as setDataKeyFantasyGroup, InitialStateKeys as InitialStateKeysFantasyGroup, InitialState as InitialStateFantasyGroup, stateController as FantasyGroupStateController } from '@/redux/features/fantasy_group-slice';
import { reset as resetFantasyEntry } from '@/redux/features/fantasy_entry-slice';

// todo remove nextjs router :D

// todo need to collapse all this into 1 or 2 functions, pass a table and id, then function does the rest. path should be determined based on the data instead

// if the router does not appear to be working correctly,
// make sure the path starts with "/" , or it does stupid stuff

class Navigation {
  constructor(
    private dispatch: AppDispatch,
    private router: AppRouterInstance,
    private pathName: string,
    private startTransition: TransitionStartFunction,
    public isPending: boolean,
  ) {
    this.dispatch = dispatch;
    this.router = router;
    this.pathName = pathName;
    this.startTransition = startTransition;
    this.isPending = isPending;
  }

  public getRouter() {
    return this.router;
  }

  /**
   * Navigate to a compare page,
   * reset the state to be fresh beforehand
   */
  public compare(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetCompare(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to a player page,
   * reset the state to be fresh beforehand
   */
  public player(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      // this.dispatch(stateThunk({ router: this.getRouter() }));
      this.dispatch(resetPlayer(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to something on a player view. Must already be on player view
   */
  public playerView<K extends InitialStateKeysPlayer>(args: Pick<InitialStatePlayer, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('player')) {
      throw new Error('playerView only usable when already navigated to player');
    }

    for (const key in args) {
      this.dispatch(setDataKeyPlayer({ key, value: args[key] }));
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      this.dispatch(setDataKeyPlayer({ key: 'subview', value: null }));
      this.dispatch(resetDataKeyPlayer('trendsSeasons'));
      this.dispatch(resetDataKeyPlayer('trendsBoxscoreLine'));
      this.dispatch(resetDataKeyPlayer('trendsColumn'));
    }


    this.dispatch(setDataKeyPlayer({ key: 'loadingView', value: true }));

    // player slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router.replace(`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }


  /**
   * Navigate to a coach page,
   * reset the state to be fresh beforehand
   */
  public coach(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetCoach(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to a conference page,
   * reset the state to be fresh beforehand
   */
  public conference(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetConference(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to a team page,
   * reset the state to be fresh beforehand
   */
  public team(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetTeam(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to a singular game page (/sports/games/abc),
   * reset the state to be fresh beforehand
   */
  public game(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetGame(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to the ranking page
   */
  public ranking(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetRanking(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  public rankingView<K extends InitialStateKeysRanking>(args: Pick<InitialStateRanking, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('ranking')) {
      throw new Error('rankingView only usable when already navigated to ranking');
    }

    for (const key in args) {
      this.dispatch(setDataKeyRanking({ key, value: args[key] }));
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      this.dispatch(resetDataKeyRanking('data'));
      this.dispatch(resetDataKeyRanking('customColumns'));
      this.dispatch(updateDataKeyDisplay({ key: 'positions', value: [] }));
      this.dispatch(resetDataKeyRanking('order'));
      this.dispatch(resetDataKeyRanking('orderBy'));
      this.dispatch(resetDataKeyRanking('tableScrollTop'));
      this.dispatch(resetDataKeyRanking('columnView'));
      this.dispatch(resetDataKeyRanking('filteredRows'));
      this.dispatch(resetDataKeyRanking('searchValue'));
      this.dispatch(resetDataKeyRanking('career'));
      this.dispatch(resetDataKeyRanking('career_active'));
    }


    this.dispatch(setDataKeyRanking({ key: 'loadingView', value: true }));

    // player slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router.replace(`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to the games (scores) page
   */
  public games(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetGames(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to a picks page,
   * reset the state to be fresh beforehand
   */
  public picks(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetPicks(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to something on a picks view. Must already be on picks view
   */
  public picksView<K extends InitialStateKeysPicks>(args: Pick<InitialStatePicks, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('picks')) {
      throw new Error('picksView only usable when already navigated to picks');
    }

    for (const key in args) {
      this.dispatch(setDataKeyPicks({ key, value: args[key] }));
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      // nothing here yet
    }

    this.dispatch(setDataKeyPicks({ key: 'loadingView', value: true }));


    // picks slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router.replace(`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }



  /**
   * Navigate to the fantasy page,
   * reset the state to be fresh beforehand
   */
  public fantasy(path: string, onRouter: null | undefined | (() => void) = null, pushState = true) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      // this.dispatch(stateThunk({ router: this.getRouter() }));
      this.dispatch(resetFantasy(false));
    }
    this.startTransition(() => {
      this.router[pushState ? 'push' : 'replace'](path);
      if (onRouter) {
        onRouter();
      }
    });
  }


  /**
   * Navigate to something on a fantasy view. Must already be on fantasy view
   */
  public fantasyView<K extends InitialStateKeysFantasy>(args: Pick<InitialStateFantasy, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('fantasy')) {
      throw new Error('fantasyView only usable when already navigated to fantasy');
    }

    let pushState = false;

    const stateController = FantasyStateController;

    for (const key in args) {
      this.dispatch(setDataKeyFantasy({ key, value: args[key] }));
      if (!pushState) {
        pushState = stateController.isKeyPushState(key);
      }
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      // nothing here yet
    }

    this.dispatch(setDataKeyFantasy({ key: 'loadingView', value: true }));


    // picks slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router[(pushState ? 'push' : 'replace')](`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to the fantasy page,
   * reset the state to be fresh beforehand
   */
  public fantasy_group(path: string, onRouter: null | undefined | (() => void) = null, pushState = true) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetFantasyGroup(false));
    }

    this.startTransition(() => {
      this.router[pushState ? 'push' : 'replace'](path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to something on a fantasy group view. Must already be on fantasy view
   */
  public fantasyGroupView<K extends InitialStateKeysFantasyGroup>(args: Pick<InitialStateFantasyGroup, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('fantasy_group')) {
      throw new Error('fantasyGroupView only usable when already navigated to fantasy_group');
    }

    let pushState = false;

    const stateController = FantasyGroupStateController;

    for (const key in args) {
      this.dispatch(setDataKeyFantasyGroup({ key, value: args[key] }));
      if (!pushState) {
        pushState = stateController.isKeyPushState(key);
      }
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      // nothing here yet
    }

    this.dispatch(setDataKeyFantasyGroup({ key: 'loadingView', value: true }));


    // picks slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router[(pushState ? 'push' : 'replace')](`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to the fantasy entry page,
   * reset the state to be fresh beforehand
   */
  public fantasy_entry(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(resetFantasyEntry(false));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }


  /**
   * Navigate to the account user page,
   * DO NOT reset the user state before hand, only the account loaded part
   */
  public user(path: string, onRouter: null | undefined | (() => void) = null) {
    if (this.pathName !== path) {
      this.dispatch(setLoading(true));
      this.dispatch(setDataKeyUser({ key: 'loadedAccount', value: false }));
      // this.dispatch(resetDataKeyUser({ key: 'fa', value: false }));
    }
    this.startTransition(() => {
      this.router.push(path);
      if (onRouter) {
        onRouter();
      }
    });
  }

  /**
   * Navigate to something on a user view. Must already be on user view
   */
  public userView<K extends InitialStateKeysUser>(args: Pick<InitialStateUser, K>, onRouter: null | undefined | (() => void) = null) {
    if (!this.pathName.includes('account')) {
      throw new Error('userView only usable when already navigated to player');
    }

    for (const key in args) {
      this.dispatch(setDataKeyUser({ key, value: args[key] }));
    }


    // these MUST always be set this way if the view changes
    if ('view' in args) {
      // nothing atm
    }


    this.dispatch(setDataKeyUser({ key: 'loadingView', value: true }));

    // user slice handles this now, but just refetch it here for stupid nextjs router
    const current = new URLSearchParams(window.location.search);
    const search = current.toString();
    const query = search ? `?${search}` : '';

    this.startTransition(() => {
      this.router.replace(`${this.pathName}${query}`);
      if (onRouter) {
        onRouter();
      }
    });
  }
}

export default Navigation;
