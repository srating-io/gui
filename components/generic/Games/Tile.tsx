'use client';

import { useRef, useState } from 'react';

import HelperGame from '@/components/helpers/Game';

import FavoriteIcon from '@esmalley/react-material-icons/Favorite';
import AccountBalanceIcon from '@esmalley/react-material-icons/AccountBalance';

import Locked from '@/components/generic/Billing/Locked';
import Indicator from '@/components/generic/Indicator';
import Pin from '@/components/generic/Pin';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useScrollContext } from '@/contexts/scrollContext';
import { updateGameSort } from '@/redux/features/favorite-slice';
import useOnScreen from '@/components/hooks/useOnScreen';
import Record from './Tile/Record';
import Rank from './Tile/Rank';
import Organization from '@/components/helpers/Organization';
import { setDataKey } from '@/redux/features/games-slice';
import General from '@/components/helpers/General';
import { Color, Style } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import {
  IconButton, Modal, Paper, Skeleton, Tooltip, Typography, useTheme, useWindowDimensions,
} from '@esmalley/react-material-ui';


export const getTileBaseStyle = (): {
  width: string;
  minHeight?: string;
  margin: string;
  height?: number;
  cursor?: string;
} => {
  const { width } = useWindowDimensions();

  let tileWidth = '320px';

  if (width >= 425) {
    tileWidth = '425px';
  } else if (width < 425 && width > 320) {
    tileWidth = '100%';
  }

  return {
    width: tileWidth,
    minHeight: '100px',
    margin: '5px',
    height: 139,
  };
};

