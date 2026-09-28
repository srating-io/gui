'use client';

import React, { useMemo, useState, useTransition } from 'react';

import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import CancelCircleIcon from '@esmalley/react-material-icons/Cancel';

import HelperGame from '@/components/helpers/Game';
import Organization from '@/components/helpers/Organization';
import Odds from '@/components/helpers/Odds';
import Scenario, { ScenarioPick, ScenarioSummary } from '@/components/helpers/Scenario';
import useDebounce from '@/components/hooks/useDebounce';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { Dates, Sorter } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import {
  Button, CircularProgress, Columns, Inputs, Paper, Table, Tbody, Td, TextInput, Th, Thead, Tr, Typography, useTheme, useWindowDimensions,
} from '@esmalley/react-material-ui';


type CommittedFilters = {
  bet: number;
  priceMin: number;
  priceMax: number;
  confidence: number;
  roundRobin: number;
};

const defaultFilters: CommittedFilters = {
  bet: 10,
  priceMin: -2000,
  priceMax: 500,
  confidence: 75,
  roundRobin: 0,
};

// The win rates the projections are run at. 1 is the everything-lands case.
const projectedWinRates = [1, 0.75, 0.6];

const money = (value: number): string => value.toFixed(2);
const percent = (value: number): string => (value * 100).toFixed(2);


