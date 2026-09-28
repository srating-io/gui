'use client';

import ExpandLessIcon from '@esmalley/react-material-icons/ExpandLess';
import ExpandMoreIcon from '@esmalley/react-material-icons/ExpandMore';
import InfoOutlinedIcon from '@esmalley/react-material-icons/InfoOutlined';
import CompareArrowsIcon from '@esmalley/react-material-icons/CompareArrows';

import { useState, useTransition } from 'react';

import HelperGame from '@/components/helpers/Game';
import Odds from '@/components/helpers/Odds';
import General from '@/components/helpers/General';
import Locked from '@/components/generic/Billing/Locked';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Accuracy } from '@/redux/features/picks-slice';
import { Color } from '@esmalley/ts-utils';
import { Button, Divider, Paper, Skeleton, Tooltip, Typography, useTheme } from '@esmalley/react-material-ui';
import Help from './Help';
import Sources from './Sources';


/**
 * Where the model's projection sits against the market's number.
 *
 * Shared by the projections tile and the game page's lines section. The two differ only in
 * where the fresher scores live and whether the section collapses, so both arrive as props
 * and everything below is computed from the game alone.
 *
 * `liveRows` is a getScores style map keyed by game_id, carrying odds and a prediction that
 * may be newer than the server-rendered game. `accuracy` is the model accuracy payload; without
 * it the track record row simply does not appear.
 */