const Tile = ({ game, isLoadingWinPercentage }) => {
  const navigation = useNavigation();
  const theme = useTheme();

  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollContext();
  const isVisible = useOnScreen(ref, scrollRef);

  const bestColor = General.getBestColor();
  const worstColor = General.getWorstColor();
  const favorite_team_ids = useAppSelector((state) => state.favoriteReducer.team_ids);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const hideOdds = useAppSelector((state) => state.displayReducer.hideOdds);
  const path = Organization.getPath({ organizations, organization_id: game.organization_id });
  const [vegasModalOpen, setVegasModalOpen] = useState(false);


  const dispatch = useAppDispatch();
  const displayCardView = useAppSelector((state) => state.displayReducer.cardsView);

  const Game = new HelperGame({
    game,
  });

  const spreadToUseHome = (Game.isInProgress() ? Game.getLiveSpread('home') : Game.getPreSpread('home'));
  const spreadToUseAway = (Game.isInProgress() ? Game.getLiveSpread('away') : Game.getPreSpread('away'));
  const overUnderToUse = (Game.isInProgress() ? Game.getLiveOver() : Game.getPreOver());

  const bookmakers = Game.getBookMakers();

  const bookmakersKeysToShow = [
    'betmgm',
    'fanduel',
    'williamhill_us',
    'draftkings',
  ];

  // console.log(bookmakers)

  const hasAccessToPercentages = !(!game.prediction || (game.prediction.home_percentage === null && game.prediction.away_percentage === null));

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (
      scrollRef &&
      scrollRef.current
    ) {
      dispatch(setDataKey({ key: 'scrollTop', value: scrollRef.current.scrollTop }));
    }

    dispatch(updateGameSort(null));

    navigation.game(`/${path}/games/${game.game_id}`);
  };


  const getIndicators = () => {
    const flexContainer = {
      display: 'flex',
      alignItems: 'left',
      margin: '0px 10px',
    };

    const indicators: React.JSX.Element[] = [];

    if (Game.isNeutralSite()) {
      indicators.push(
        <Indicator key = {'N'} title = {'Neutral site'} code = {'N'} color = {'#ffa726'} />,
      );
    }

    if (Game.isPreSeason()) {
      indicators.push(
        <Indicator key = {'P'} title = {'Preseason'} code = {'P'} color = {theme.purple[500]} />,
      );
    }

    return (
      <div style = {flexContainer} >
        {indicators}
      </div>
    );
  };

  const getHeader = () => {
    const flexContainer = {
      display: 'flex',
      alignItems: 'center',
    };

    const timeStyle = {
      flex: 1,
      height: '36px',
      lineHeight: '36px',
    };

    const network: React.JSX.Element[] = [];

    if (!Game.isFinal() && Game.getNetwork()) {
      network.push(<Typography key = {Game.getNetwork()} style = {{ display: 'inline-block', marginLeft: '5px', color: theme.text.secondary }} type = 'overline'>{Game.getNetwork()}</Typography>);
    }

    const oddsTexts: string[] = [];
    if (
      spreadToUseAway !== '-' &&
      spreadToUseHome !== '-'
    ) {
      oddsTexts.push(spreadToUseHome < spreadToUseAway ? `${Game.getTeamNameShort('home')} ${spreadToUseHome}` : `${Game.getTeamNameShort('away')} ${spreadToUseAway}`);
    }
    if (overUnderToUse !== '-') {
      oddsTexts.push(`O${overUnderToUse}`);
    }

    let predictedSpreadContainer: React.JSX.Element | null = null;

    if (isLoadingWinPercentage) {
      predictedSpreadContainer = <Skeleton key = {1} style = {{ width: 32 }} />;
    } else if (!hasAccessToPercentages) {
      predictedSpreadContainer = (
        <Tooltip onClickRemove text = {'Predicted spread and over'}>
          <Locked iconFontSize={'20px'} key = {`${game.game_id}-predicted-spread-and-over-locked`} />
        </Tooltip>
      );
    } else if (game.prediction.home_score && game.prediction.away_score) {
      const spread = +(game.prediction.home_score - game.prediction.away_score).toFixed(0);
      const over = (game.prediction.home_score + game.prediction.away_score).toFixed(0);
      predictedSpreadContainer = (
        <Tooltip onClickRemove text = {'Predicted spread and over'}>
          <Typography key = {'predicted_spread'} type = 'overline' style = {{ color: theme.info.main, marginLeft: 10, fontSize: '11px' }}>{`${spread < 0 ? Game.getTeamNameShort('away') : Game.getTeamNameShort('home')} ${(spread > 0 ? spread * -1 : spread)} | O${over}`}</Typography>
        </Tooltip>
      );
    }

    const handleOpenVegas = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setVegasModalOpen(true);
    };


    return (
      <div style = {flexContainer} >
        <div style = {timeStyle}><Typography style = {{ display: 'inline-block', color: (Game.isInProgress() ? theme.info.dark : theme.text.secondary) }} type = 'overline'>{Game.getTime()}</Typography>{network}</div>
        {
          displayCardView === 'compact' && !Game.isFinal() && oddsTexts.length && hideOdds !== 1 ?
            <div><Tooltip onClickRemove text='Vegas'><IconButton value = 'vegas' onClick={handleOpenVegas} icon = {<AccountBalanceIcon style = {{ fontSize: 16, color: theme.amber[500] }} />} /></Tooltip></div>
            : ''
        }
        <Modal open = {vegasModalOpen} onClose={() => setVegasModalOpen(false)}>
          <Typography type = 'h6'>Vegas odds</Typography>
          {getOddsLine()}
          {
            (bookmakers && Object.keys(bookmakers).length) ?
              (
                <>
                  <Typography type = 'h6'>Bookmakers</Typography>
                  {Object.entries(bookmakers).map(([key, value]) => {
                    if (!bookmakersKeysToShow.includes(key)) {
                      return null;
                    }


                    let name = Game.getTeamNameShort('away');
                    let moneyLine = value.money_line_away || '-';
                    let spread = value.spread_away ? `${value.spread_away}` : '-';
                    const over = value.over ? `O${value.over}` : '-';

                    if (value.spread_home < value.spread_away) {
                      name = Game.getTeamNameShort('home');
                      moneyLine = value.money_line_home || '-';
                      spread = value.spread_home ? `${value.spread_home}` : '-';
                    }

                    return (
                      <div key = {key}>
                        <div><Typography type = 'body1' style = {{ color: theme.info.main }}>{value.title}:</Typography></div>
                        <div style = {{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography type = 'body2' style = {{ color: theme.text.secondary, minWidth: 30, textAlign: 'center' }}>{name}</Typography>
                          <Typography type = 'body2' style = {{ color: theme.text.secondary, minWidth: 30, textAlign: 'center' }}>{moneyLine}</Typography>
                          <Typography type = 'body2' style = {{ color: theme.text.secondary, minWidth: 30, textAlign: 'center' }}>{spread}</Typography>
                          <Typography type = 'body2' style = {{ color: theme.text.secondary, minWidth: 30, textAlign: 'center' }}>{over}</Typography>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : ''
          }
        </Modal>
        {/* {
          displayCardView === 'compact' && !Game.isFinal() && oddsTexts.length && hideOdds !== 1 ?
            <div><Typography style={{ display: 'inline-block', fontSize: '11px', color: theme.text.secondary }} type = 'overline'>{oddsTexts.join(' | ')}</Typography></div>
            : ''
        } */}
        {hideOdds !== 1 ? predictedSpreadContainer : ''}
        <Pin game_id = {game.game_id} />
      </div>
    );
  };

  let awayWinPercentageContainer: React.JSX.Element;
  let homeWinPercentageContainer: React.JSX.Element;

  if (isLoadingWinPercentage) {
    awayWinPercentageContainer = <Skeleton key = {1} style = {{ width: 32 }} />;
    homeWinPercentageContainer = <Skeleton key = {2} style = {{ width: 32 }} />;
  } else if (!hasAccessToPercentages) {
    awayWinPercentageContainer = (
      <div style = {{ display: 'flex' }}>
        <Tooltip key = {1} onClickRemove text = {'Predicted win %'}>
          <Locked iconFontSize={'20px'} />
        </Tooltip>
      </div>
    );
    homeWinPercentageContainer = (
      <div style = {{ display: 'flex' }}>
        <Tooltip key = {2} onClickRemove text = {'Predicted win %'}>
          <Locked iconFontSize={'20px'} />
        </Tooltip>
      </div>
    );
  } else {
    const awayPercentage = +(game.prediction.away_percentage * 100).toFixed(0);
    const homePercentage = +(game.prediction.home_percentage * 100).toFixed(0);

    awayWinPercentageContainer = (
      <Tooltip key = {1} text = {'Predicted win %'}>
        <Typography key = {'away_percent'} type = 'caption' style = {{ color: Color.lerpColor(worstColor, bestColor, game.prediction.away_percentage) }}>{awayPercentage}{(displayCardView === 'compact' ? '%' : '')}</Typography>
      </Tooltip>
    );
    homeWinPercentageContainer = (
      <Tooltip key = {2} text = {'Predicted win %'}>
        <Typography key = {'home_percent'} type = 'caption' style = {{ color: Color.lerpColor(worstColor, bestColor, game.prediction.home_percentage) }}>{homePercentage}{(displayCardView === 'compact' ? '%' : '')}</Typography>
      </Tooltip>
    );
  }

  const getOddsLine = () => {
    const awaySpreadCoverStyle: React.CSSProperties = {};
    const homeSpreadCoverStyle: React.CSSProperties = {};
    const awayMLStyle: React.CSSProperties = {};
    const homeMLStyle: React.CSSProperties = {};
    const overStyle: React.CSSProperties = {};
    const underStyle: React.CSSProperties = {};

    let tdAwaySpreadTitle = 'Pre-game spread';
    let tdHomeSpreadTitle = 'Pre-game spread';
    let tdAwayMLTitle = 'Pre-game money line';
    let tdHomeMLTitle = 'Pre-game money line';
    let tdOverTitle = 'Pre-game over';
    let tdUnderTitle = 'Pre-game under';

    if (Game.isFinal()) {
      if (Game.coveredSpread('away')) {
        awaySpreadCoverStyle.color = theme.success.main;
        tdAwaySpreadTitle = 'Covered pre spread';
      }
      if (Game.coveredSpread('home')) {
        homeSpreadCoverStyle.color = theme.success.main;
        tdHomeSpreadTitle = 'Covered pre spread';
      }
      if (Game.won('away')) {
        awayMLStyle.color = theme.success.main;
        tdAwayMLTitle = 'Covered money line';
      }
      if (Game.won('home')) {
        homeMLStyle.color = theme.success.main;
        tdHomeMLTitle = 'Covered money line';
      }
      if (Game.coveredOver()) {
        overStyle.color = theme.success.main;
        tdOverTitle = 'Covered over';
      }
      if (Game.coveredUnder()) {
        underStyle.color = theme.success.main;
        tdUnderTitle = 'Covered under';
      }
    } else if (Game.isInProgress()) {
      tdAwaySpreadTitle = 'Pre / Live spread';
      tdAwayMLTitle = 'Pre / Live money line';
      tdOverTitle = 'Pre / Live over';
      tdHomeSpreadTitle = 'Pre / Live spread';
      tdHomeMLTitle = 'Pre / Live money line';
      tdUnderTitle = 'Pre / Live under';
    }

    return (
      <table style = {{ width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style = {{ textAlign: 'left' }}><Typography type = 'caption'>-</Typography></th>
            <th><Typography type = 'caption'>ML</Typography></th>
            <th><Typography type = 'caption'>SPREAD</Typography></th>
            <th><Typography type = 'caption'>O/U</Typography></th>
            <th style = {{ textAlign: 'right' }}><Typography type = 'caption'>%</Typography></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style = {{ textAlign: 'left' }}><Typography type = 'caption'>{Game.getTeamNameShort('away')}</Typography></td>
            <td title = {tdAwayMLTitle} style = {({ color: Game.oddsReversal('away') ? theme.warning.main : theme.text.primary, ...awayMLStyle })}><Typography type = 'caption'>{Game.getPreML('away')}{Game.isInProgress() ? ` / ${Game.getLiveML('away')}` : ''}</Typography></td>
            <td title = {tdAwaySpreadTitle}><Typography type = 'caption' style = {awaySpreadCoverStyle}>{Game.getPreSpread('away')}{Game.isInProgress() ? ` / ${Game.getLiveSpread('away')}` : ''}</Typography></td>
            <td title = {tdOverTitle}><Typography type = 'caption' style = {overStyle}>{Game.getPreOver() !== '-' ? `O ${Game.getPreOver()}` : '-'}{Game.isInProgress() ? ` / ${Game.getLiveOver()}` : ''}</Typography></td>
            <td style = {{ textAlign: 'right' }}>{awayWinPercentageContainer}</td>
          </tr>
          <tr>
            <td style = {{ textAlign: 'left' }}><Typography type = 'caption'>{Game.getTeamNameShort('home')}</Typography></td>
            <td title = {tdHomeMLTitle} style = {({ color: Game.oddsReversal('home') ? theme.warning.main : theme.text.primary, ...homeMLStyle })}><Typography type = 'caption'>{Game.getPreML('home')}{Game.isInProgress() ? ` / ${Game.getLiveML('home')}` : ''}</Typography></td>
            <td title = {tdHomeSpreadTitle}><Typography type = 'caption' style = {homeSpreadCoverStyle}>{Game.getPreSpread('home')}{Game.isInProgress() ? ` / ${Game.getLiveSpread('home')}` : ''}</Typography></td>
            <td title = {tdUnderTitle}><Typography type = 'caption' style = {underStyle}>{Game.getPreUnder() !== '-' ? `U ${Game.getPreUnder()}` : '-'}{Game.isInProgress() ? ` / ${Game.getLiveUnder()}` : ''}</Typography></td>
            <td style = {{ textAlign: 'right' }}>{homeWinPercentageContainer}</td>
          </tr>
        </tbody>
      </table>
    );
  };


  const getTeamLine = (side: string) => {
    const flexContainer: React.CSSProperties = {
      display: 'flex',
      margin: (displayCardView === 'super_compact' ? 0 : '5px 0px'),
      alignItems: displayCardView === 'compact' ? 'center' : 'self-end',
    };

    const nameStyle: React.CSSProperties = {
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    const scoreStyle: React.CSSProperties = {
      margin: '0px 5px',
      width: '34px',
      maxWidth: '34px',
      border: `2px solid ${theme.text.secondary}`,
      borderRadius: '5px',
      textAlign: 'center',
      flex: 2,
    };

    // is picked
    if (
      hideOdds !== 1 &&
      (
        (
          side === 'home' &&
          game.prediction &&
          game.prediction.home_percentage !== null &&
          game.prediction.home_percentage > game.prediction.away_percentage
        ) ||
        (
          side === 'away' &&
          game.prediction &&
          game.prediction.home_percentage !== null &&
          game.prediction.home_percentage < game.prediction.away_percentage
        )
      )
    ) {
      scoreStyle.border = `2px solid ${theme.secondary.dark}`;
    }

    // won
    if (
      (
        side === 'home' &&
        game.home_score > game.away_score
      ) ||
      (
        side === 'away' &&
        game.home_score < game.away_score
      )
    ) {
      scoreStyle.backgroundColor = 'rgba(66, 245, 96, 0.5)';
    }

    if (displayCardView === 'super_compact') {
      delete scoreStyle.border;
    }

    const team_id = game[`${side}_team_id`];

    // let spread: string | null = null;
    // let overUnder: string | null = null;

    const moneyLineToUse = (Game.isInProgress() ? Game.getLiveML(side) : Game.getPreML(side));

    // if (
    //   side === 'home' &&
    //   spreadToUseHome !== '-' &&
    //   spreadToUseHome < spreadToUseAway
    // ) {
    //   spread = spreadToUseHome;
    // } else if (
    //   side === 'away' &&
    //   spreadToUseAway !== '-' &&
    //   spreadToUseAway < spreadToUseHome
    // ) {
    //   spread = spreadToUseAway;
    // } else {
    //   if (overUnderToUse !== '-') {
    //     overUnder = 'O' + overUnderToUse;
    //   }
    // }

    let scores: null | React.JSX.Element = null;

    if (displayCardView === 'super_compact') {
      if (Game.isInProgress() || Game.isFinal()) {
        scores = <div style = {scoreStyle}>{game[`${side}_score`] || 0}</div>;
      }
    } else {
      scores = <div style = {scoreStyle}>{Game.isInProgress() || Game.isFinal() ? game[`${side}_score`] || 0 : '-'}</div>;
    }

    return (
      <div style = {flexContainer} >
        <div style = {nameStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 14 }} type = {'h6'}>
              <Rank game={game} team_id={team_id} />
              {Game.getTeamName(side)}
              {favorite_team_ids.indexOf(team_id) > -1 ? <FavoriteIcon style = {{ color: theme.warning.light, fontSize: 12, marginLeft: 5 }} /> : ''}
              <Record game={game} team_id={team_id} />
            </Typography>
            {
              displayCardView === 'compact' && !Game.isFinal() && hideOdds !== 1 ?
                <div><Typography style={{ fontSize: '11px', color: (Game.oddsReversal(side) ? theme.warning.main : theme.text.secondary) }} type = 'overline'>{/* overUnder ? overUnder + ' | ' : '' */}{/* spread ? spread + ' | ' : '' */}{moneyLineToUse}</Typography></div>
                : ''
            }
          </div>
        </div>
        {scores}
      </div>
    );
  };

  const getTeamLines = () => {
    const flexContainer = {
      display: 'flex',
      alignItems: 'center',
    };

    const teamStyle = {
      flex: 1,
    };

    return (
      <div style = {flexContainer}>
        <div style = {teamStyle}>
          {
            displayCardView === 'super_compact' ?
              <div><Typography style = {{ display: 'inline-block', lineHeight: 'initial', color: (!Game.isFinal() ? theme.info.dark : theme.text.secondary) }} type = 'overline'>{Game.getTime()}{(!Game.isFinal() && !Game.isInProgress() ? <Typography key = {Game.getNetwork()} style = {{ display: 'inline-block', lineHeight: 'initial', color: theme.text.secondary }} type = 'overline'>{Game.getNetwork()}</Typography> : '')}</Typography></div>
              : ''
          }
          {getTeamLine('away')}
          {getTeamLine('home')}
        </div>
        {
          displayCardView === 'compact' && hideOdds !== 1 ?
          <div style = {{ display: 'flex', flexFlow: 'column', padding: `0px ${hasAccessToPercentages || isLoadingWinPercentage ? 5 : 0}px` }}>
            <div style={{
              minHeight: 40, minWidth: 24, textAlign: 'center', lineHeight: '40px', alignContent: 'center',
            }}>{awayWinPercentageContainer}</div>
            <div style={{
              minHeight: 40, minWidth: 24, textAlign: 'center', lineHeight: '40px', alignContent: 'center',
            }}>{homeWinPercentageContainer}</div>
          </div>
            : ''
        }
      </div>
    );
  };

  const divStyle = getTileBaseStyle();

  if (Game.isNeutralSite()) {
    divStyle.height = +(divStyle.height || 0) + 21;
  }

  const teamLineStyle: React.CSSProperties = {
    cursor: 'pointer',
    padding: '10px',
  };


  if (displayCardView === 'large') {
    divStyle.height = 255 + (!hasAccessToPercentages ? 25 : 0) + (Game.isNeutralSite() ? 21 : 0);
  }

  if (displayCardView === 'super_compact') {
    divStyle.cursor = 'pointer';
    delete divStyle.height;
    delete divStyle.minHeight;
    divStyle.width = '100%';
    divStyle.margin = '0px 3.5px';

    return (
      <div
        className = {Style.getStyleClassName(divStyle)}
        onClick={handleClick}
        ref = {ref}
      >
        <div>{getTeamLines()}</div>
        <hr className = {Style.getStyleClassName({ margin: 0, backgroundColor: (theme.mode === 'dark' ? theme.grey[800] : theme.grey[400]), border: 'none', height: 1 })} />
      </div>
    );
  }

  return (
    <div
      className = {Style.getStyleClassName(divStyle)}
      onClick={handleClick}
    >
      <Paper elevation={3} ref = {ref} hover>
        {
          isVisible ?
          <>
            {getIndicators()}
            <div style = {teamLineStyle}>
              {getHeader()}
              {getTeamLines()}
            </div>
            {
              displayCardView === 'large' ?
                <div style = {{ padding: '0px 10px 10px 10px' }}>
                  <hr style ={{ marginTop: 0 }} />
                  {hideOdds !== 1 ? getOddsLine() : ''}
                </div>
                : ''
            }
            </>
            : <>
              <Skeleton style = {{ height: divStyle.height, transform: 'initial' }} />
            </>
        }
      </Paper>
    </div>
  );
};

export default Tile;