const Calculator = ({ games, date }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const dispatch = useAppDispatch();
  const [, startTransition] = useTransition();

  const picksData = useAppSelector((state) => state.picksReducer.picks);
  const picksLoading = useAppSelector((state) => state.picksReducer.picksLoading);
  const displayRank = useAppSelector((state) => state.displayReducer.rank);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const path = Organization.getPath({ organizations, organization_id });
  const hasAccess = useAppSelector((state) => state.userReducer.isValidSession);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('start_timestamp');

  // What the fields show, updated on every keystroke so typing stays responsive.
  const [inputBet, setBet] = useState<string | number>(defaultFilters.bet);
  const [inputPriceMin, setPriceMin] = useState<string | number>(defaultFilters.priceMin);
  const [inputPriceMax, setPriceMax] = useState<string | number>(defaultFilters.priceMax);
  const [inputRoundRobin, setRoundRobin] = useState<string | number>(defaultFilters.roundRobin);
  const [inputConfidence, setConfidence] = useState<string | number>(defaultFilters.confidence);

  // What the maths runs on. Held apart from the fields and updated on a debounce, because a
  // twenty leg round robin is 184,756 combinations and should not be rebuilt mid-keystroke.
  const [filters, setFilters] = useState<CommittedFilters>(defaultFilters);

  const commitFilters = useDebounce(() => {
    setFilters({
      bet: inputBet ? +inputBet : 0,
      priceMin: inputPriceMin ? +inputPriceMin : 0,
      priceMax: inputPriceMax ? +inputPriceMax : 0,
      confidence: inputConfidence ? +inputConfidence : 0,
      roundRobin: inputRoundRobin ? +inputRoundRobin : 0,
    });
  }, 400);

  // Recomputed rather than held in state: a value frozen at mount sends the whole component
  // down the wrong branch once the tab has been open past midnight.
  const now = Dates.format(Dates.parse(), 'Y-m-d');

  // The live scores arrive separately, so merge a copy. Mutating the prop in place would leave
  // every memo below looking at an unchanged reference over changed data.
  const merged = useMemo(() => {
    const out = {};

    for (const game_id in games) {
      out[game_id] = (picksData && game_id in picksData) ?
        { ...games[game_id], ...picksData[game_id] } :
        games[game_id];
    }

    return out;
  }, [games, picksData]);

  const { eligible, rejected } = useMemo(
    () => Scenario.getPicks({ games: merged, filters }),
    [merged, filters],
  );

  const legs = useMemo(() => Scenario.getLegs(eligible), [eligible]);

  const settled = useMemo(
    () => Scenario.getSettled({ picks: eligible, bet: filters.bet }),
    [eligible, filters.bet],
  );

  // One build of the combinations feeds the settled figure and every projected win rate.
  const roundRobin = useMemo(
    () => Scenario.getRoundRobin({ legs, size: filters.roundRobin, bet: filters.bet, winRates: projectedWinRates }),
    [legs, filters.roundRobin, filters.bet],
  );

  const settledRoundRobin = roundRobin.settled;

  const projected = useMemo(() => projectedWinRates.map((winRate, index) => ({
    winRate,
    straight: Scenario.getProjected({ picks: eligible, bet: filters.bet, winRate }),
    roundRobin: roundRobin.projected[index].summary,
  })), [eligible, roundRobin, filters.bet]);

  // Projection accuracy over the whole slate. Not derived from the picks above, because a
  // game the model called correctly still counts when nobody posted a line on it.
  const accuracy = useMemo(() => Scenario.getAccuracy({ games: merged }), [merged]);


  if (picksLoading) {
    return (<div style={{ textAlign: 'center' }}><CircularProgress /></div>);
  }

  const isPast = date < now;
  const isToday = date === now;

  const handleGame = (game_id: string) => {
    navigation.game(`/${path}/games/${game_id}`);
  };

  const handleSort = (id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const headCells = [
    { id: 'pick', label: 'Pick' },
    { id: 'pick_ml', label: 'Pick ML' },
    { id: 'start_timestamp', label: 'Start' },
    { id: 'vs', label: 'VS' },
    { id: 'vs_ml', label: 'VS ML' },
    { id: 'chance', label: '%' },
    { id: 'result', label: 'Result' },
  ];

  /**
   * Sort key for a pick, matching the column ids above.
   */
  const getSortValue = (pick: ScenarioPick, key: string) => {
    const Game = new HelperGame({ game: pick.game });
    const other = pick.side === 'home' ? 'away' : 'home';

    if (key === 'pick') {
      return Game.getTeamName(pick.side);
    }

    if (key === 'pick_ml') {
      return pick.price;
    }

    if (key === 'vs') {
      return Game.getTeamName(other);
    }

    if (key === 'vs_ml') {
      return pick.oppositePrice;
    }

    if (key === 'chance') {
      return pick.probability;
    }

    if (key === 'result') {
      return pick.won ? 1 : 0;
    }

    return pick.start_timestamp;
  };

  const getSortedPicks = (picks: ScenarioPick[]) => {
    // Sort flat rows and map back, because the shared comparator is typed for plain values.
    const comparator = Sorter.getComparator(order, 'value');
    const byId: { [game_id: string]: ScenarioPick } = {};
    const rows: Record<string, string | number>[] = [];

    for (const pick of picks) {
      byId[pick.game_id] = pick;
      rows.push({ game_id: pick.game_id, value: getSortValue(pick, orderBy) });
    }

    return rows.sort(comparator).map((row) => byId[row.game_id]);
  };

  const getStyledTableRow = (pick: ScenarioPick, index: number) => {
    const Game = new HelperGame({ game: pick.game });
    const other = pick.side === 'home' ? 'away' : 'home';

    const teamCellStyle: React.CSSProperties = {
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    };

    if (width < 800) {
      teamCellStyle.position = 'sticky';
      teamCellStyle.left = 0;
      teamCellStyle.backgroundColor = (theme.mode === 'light' ? theme.grey[200] : theme.grey[900]);
    }

    let trColor = (index % 2 === 0 ? theme.grey[800] : theme.grey[900]);

    if (theme.mode === 'light') {
      trColor = index % 2 === 0 ? theme.grey[200] : theme.grey[300];
    }

    const trStyle = {
      padding: '4px 5px',
      border: 0,
      backgroundColor: trColor,
      '&:hover td': {
        backgroundColor: (theme.mode === 'light' ? theme.info.light : theme.info.dark),
      },
    };

    const pickRank = Game.getTeamRank(pick.side, displayRank);
    const vsRank = Game.getTeamRank(other, displayRank);

    let icon: string | React.JSX.Element = '-';

    if (pick.settled && pick.won !== null) {
      icon = (pick.won ?
        <CheckCircleIcon style = {{ fontSize: 24, color: theme.success.main }} /> :
        <CancelCircleIcon style = {{ fontSize: 24, color: theme.error.main }} />);
    }

    return (
      <Tr key={pick.game_id} style={trStyle} onClick={() => { handleGame(pick.game_id); }}>
        <Td style = {teamCellStyle}><div>{pickRank ? <sup style = {{ marginRight: '5px' }}>{pickRank}</sup> : ''}{Game.getTeamName(pick.side)}</div></Td>
        <Td>{Odds.formatPrice(pick.price)}</Td>
        <Td>{Game.getStartTime()}</Td>
        <Td style = {{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <div>{vsRank ? <sup style = {{ marginRight: '5px' }}>{vsRank}</sup> : ''}{Game.getTeamName(other)}</div>
        </Td>
        <Td>{Odds.formatPrice(pick.oppositePrice)}</Td>
        <Td>{(pick.probability * 100).toFixed(0)}</Td>
        <Td>{icon}</Td>
      </Tr>
    );
  };

  const getTable = (picks: ScenarioPick[]) => {
    return (
      <Table>
        <Thead>
          <Tr>
            {headCells.map((headCell) => (
              <Th
                style = {{ padding: '4px 5px', border: 0, backgroundColor: theme.mode === 'light' ? theme.info.light : theme.info.dark }}
                key={headCell.id}
                onClick={() => { handleSort(headCell.id); }}
                sortable = {true}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {getSortedPicks(picks).map((pick, index) => getStyledTableRow(pick, index))}
        </Tbody>
      </Table>
    );
  };

  /**
   * The three lines every scenario prints, so the settled case and each projected win rate
   * read identically.
   */
  const getSummaryBlock = (key: string, heading: string | null, summary: ScenarioSummary, unit: string, count: number) => {
    if (!summary.staked) {
      return null;
    }

    return (
      <div key = {key}>
        {heading ? <Typography type = 'subtitle2' style = {{ color: theme.text.secondary, marginTop: '10px' }}>{heading}</Typography> : ''}
        <Typography type = 'body1'>{`Total bet: $${money(summary.staked)} (${count} ${unit})`}</Typography>
        <Typography type = 'body1'>{`Won: $${money(summary.returned)} (${Math.round(summary.wins)} (${percent(count ? summary.wins / count : 0)}%))`}</Typography>
        <Typography type = 'body1'>{`Net: $${money(summary.net)} (${percent(summary.roi)}%)`}</Typography>
      </div>
    );
  };

  const getWinRateHeading = (winRate: number) => `${(winRate * 100).toFixed(0)}% win rate`;

  const getStraightBlock = (row) => getSummaryBlock(`straight-${row.winRate}`, getWinRateHeading(row.winRate), row.straight, 'games', row.straight.games);

  const getRoundRobinBlock = (row) => getSummaryBlock(`rr-${row.winRate}`, getWinRateHeading(row.winRate), row.roundRobin, 'parlays', row.roundRobin.combos);

  const inputHandler = new Inputs();

  const handleChange = (setter) => (val) => {
    setter(val);
    commitFilters();
  };

  const inputs = (
    <Columns key = 'inputs' numberOfColumns={4} breakPoint={600}>
      <TextInput style = {{ display: 'inline-flex' }} inputHandler = {inputHandler} id="bet" formatter='number' placeholder="Bet" variant="standard" value={inputBet} onChange = {handleChange(setBet)} />
      <TextInput style = {{ display: 'inline-flex' }} inputHandler = {inputHandler} id="oddsMin" formatter='number' placeholder="Odd Min" variant="standard" value={inputPriceMin} onChange = {handleChange(setPriceMin)} />
      <TextInput style = {{ display: 'inline-flex' }} inputHandler = {inputHandler} id="oddsmax" formatter='number' placeholder="Odds Max" variant="standard" value={inputPriceMax} onChange = {handleChange(setPriceMax)} />
      <TextInput style = {{ display: 'inline-flex' }} inputHandler = {inputHandler} id="precentage" formatter='number' placeholder="Win chance %" variant="standard" value={inputConfidence} onChange = {handleChange(setConfidence)} />
    </Columns>
  );

  const roundRobinInput = (
    <TextInput key = 'round-robin-input' style = {{ display: 'inline-flex' }} inputHandler = {inputHandler} id="roundRobin" formatter='number' placeholder="Round robin parlay" variant="standard" value={inputRoundRobin} onChange = {handleChange(setRoundRobin)} />
  );

  const roundRobinBlurb = (
    <Typography key = 'round-robin-blurb' type = 'subtitle1' style = {{ color: theme.text.secondary }}>
      A round robin bet creates a parlay for every possible combination of games based on the input
      below. It will use the inputs above as a base for games to select. Must have at least 2 eligible
      games. Ex: if there are 10 games total and you select 9 games, it would create 10 parlays of 9
      games each.
    </Typography>
  );

  const getContents = () => {
    if (isPast) {
      return [
        inputs,
        <Typography key = 'blurb' type = 'subtitle1' style = {{ color: theme.text.secondary }}>{`Hypothetical pre-game ML betting $${filters.bet} on each pick with odds greater than ${filters.priceMin} and less than ${filters.priceMax}`}</Typography>,
        getSummaryBlock('settled', null, settled, 'games', settled.games),
        roundRobinBlurb,
        roundRobinInput,
        getSummaryBlock('settled-rr', null, settledRoundRobin, 'parlays', settledRoundRobin.combos),
      ];
    }

    if (isToday) {
      return [
        inputs,
        <Typography key = 'blurb' type = 'subtitle1' style = {{ color: theme.text.secondary }}>{`Future pre-game ML betting $${filters.bet} on each pick with odds greater than ${filters.priceMin} and less than ${filters.priceMax}`}</Typography>,
        ...projected.map(getStraightBlock),
        roundRobinBlurb,
        roundRobinInput,
        ...projected.map(getRoundRobinBlock),
      ];
    }

    return [
      <Typography key = 'none' type = 'subtitle1' style = {{ textAlign: 'center', color: theme.text.secondary }}>No betting info available yet... come back soon!</Typography>,
    ];
  };


  if (!hasAccess) {
    const handleSubscribe = () => {
      dispatch(setLoading(true));
      startTransition(() => {
        navigation.getRouter().push('/pricing');
      });
    };

    const handleLiveWinRate = () => {
      navigation.picksView({ view: 'stats' });
    };

    return (
      <div style = {{ maxWidth: 400, margin: 'auto' }}>
        <Typography type = 'h6' style = {{ marginBottom: 10 }}>Subscription required</Typography>
        <Typography type = 'body1' style = {{ marginBottom: 10 }}>Subscribe for just $5 per month to unlock subscriber tools!</Typography>
        <Typography type = 'a' onClick = {handleLiveWinRate}>View the live accuracy</Typography>
        <div style = {{ textAlign: 'right' }}>
          <Button onClick={handleSubscribe} autoFocus title = {'Subscribe'} value = 'subscribe' />
        </div>
      </div>
    );
  }

  const parlayPicks = (filters.roundRobin > 1 && legs.length > filters.roundRobin) ? legs : [];


  return (
    <div style = {{ padding: '0px 5px' }}>
      <Typography type="h6">Betting calculator</Typography>
      <Paper elevation={3} style = {{ padding: '10px', margin: '0px 0px 10px 0px' }}>
        {getContents()}
      </Paper>
      {accuracy.total ? <div>{`Total win rate: ${Math.round((accuracy.correct / accuracy.total) * 100)}% ${accuracy.correct} / ${accuracy.total}`}</div> : ''}
      {parlayPicks.length ? <Typography style = {{ margin: '10px 0px' }} type="h6">Parley games</Typography> : ''}
      {parlayPicks.length ? getTable(parlayPicks) : ''}
      {eligible.length ? <Typography style = {{ margin: '10px 0px' }} type="h6">Games bet</Typography> : ''}
      {eligible.length ? getTable(eligible) : ''}
      {rejected.length ? <Typography style = {{ margin: '10px 0px' }} type="h6">Other games</Typography> : ''}
      {rejected.length ? getTable(rejected) : ''}
    </div>
  );
};


export default Calculator;