const Analysis = (
  { game, liveRows, accuracy, collapsible = false, loading = false, maxWidth = 750 }:
  {
    game;
    liveRows?: object;
    accuracy?: Accuracy;
    collapsible?: boolean;
    loading?: boolean;
    maxWidth?: number;
  },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [, startTransition] = useTransition();

  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const hideOdds = useAppSelector((state) => state.displayReducer.hideOdds);
  const hasAccess = useAppSelector((state) => state.userReducer.isValidSession);

  // On the projections page PredictionLine merges this same data onto the shared game object
  // during its own render, which runs after ours. Merge a copy here instead of depending on
  // that ordering, and without mutating.
  const liveRow = (liveRows && game.game_id in liveRows) ? liveRows[game.game_id] : null;
  const merged = liveRow ? { ...game, ...liveRow } : game;

  const Game = new HelperGame({ game: merged });

  const prediction = merged.prediction || null;
  const preOdds = (merged.odds && merged.odds.pre) || null;

  // HelperGame owns the pre-vs-live decision so every surface agrees.
  const activeOdds = Game.getActiveOddsRow();
  const isLiveRow = (activeOdds !== null && activeOdds !== preOdds);
  const bookmakers = Game.getActiveBookMakers();

  // Read the raw rows rather than HelperGame.getPreSpread and friends: those use a truthiness
  // check, so a pick-em spread of 0 or a total of 0 would come back as the '-' sentinel.
  const marketSpreadHome = activeOdds ? activeOdds.spread_home : null;
  const marketTotal = activeOdds ? activeOdds.over : null;

  const modelAway = Game.getModelProbability('away');
  const modelHome = Game.getModelProbability('home');

  const fair = Game.getFairProbabilities();
  const { side, edge } = Game.getBestEdge();

  const hasProjection = (modelAway !== null && modelHome !== null);

  if (loading) {
    return <Skeleton animation = 'pulse' style = {{ width: '100%', maxWidth, height: 30, margin: '10px 0px' }} />;
  }

  // Every row needs a projection. A subscriber without one simply has no data for this game,
  // so say nothing; anyone else is missing it because it sits behind the subscription, and gets
  // a preview of what is there instead.
  const locked = (!hasProjection && !hasAccess);

  if (!hasProjection && !locked) {
    return null;
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // The bar carries role='button', so it has to answer the keyboard the way a button would.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const handleHelp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHelpOpen(true);
  };

  const handleSources = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSourcesOpen(true);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setLoading(true));
    startTransition(() => {
      navigation.getRouter().push('/pricing');
    });
  };


  const sourcePrices = side === null ? [] : Odds.getPrices({ bookmakers, side });

  // Two columns of stacked label / value pairs. Nothing is nowrap: at half width a long label
  // like the spread comparison would otherwise run past the edge of the tile on a phone.
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: 12,
    rowGap: 8,
  };

  /**
   * One label with its value underneath, filling a single cell of the grid.
   * `extra` renders under the value, for the cell that carries its own control.
   */
  const getRow = (key: string, label: string, tooltip: string, value: string, color?: string, extra?: React.JSX.Element) => {
    return (
      <div key = {key} style = {{ minWidth: 0 }}>
        <Tooltip position = 'top' text = {tooltip}>
          <Typography type = 'overline' style = {{ color: theme.text.secondary, display: 'block', lineHeight: '16px' }}>{label}</Typography>
        </Tooltip>
        <Typography type = 'overline' style = {{ color: color || theme.text.primary, display: 'block', lineHeight: '18px', fontWeight: 700 }}>{value}</Typography>
        {extra || ''}
      </div>
    );
  };

  /**
   * Green when the model is ahead of the market, red when it is behind.
   * Only for numbers where one direction is genuinely better than the other.
   */
  const getEdgeColor = (value: number) => {
    const scaled = Math.min(Math.abs(value) / 10, 1);
    const base = value >= 0 ? General.getBestColor() : General.getWorstColor();

    return Color.lerpColor(theme.text.secondary, base, scaled);
  };

  /**
   * Neutral emphasis by size alone, for numbers that point one way or the other without
   * either way being better. A bigger disagreement reads as more notable; the sign on the
   * number already carries the direction.
   */
  const getMagnitudeColor = (value: number, scale: number) => {
    return Color.lerpColor(theme.text.primary, theme.info.main, Math.min(Math.abs(value) / scale, 1));
  };

  const getSummary = () => {
    let label = 'Edge';

    if (Game.isFinal()) {
      label = 'Pre-game edge';
    } else if (Game.isInProgress()) {
      label = 'Live edge';
    }

    if (locked) {
      return (
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>{label}</Typography>
      );
    }

    if (hideOdds === 1 || edge === null || side === null) {
      return (
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>
          {hideOdds === 1 ? 'Market comparison hidden' : 'No market line for this game'}
        </Typography>
      );
    }

    return (
      <div style = {{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <Tooltip position = 'top' text = {'The gap between our projected win % and the win % the market line implies. This is a difference between two percentages, not a point spread. Positive means we rate this team higher than the market does, and a bigger number means the two disagree more strongly.'}>
          <Typography type = 'overline' style = {{ color: theme.text.secondary }}>{label}</Typography>
        </Tooltip>
        <Typography type = 'overline' style = {{ color: getEdgeColor(edge), fontWeight: 700 }}>
          {`${Game.getTeamNameShort(side)} ${Odds.formatSigned(edge)}%`}
        </Typography>
      </div>
    );
  };

  const getBody = () => {
    // Assembled in a deliberate order further down, so the pairs that sit side by side in the
    // two column grid are the ones that belong together.
    const rows: { [key: string]: React.JSX.Element } = {};

    if (hideOdds !== 1 && side !== null && fair !== null) {
      const modelProbability = side === 'away' ? modelAway : modelHome;
      const fairProbability = side === 'away' ? fair.away : fair.home;

      rows.win_percentage = getRow(
        'win_percentage',
        `Projected vs market win % (${Game.getTeamNameShort(side)})`,
        'Our win percentage for this team next to the one the market line implies, and the gap between them. Ours comes from team ratings and never looks at the market; the market figure has its built-in margin removed so both sides add to 100%.',
        `${Odds.formatProbability(modelProbability)} vs ${Odds.formatProbability(fairProbability)} (${edge === null ? '-' : Odds.formatSigned(edge)})`,
        edge === null ? undefined : getEdgeColor(edge),
      );
    }

    if (hideOdds !== 1) {
      const marginDelta = Odds.getMarginDelta({ prediction, marketSpreadHome });
      const projectedMargin = Odds.getProjectedMargin(prediction);

      if (marginDelta !== null && projectedMargin !== null) {
        rows.margin = getRow(
          'margin',
          'Projected vs market spread',
          'Our projected margin, the market spread, and the gap between them. Both are written from the home side, so a negative number means that team is favoured. A wide gap means we disagree about how the game goes, not just who wins.',
          `${Odds.formatSigned(-projectedMargin)} vs ${Odds.formatSigned(marketSpreadHome)} (${Odds.formatSigned(marginDelta)})`,
          getMagnitudeColor(marginDelta, 10),
        );
      }

      const totalDelta = Odds.getTotalDelta({ prediction, marketTotal });
      const projectedTotal = Odds.getProjectedTotal(prediction);

      if (totalDelta !== null && projectedTotal !== null) {
        rows.total = getRow(
          'total',
          'Projected vs market total',
          'Our projected combined score, the market total, and the gap. Positive means we expect more scoring than the market does.',
          `${projectedTotal.toFixed(0)} vs ${marketTotal} (${Odds.formatSigned(totalDelta)})`,
          // Totals run much higher in some sports than others, so scale off the market number.
          getMagnitudeColor(totalDelta, Math.max(Number(marketTotal) * 0.07, 3)),
        );
      }

      if (side !== null) {
        const best = Odds.getBestPrice({ bookmakers, side });

        if (best !== null) {
          rows.best_number = getRow(
            'best_number',
            'Best available',
            'The most favourable number posted across the market sources we track, and where it is. Sources rarely agree exactly, so the first number you see is not always the best one.',
            `${Odds.formatPrice(best.price)} (${best.title})`,
          );
        }

        const dispersion = Odds.getPriceDispersion({ bookmakers, side });

        if (dispersion !== null) {
          rows.dispersion = getRow(
            'dispersion',
            'Source range',
            'The gap between the best and worst win % the sources imply for this side. A wide range means they have not settled on a number, so treat the edge above with more caution.',
            `${dispersion.toFixed(1)}%`,
          );
        }
      }

      // Only meaningful while the game is running: outside that there is no second row to compare.
      if (isLiveRow && preOdds && side !== null) {
        const preFair = Odds.getFairProbabilities({
          away: preOdds.money_line_away,
          home: preOdds.money_line_home,
        });

        if (preFair !== null && fair !== null) {
          const movement = ((side === 'away' ? fair.away : fair.home) - (side === 'away' ? preFair.away : preFair.home)) * 100;

          rows.movement = getRow(
            'movement',
            'Market move',
            'How far the market-implied win % has moved since before the game started. A large move means the market has changed its mind; our projection may not have.',
            `${Odds.formatSigned(movement)}%`,
            getMagnitudeColor(movement, 10),
          );
        }
      }
    }

    // getBody only runs for a subscriber with a projection, but the early return above is now
    // conditional, so narrow explicitly rather than leaning on it.
    const topProbability = (modelAway === null || modelHome === null) ? null : Math.max(modelAway, modelHome);
    const calibration = (
      Odds.getCalibrationAccuracy({ buckets: accuracy && accuracy.season, probability: topProbability }) ||
      Odds.getCalibrationAccuracy({ buckets: accuracy && accuracy.month, probability: topProbability }) ||
      Odds.getCalibrationAccuracy({ buckets: accuracy && accuracy.week, probability: topProbability })
    );

    if (calibration !== null) {
      rows.calibration = getRow(
        'calibration',
        `Track record at ${calibration.bucket}-${calibration.bucket + 10}%`,
        'How often the model has actually been right this season when it projected a win percentage in this range. Use it to judge how much weight the numbers above deserve.',
        `${(calibration.accuracy * 100).toFixed(0)}% (${calibration.correct} of ${calibration.total})`,
        Color.lerpColor(General.getWorstColor(), General.getBestColor(), calibration.accuracy),
      );
    }

    // Ordered so each grid row pairs things that read together: the projection against its own
    // track record, then the two market comparisons, then the two source rows.
    const ordered = ['win_percentage', 'calibration', 'margin', 'total', 'best_number', 'dispersion', 'movement']
      .map((key) => rows[key])
      .filter((row) => !!row);

    if (!ordered.length) {
      return (
        <Typography type = 'overline' style = {{ color: theme.text.secondary }}>Nothing to compare for this game</Typography>
      );
    }

    return (
      <>
        <div style = {gridStyle}>{ordered}</div>
        <div style = {{ marginTop: 4, display: 'flex', justifyContent: (sourcePrices.length > 1 ? 'space-between' : 'right') }}>
          {sourcePrices.length > 1 ? (
              <Button
                ink
                title = {`Compare ${sourcePrices.length} sources`}
                value = 'market-sources'
                onClick = {handleSources}
                endIcon = {<CompareArrowsIcon style = {{ fontSize: 20, marginLeft: 5 }} />}
              />
          ) : ''
          }
          <Button
            ink
            title = {'What do these mean?'}
            value = 'analysis-help'
            onClick = {handleHelp}
            endIcon = {<InfoOutlinedIcon style = {{ fontSize: 20, marginLeft: 5 }} />}
          />
        </div>
      </>
    );
  };

  /**
   * What someone without a subscription sees: the real labels with the numbers withheld, so the
   * shape of what is behind the gate is visible rather than an empty panel.
   */
  const getLockedBody = () => {
    const placeholders = [
      { key: 'win_percentage', label: 'Projected vs market win %' },
      { key: 'margin', label: 'Projected vs market spread' },
      { key: 'total', label: 'Projected vs market total' },
      { key: 'calibration', label: 'Track record at this confidence' },
    ];

    return (
      <>
        <div style = {gridStyle}>
          {placeholders.map((row) => (
            <div key = {row.key} style = {{ minWidth: 0 }}>
              <Typography type = 'overline' style = {{ color: theme.text.secondary, display: 'block', lineHeight: '16px' }}>{row.label}</Typography>
              <Locked iconFontSize = {'18px'} />
            </div>
          ))}
        </div>
        <Typography type = 'body2' style = {{ color: theme.text.secondary, margin: '10px 0px 8px 0px' }}>
          Subscribe for just $5 per month to see how our projection compares to the market line
          on every game.
        </Typography>
        <div style = {{ textAlign: 'center', marginTop: 12 }}>
          <Button onClick = {handleSubscribe} title = {'Subscribe'} value = 'subscribe' />
        </div>
      </>
    );
  };

  const getModals = () => {
    return (
      <>
        {
          // Gated rather than left mounted: the library Modal keeps its children in the DOM,
          // and a full slate renders one of these per tile.
          helpOpen ? <Help open = {helpOpen} onClose = {() => { setHelpOpen(false); }} /> : ''
        }
        {
          sourcesOpen ?
            <Sources
              open = {sourcesOpen}
              onClose = {() => { setSourcesOpen(false); }}
              team = {side === null ? '' : Game.getTeamName(side)}
              prices = {sourcePrices}
            />
            : ''
        }
      </>
    );
  };

  // Given its own page, the section is always open and needs no bar to toggle it. It owns its
  // surface so that returning nothing leaves no empty panel behind.
  if (!collapsible) {
    return (
      <Paper style = {{ width: '100%', maxWidth, margin: 'auto', marginTop: 8, padding: 10 }}>
        <div style = {{ marginBottom: 6 }}>{getSummary()}</div>
        {locked ? getLockedBody() : getBody()}
        {getModals()}
      </Paper>
    );
  }

  return (
    <div style = {{ width: '100%', maxWidth, margin: '6px 0px' }}>
      <Divider style = {{ margin: '4px 0px' }} />
      {/* The whole bar is the control, so the chevron is decoration rather than a nested button. */}
      <div
        role = 'button'
        tabIndex = {0}
        aria-expanded = {expanded}
        aria-controls = {`analysis-${game.game_id}`}
        aria-label = {expanded ? 'Hide analysis' : 'Show analysis'}
        onClick = {handleToggle}
        onKeyDown = {handleKeyDown}
        onMouseEnter = {() => { setHovered(true); }}
        onMouseLeave = {() => { setHovered(false); }}
        onFocus = {() => { setHovered(true); }}
        onBlur = {() => { setHovered(false); }}
        style = {{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          // Pulled out and padded back in so the highlight covers the full width of the tile
          // rather than stopping at the text.
          margin: '0px -10px',
          padding: '4px 10px',
          borderRadius: 4,
          backgroundColor: hovered ? theme.action.hover : 'transparent',
          transition: 'background-color 120ms ease',
        }}
      >
        {getSummary()}
        {
          expanded ?
            <ExpandLessIcon style = {{ fontSize: 20, color: hovered ? theme.text.primary : theme.text.secondary }} /> :
            <ExpandMoreIcon style = {{ fontSize: 20, color: hovered ? theme.text.primary : theme.text.secondary }} />
        }
      </div>
      {
        expanded ?
          <div id = {`analysis-${game.game_id}`} style = {{ padding: '4px 0px' }}>{locked ? getLockedBody() : getBody()}</div>
          : ''
      }
      {getModals()}
    </div>
  );
};

export default Analysis;
