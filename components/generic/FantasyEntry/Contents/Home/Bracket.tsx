'use client';

import Team from '@/components/helpers/Team';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useMemo, useState, useEffect, useRef } from 'react';

import PublicIcon from '@esmalley/react-material-icons/Public';
import Organization from '@/components/helpers/Organization';
import { useClientAPI } from '@/components/clientAPI';
import { setDataKey } from '@/redux/features/fantasy_entry-slice';

import RadioButtonUncheckedIcon from '@esmalley/react-material-icons/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@esmalley/react-material-icons/CheckCircleOutline';
import CancelIcon from '@esmalley/react-material-icons/Cancel';
import { Dates, Objector, Style, toast } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import Game from '@/components/helpers/Game';
import QueryStatsIcon from '@esmalley/react-material-icons/QueryStats';
import { Chip, IconButton, Paper, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import { Fantasy, General } from '@srating-io/types';

const slot_height = 100;
const slot_width = 170;
const slot_margin_top = 8;
const slot_margin_bottom = 8;

const Connector = ({ isRightSide = false, width }: { isRightSide?: boolean; width: number; }) => {
  const theme = useTheme();
  const borderColor = theme.grey[400];

  return (
    <div
      className = {Style.getStyleClassName({
        position: 'absolute',
        top: '50%',
        [isRightSide ? 'left' : 'right']: '-10px', // Pull it out to meet the parent
        width,
        height: '1px',
        backgroundColor: borderColor,
      })}
    />
  );
};

/**
 * Which region sits in which quadrant, read from the pairings the api generated.
 *
 * The layout used to name East, West, South and Midwest directly, with nothing tying the two it
 * drew on the left to the two that actually meet in that semi final.
 */
const getRegionQuadrants = (fantasy_bracket_slots: Fantasy.FantasyBracketSlots) => {
  const national = Object.values(fantasy_bracket_slots).find((slot) => slot.round === 6 && slot.region === 'National') || null;

  const sideRegions = (final_four_fantasy_bracket_slot_id: string | null | undefined) => {
    const slot = final_four_fantasy_bracket_slot_id ? fantasy_bracket_slots[final_four_fantasy_bracket_slot_id] : null;

    if (!slot) {
      return [];
    }

    return [slot.first_parent_fantasy_bracket_slot_id, slot.second_parent_fantasy_bracket_slot_id]
      .map((id) => (id ? fantasy_bracket_slots[id]?.region : null))
      .filter((region): region is string => !!region);
  };

  const left = sideRegions(national?.first_parent_fantasy_bracket_slot_id);
  const right = sideRegions(national?.second_parent_fantasy_bracket_slot_id);

  return {
    topLeft: left[0] || 'East',
    bottomLeft: left[1] || 'South',
    topRight: right[0] || 'West',
    bottomRight: right[1] || 'Midwest',
  };
};

const RoundBanner = ({ round_x_date }: { round_x_date: Record<number, string>; }) => {
  const theme = useTheme();

  // Left side sequence. The dates come from the scheduled games, because they were literal strings
  // from a past tournament before, without even a year on them.
  const leftRounds = [
    { name: 'Round 1', label: 'R64', date: round_x_date[1] || '' },
    { name: 'Round 2', label: 'R32', date: round_x_date[2] || '' },
    { name: 'Sweet 16', label: 'S16', date: round_x_date[3] || '' },
    { name: 'Elite 8', label: 'E8', date: round_x_date[4] || '' },
    { name: 'Final Four', label: 'F4', date: round_x_date[5] || '' },
  ];

  // The center point
  const champion = { name: 'Championship', date: round_x_date[6] || '' };

  // Reverse the left side for the right side
  const rightRounds = [...leftRounds].reverse();

  const RoundItem = ({ round }) => (
    <div style={{ textAlign: 'center', minWidth: '50px' }}>
      <Typography type = 'caption' style = {{ fontWeight: 'bold' }}>{round.name}</Typography>
      <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{round.date}</Typography>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 5px',
      marginBottom: '15px',
      width: '100%',
    }}>
      {/* Left side: R64 -> F4 */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
        {leftRounds.map((r, i) => <RoundItem key={`left-${i}`} round={r} />)}
      </div>

      {/* Center: Champion */}
      <div style={{
        flex: 0.5,
        padding: '0 20px',
        borderLeft: '1px solid #ddd',
        borderRight: '1px solid #ddd',
      }}>
        <RoundItem round={champion} />
      </div>

      {/* Right side: F4 -> R64 */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
        {rightRounds.map((r, i) => <RoundItem key={`right-${i}`} round={r} />)}
      </div>
    </div>
  );
};


const BracketSlot = (
  {
    fantasy_bracket_slot_id,
    fantasy_bracket_slots,
    isRightSide = false, // Prop to trigger Right-to-Left rendering
    region_x_round_x_seed_x_bracket_teams,
    team_id_x_seed,
    disableRecursion = false,
    selectedRound = 1,
    isLargeScreen = true,
  }:
  {
    fantasy_bracket_slot_id: string | null,
    fantasy_bracket_slots: Fantasy.FantasyBracketSlots,
    isRightSide?: boolean,
    region_x_round_x_seed_x_bracket_teams?: object,
    team_id_x_seed: object,
    disableRecursion?: boolean,
    selectedRound?: number,
    isLargeScreen?: boolean,
  },
) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  const teams = useAppSelector((state) => state.fantasyEntryReducer.teams);
  const games = useAppSelector((state) => state.fantasyEntryReducer.games);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const user = useAppSelector((state) => state.userReducer.user);


  const containerRef = useRef<HTMLDivElement | null>(null);
  const [heightConnector, setHeightConnector] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setHeightConnector(containerRef.current.clientHeight);
    }
  }, [containerRef.current]);

  const borderColor = theme.grey[400];

  if (!fantasy_bracket_slot_id || !fantasy_bracket_slots[fantasy_bracket_slot_id]) {
    return <div style={{ width: 140, height: 60 }} />;
  }

  const fantasy_bracket_slot = fantasy_bracket_slots[fantasy_bracket_slot_id];
  const path = Organization.getPath({ organizations, organization_id: fantasy_group.organization_id });

  const game = (fantasy_bracket_slot.game_id && games[fantasy_bracket_slot.game_id]) || null;

  const gameHelper = new Game({ game });

  const canNavigateToGame = (fantasy_bracket_slot.game_id && game && fantasy_group.started);

  const seedPairs = {
    1: [1, 16],
    2: [8, 9],
    3: [5, 12],
    4: [4, 13],
    5: [6, 11],
    6: [3, 14],
    7: [7, 10],
    8: [2, 15],
  };

  const team_id_x_eliminated = {};

  for (const game_id in games) {
    const game = games[game_id];

    if (
      game.status === 'final' &&
      game.boxscore === 1
    ) {
      // A null or 0 score used to fall through to "the home team lost" and strike out a team that
      // is still alive. Without two real scores there is no result to read.
      if (
        game.home_score === null ||
        game.away_score === null ||
        game.home_score === undefined ||
        game.away_score === undefined ||
        game.home_score === game.away_score
      ) {
        continue;
      }

      const loser_team_id = game.home_score > game.away_score ? game.away_team_id : game.home_team_id;

      team_id_x_eliminated[loser_team_id] = true;
    }
  }


  const directionStyle = isRightSide ? 'row-reverse' : 'row';
  const marginProp = isRightSide ? 'marginLeft' : 'marginRight';

  const shouldRenderParents = !disableRecursion && fantasy_bracket_slot.round > selectedRound;

  const get_team_ids = (which: string) => {
    let team_ids: string[] = [];
    if (which === 'first') {
      if (fantasy_bracket_slot.actual_first_team_id) {
        team_ids.push(fantasy_bracket_slot.actual_first_team_id);
      } else if (fantasy_bracket_slot.picked_first_team_id) {
        team_ids.push(fantasy_bracket_slot.picked_first_team_id);
      } else if (
        fantasy_bracket_slot.round === 1 &&
        region_x_round_x_seed_x_bracket_teams &&
        fantasy_bracket_slot.region in region_x_round_x_seed_x_bracket_teams &&
        fantasy_bracket_slot.round in region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region] &&
        seedPairs[fantasy_bracket_slot.slot][0] in region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region][fantasy_bracket_slot.round]
      ) {
        team_ids = Object.values(region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region][fantasy_bracket_slot.round][seedPairs[fantasy_bracket_slot.slot][0]]).map((r: General.BracketTeam) => r.team_id);
      }
    } else if (which === 'second') {
      if (fantasy_bracket_slot.actual_second_team_id) {
        team_ids.push(fantasy_bracket_slot.actual_second_team_id);
      } else if (fantasy_bracket_slot.picked_second_team_id) {
        team_ids.push(fantasy_bracket_slot.picked_second_team_id);
      } else if (
        fantasy_bracket_slot.round === 1 &&
        region_x_round_x_seed_x_bracket_teams &&
        fantasy_bracket_slot.region in region_x_round_x_seed_x_bracket_teams &&
        fantasy_bracket_slot.round in region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region] &&
        seedPairs[fantasy_bracket_slot.slot][1] in region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region][fantasy_bracket_slot.round]
      ) {
        team_ids = Object.values(region_x_round_x_seed_x_bracket_teams[fantasy_bracket_slot.region][fantasy_bracket_slot.round][seedPairs[fantasy_bracket_slot.slot][1]]).map((r: General.BracketTeam) => r.team_id);
      }

      if (fantasy_bracket_slot.actual_second_team_id && fantasy_bracket_slot.third_team_id) {
        team_ids.push(fantasy_bracket_slot.third_team_id);
      }
    }

    return team_ids;
  };


  const getTeam = (team_ids: string[]) => {
    if (
      team_ids.length
    ) {
      const names = team_ids.map((team_id) => {
        if (team_id in teams) {
          const team = teams[team_id];

          const teamHelper = new Team({ team });

          return teamHelper.getName();
        }

        return 'Unknown';
      });

      const seed = team_id_x_seed[team_ids[0]];

      const tStyle: React.CSSProperties = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      };

      if (
        team_ids[0] in team_id_x_eliminated &&
        team_ids[0] !== fantasy_bracket_slot.actual_first_team_id &&
        team_ids[0] !== fantasy_bracket_slot.actual_second_team_id
      ) {
        tStyle.textDecoration = 'line-through';
        tStyle.color = theme.error.main;
      }

      return (
        <Typography type = 'body2' style = {tStyle}><sup style = {{ marginRight: 5, fontSize: 10 }}>{seed}</sup>{names.join(' / ')}</Typography>
      );
    }

    return <Typography type = 'body2'>TBD</Typography>;
  };

  const slot_quadrants = getRegionQuadrants(fantasy_bracket_slots);

  let stylePosition = 'top';
  if (fantasy_bracket_slot.slot % 2 === 0 && isLargeScreen) {
    stylePosition = 'bottom';
  } else if (!isLargeScreen) {
    if (
      fantasy_bracket_slot.slot % 2 === 0 ||
      (
        fantasy_bracket_slot.round === 4 &&
        // the two regions drawn along the bottom, read from the pairings rather than named
        [slot_quadrants.bottomLeft, slot_quadrants.bottomRight].includes(fantasy_bracket_slot.region)
      )
    ) {
      stylePosition = 'bottom';
    }
  }

  const updateInternalObjects = (team_id: string | null) => {
    const data = Objector.deepClone(fantasy_bracket_slots);
    const this_fantasy_bracket_slot = data[fantasy_bracket_slot.fantasy_bracket_slot_id];
    const child_fantasy_bracket_slot = data[fantasy_bracket_slot.child_fantasy_bracket_slot_id];

    if (child_fantasy_bracket_slot && child_fantasy_bracket_slot.fantasy_bracket_slot_id) {
      const which = child_fantasy_bracket_slot.first_parent_fantasy_bracket_slot_id === fantasy_bracket_slot.fantasy_bracket_slot_id ? 'first' : 'second';
      const column = `picked_${which}_team_id`;

      let replacement_team_id = null;
      if (
        child_fantasy_bracket_slot[column] &&
        child_fantasy_bracket_slot[column] !== team_id
      ) {
        replacement_team_id = child_fantasy_bracket_slot[column];
      }

      child_fantasy_bracket_slot[column] = team_id;

      // check all the other children if this was picked, since it was replacement it doesnt make sense
      if (replacement_team_id) {
        const replace_children = (row) => {
          if (row && row.child_fantasy_bracket_slot_id) {
            const next_child = data[row.child_fantasy_bracket_slot_id];
            const which = next_child && next_child.first_parent_fantasy_bracket_slot_id === row.fantasy_bracket_slot_id ? 'first' : 'second';
            const column = `picked_${which}_team_id`;
            if (
              next_child &&
              next_child.fantasy_bracket_slot_id &&
              next_child[column] === replacement_team_id
            ) {
              next_child[column] = null;
              replace_children(next_child);
            }
          }
        };

        replace_children(child_fantasy_bracket_slot);
      }
    }

    this_fantasy_bracket_slot.picked_winner_team_id = team_id;
    dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: data }));
  };

  const handlePick = (team_id: string | null) => {
    // kept so a refused pick can be rolled back rather than left on screen as if it had saved
    const previous_fantasy_bracket_slots = fantasy_bracket_slots;

    updateInternalObjects(team_id);

    useClientAPI({
      class: 'fantasy_bracket_slot',
      function: 'pick',
      arguments: {
        fantasy_bracket_slot_id: fantasy_bracket_slot.fantasy_bracket_slot_id,
        team_id,
      },
    })
      .then((data) => {
        // The optimistic update used to stand whatever the server said - the bail out was
        // commented out and the returned slots were discarded - so a bracket could quietly stop
        // matching the one that gets scored.
        if (!data || data.error) {
          dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: previous_fantasy_bracket_slots }));
          toast.error(data?.error || 'Could not save that pick, please try again.');
          return;
        }

        // pick() returns every slot it changed, children it had to clear included
        if (data.fantasy_bracket_slots) {
          dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: Objector.extender({}, previous_fantasy_bracket_slots, data.fantasy_bracket_slots) }));
        }
      })
      .catch((err) => {
        console.log(err);
        dispatch(setDataKey({ key: 'fantasy_bracket_slots', value: previous_fantasy_bracket_slots }));
        toast.error('Could not save that pick, please try again.');
      });
  };

  // The cutoff used to rest entirely on flags a handler sets, so an outage left a bracket editable
  // after tip off. The server checks start_date too; this keeps the ui honest about it.
  const hasStarted = !!(
    fantasy_group.started ||
    (fantasy_group.start_date && Dates.parse(fantasy_group.start_date, true).getTime() <= Date.now())
  );

  const canPick = (
    !hasStarted &&
    fantasy_group.locked === 0 &&
    fantasy_bracket_slot.locked === 0 &&
    (
      (
        fantasy_bracket_slot.round === 1 &&
        fantasy_bracket_slot.actual_first_team_id &&
        fantasy_bracket_slot.actual_second_team_id
      ) ||
      (
        fantasy_bracket_slot.round > 1 &&
        (
          fantasy_bracket_slot.picked_first_team_id ||
          fantasy_bracket_slot.picked_second_team_id
        )
      )
    ) &&
    user &&
    user.user_id === fantasy_entry.user_id
  );

  const getPickContainer = (which: string) => {
    const team_ids = get_team_ids(which);

    const can = canPick && team_ids.length;

    const containerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: ((can || canNavigateToGame) ? 'pointer' : 'initial'),
      border: '2px solid transparent',
      borderRadius: '5px',
      padding: '0px 2.5px',
    };

    const textWrapperStyle = {
      flex: 1,
      minWidth: 0,
      whiteSpace: 'nowrap',
    };

    if (can) {
      containerStyle['&:hover'] = {
        backgroundColor: theme.action.hover,
        border: `2px solid ${theme.purple[500]}`,
      };
    }

    const getRadioPickBox = () => {
      let icon: React.JSX.Element | null = null;
      if (
        fantasy_bracket_slot.picked_winner_team_id &&
        (
          (
            fantasy_bracket_slot[`actual_${which}_team_id`] &&
            fantasy_bracket_slot[`actual_${which}_team_id`] === fantasy_bracket_slot.picked_winner_team_id
          ) ||
          (
            !fantasy_bracket_slot[`actual_${which}_team_id`] &&
            fantasy_bracket_slot[`picked_${which}_team_id`] === fantasy_bracket_slot.picked_winner_team_id
          )
        )
      ) {
        icon = <RadioButtonUncheckedIcon style = {{ color: theme.purple[500], fontSize: 20 }} />;

        if (
          fantasy_bracket_slot.picked_winner_team_id &&
          game &&
          game.status === 'final' &&
          game.boxscore === 1
        ) {
          // Same trap as the elimination list: a null or 0 score used to declare the away team
          // the winner, which flipped the tick against the user's pick.
          const home_score = game.home_score;
          const away_score = game.away_score;

          if (
            home_score !== null &&
            away_score !== null &&
            home_score !== undefined &&
            away_score !== undefined &&
            home_score !== away_score
          ) {
            const winner_team_id = home_score > away_score ? game.home_team_id : game.away_team_id;

            if (winner_team_id === fantasy_bracket_slot.picked_winner_team_id) {
              icon = <CheckCircleOutlineIcon style = {{ color: theme.success.main, fontSize: 20 }} />;
            } else {
              icon = <CancelIcon style = {{ color: theme.error.main, fontSize: 20 }} />;
            }
          }
        }
      }


      if (icon) {
        return (
          <div style = {{ display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        );
      }

      return <></>;
    };

    const getScoreBox = () => {
      let score = 0;
      if (fantasy_bracket_slot.game_id && game) {
        if (
          fantasy_bracket_slot[`actual_${which}_team_id`] === game.home_team_id
        ) {
          score = game.home_score || 0;
        } else if (
          fantasy_bracket_slot[`actual_${which}_team_id`] === game.away_team_id
        ) {
          score = game.away_score || 0;
        }
      }

      return (
        <div>{score}</div>
      );
    };

    return (
      <div
        className = {Style.getStyleClassName(containerStyle)}
        onClick={() => {
          if (can) {
            handlePick(team_ids[0]);
          }
        }}
      >
        <div style = {textWrapperStyle}>
          {getTeam(team_ids)}
        </div>
        {
          fantasy_bracket_slot[`actual_${which}_team_id`] &&
          fantasy_bracket_slot[`picked_${which}_team_id`] &&
          fantasy_bracket_slot[`actual_${which}_team_id`] !== fantasy_bracket_slot[`picked_${which}_team_id`] &&
          <div style = {textWrapperStyle}><Typography type = 'body2' style = {{ overflow: 'hidden', textOverflow: 'ellipsis', color: theme.error.main, textDecoration: 'line-through', fontSize: 12 }}><sup style = {{ marginRight: 5, fontSize: 10 }}>{team_id_x_seed[fantasy_bracket_slot[`picked_${which}_team_id`]]}</sup>{new Team({ team: teams[fantasy_bracket_slot[`picked_${which}_team_id`]] }).getName()}</Typography></div>
        }
        <div style = {{ width: 20, textAlign: 'right', flexShrink: 0 }}>{getRadioPickBox()}</div>
        {game && game.status !== 'pre' && <div style = {{ width: 20, textAlign: 'center', flexShrink: 0 }}>{getScoreBox()}</div>}
      </div>
    );
  };

  return (
    <div ref = {containerRef} style={{ display: 'flex', alignItems: 'center', flexDirection: directionStyle }}>

      {/* 1. Recursively Render Previous Rounds (Feeders) */}
      {shouldRenderParents && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', [marginProp]: 8 }}>
          <div style={{ marginBottom: slot_margin_bottom }}>
            <BracketSlot
              fantasy_bracket_slot_id={fantasy_bracket_slot.first_parent_fantasy_bracket_slot_id}
              fantasy_bracket_slots={fantasy_bracket_slots}
              isRightSide={isRightSide}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
              selectedRound={selectedRound}
              isLargeScreen = {isLargeScreen}
            />
          </div>
          <div style={{ marginTop: slot_margin_top }}>
            <BracketSlot
              fantasy_bracket_slot_id={fantasy_bracket_slot.second_parent_fantasy_bracket_slot_id}
              fantasy_bracket_slots={fantasy_bracket_slots}
              isRightSide={isRightSide}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
              selectedRound={selectedRound}
              isLargeScreen = {isLargeScreen}
            />
          </div>
        </div>
      )}

      {/* 2. The Connector (Fork) */}
      {shouldRenderParents && (
        <div style={{ position: 'relative', height: '100%', width: '10px', [marginProp]: 8 }}>
          <Connector isRightSide={isRightSide} width={18} />
        </div>
      )}

      {/* 3. The Slot Card */}
      <Paper
        style={{
          minWidth: slot_width,
          maxWidth: slot_width,
          height: slot_height,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '8px',
          cursor: (canNavigateToGame ? 'pointer' : 'initial'),
        }}
        onClick={() => {
          if (canNavigateToGame) {
            navigation.game(`/${path}/games/${fantasy_bracket_slot.game_id}`);
          }
        }}
        hover = {Boolean(canNavigateToGame)}
      >
        <div
          className = {Style.getStyleClassName({
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          <div style = {{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography type = 'caption' style={{ color: theme.info.main }}>{(fantasy_bracket_slot.game_id ? `${gameHelper.getNetwork() || ''} ${gameHelper.getStartDate('n/j g:i a')}` : 'TBD')}</Typography>
            {
            !canNavigateToGame &&
            (
              (fantasy_bracket_slot.picked_first_team_id && fantasy_bracket_slot.picked_second_team_id) ||
              fantasy_bracket_slot.game_id ||
              (fantasy_bracket_slot.actual_first_team_id && fantasy_bracket_slot.actual_second_team_id)
            ) &&
            <div>
              <IconButton icon = {<QueryStatsIcon style = {{ fontSize: 18 }} />} value = 'view-matchup' onClick = {() => {
                if (fantasy_bracket_slot.game_id) {
                  navigation.game(`/${path}/games/${fantasy_bracket_slot.game_id}`);
                } else if (fantasy_bracket_slot.picked_first_team_id && fantasy_bracket_slot.picked_second_team_id) {
                  navigation.compare(`/${path}/compare?home_team_id=${fantasy_bracket_slot.picked_first_team_id}&away_team_id=${fantasy_bracket_slot.picked_second_team_id}&view=team&neutral_site=true`);
                } else if (fantasy_bracket_slot.actual_first_team_id && fantasy_bracket_slot.actual_second_team_id) {
                  navigation.compare(`/${path}/compare?home_team_id=${fantasy_bracket_slot.actual_first_team_id}&away_team_id=${fantasy_bracket_slot.actual_second_team_id}&view=team&neutral_site=true`);
                }
              }} />
            </div>
            }
          </div>
          {getPickContainer('first')}
          {getPickContainer('second')}
        </div>

        {
        (
          (fantasy_bracket_slot.round < 4 && isLargeScreen) ||
          !isLargeScreen
        ) &&
        fantasy_bracket_slot.child_fantasy_bracket_slot_id
          ?
          <>
            {/* Horizontal Stub connecting to Next Round */}
            <div
              className = {Style.getStyleClassName({
                position: 'absolute',
                [isRightSide ? 'left' : 'right']: -10,
                top: '50%',
                width: '10px',
                height: '1px',
                backgroundColor: borderColor,
              })}
            />
            {/* Vertical stub to connect */}
            <div
              className = {Style.getStyleClassName({
                position: 'absolute',
                [stylePosition]: '50%',
                [isRightSide ? 'left' : 'right']: -10,
                width: '1px',
                height: heightConnector / 2 + slot_margin_bottom,
                backgroundColor: borderColor,
              })}
            />
          </>
          : ''
        }
      </Paper>

      {
        fantasy_bracket_slot.round === 6 && fantasy_bracket_slot.picked_winner_team_id && !isLargeScreen ?
          <div style = {{ marginLeft: 10 }}><WinnerContainer team_id={fantasy_bracket_slot.picked_winner_team_id} /></div>
          : ''
      }
    </div>
  );
};

const WinnerContainer = ({ team_id }) => {
  const theme = useTheme();
  const teams = useAppSelector((state) => state.fantasyEntryReducer.teams);
  const team = teams[team_id];
  const teamHelper = new Team({ team });

  return (
    <div style = {{ display: 'flex', justifyContent: 'center', marginTop: 20, border: `2px solid ${theme.orange[500]}`, borderRadius: 5 }}>
      <Typography type = 'h5'>{teamHelper.getName()}</Typography>
    </div>
  );
};


const Bracket = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const fantasy_bracket_slots = useAppSelector((state) => state.fantasyEntryReducer.fantasy_bracket_slots);
  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const bracket_teams = useAppSelector((state) => state.fantasyEntryReducer.bracket_teams);
  const games = useAppSelector((state) => state.fantasyEntryReducer.games);

  // State for responsive view
  const [isLargeScreen, setIsLargeScreen] = useState(width > 1200);
  const [selectedRound, setSelectedRound] = useState<number>(1);

  const quadrants = getRegionQuadrants(fantasy_bracket_slots);

  const slot_values = Object.values(fantasy_bracket_slots);
  const picked_slot_count = slot_values.filter((slot) => !!slot.picked_winner_team_id).length;

  // The date range each round is actually played over, taken from the games the slots point at.
  const round_x_date = useMemo(() => {
    const round_x_range: Record<number, {min: number, max: number}> = {};

    for (const fantasy_bracket_slot_id in fantasy_bracket_slots) {
      const slot = fantasy_bracket_slots[fantasy_bracket_slot_id];
      const game = slot.game_id ? games[slot.game_id] : null;

      if (!game || !game.start_date) {
        continue;
      }

      const time = Dates.parse(game.start_date, true).getTime();

      if (!(slot.round in round_x_range)) {
        round_x_range[slot.round] = { min: time, max: time };
        continue;
      }

      round_x_range[slot.round].min = Math.min(round_x_range[slot.round].min, time);
      round_x_range[slot.round].max = Math.max(round_x_range[slot.round].max, time);
    }

    const labels: Record<number, string> = {};

    for (const round in round_x_range) {
      const start = Dates.format(new Date(round_x_range[round].min), 'n/j');
      const end = Dates.format(new Date(round_x_range[round].max), 'n/j');

      labels[round] = start === end ? start : `${start}-${end.split('/').pop()}`;
    }

    return labels;
  }, [fantasy_bracket_slots, games]);

  const region_x_round_x_seed_x_bracket_teams = {};
  const team_id_x_seed = {};

  for (const bracket_team_id in bracket_teams) {
    const row = bracket_teams[bracket_team_id];

    if (!(row.region in region_x_round_x_seed_x_bracket_teams)) {
      region_x_round_x_seed_x_bracket_teams[row.region] = {};
    }

    if (!(row.round in region_x_round_x_seed_x_bracket_teams[row.region])) {
      region_x_round_x_seed_x_bracket_teams[row.region][row.round] = {};
    }

    if (!(row.seed in region_x_round_x_seed_x_bracket_teams[row.region][row.round])) {
      region_x_round_x_seed_x_bracket_teams[row.region][row.round][row.seed] = [];
    }

    region_x_round_x_seed_x_bracket_teams[row.region][row.round][row.seed].push(row);

    team_id_x_seed[row.team_id] = row.seed;
  }


  useEffect(() => {
    setIsLargeScreen(width > 1400);
  }, [width]);


  // Organize Roots by Region
  const roots = useMemo(() => {
    const regionRoots: Record<string, string> = {};
    Object.values(fantasy_bracket_slots).forEach((slot) => {
      const isRegionalChamp = (slot.round === 4 && slot.region !== 'National');
      const isNationalChamp = (slot.round === 6 && slot.region === 'National');
      if (isRegionalChamp || isNationalChamp) regionRoots[slot.region] = slot.fantasy_bracket_slot_id;
    });
    return regionRoots;
  }, [fantasy_bracket_slots]);

  const national_champion_fantasy_bracket_slot = roots.National ? fantasy_bracket_slots[roots.National] : null;
  const left_final_four_fantasy_bracket_slot = national_champion_fantasy_bracket_slot?.first_parent_fantasy_bracket_slot_id || null;
  const right_final_four_fantasy_bracket_slot = national_champion_fantasy_bracket_slot?.second_parent_fantasy_bracket_slot_id || null;

  // Round Buttons (1 through 6)
  const rounds = [1, 2, 3, 4, 5, 6];

  const getRegionTitle = (title: string, align: string) => {
    const color = theme.text.secondary;
    return (
      <div style = {{ display: 'flex', alignItems: 'center', justifyContent: align }}>
        <PublicIcon style = {{ marginRight: 5, color, fontSize: 24 }} />
        <Typography type = 'h6' style = {{ color }}>{title}</Typography>
      </div>
    );
  };

  const getFullView = () => {
    return (
      <>
        <Typography type = 'h5' style = {{ textAlign: 'center' }}>{fantasy_entry.name}</Typography>
        <Typography type = 'body2' style = {{ textAlign: 'center', color: theme.text.secondary }}>{picked_slot_count} of {slot_values.length} picked</Typography>
        <RoundBanner round_x_date = {round_x_date} />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 5 }}>
          <div style = {{ marginRight: 20 }}>
            {getRegionTitle(quadrants.topLeft, 'left')}
            <BracketSlot
              fantasy_bracket_slot_id={roots[quadrants.topLeft]}
              fantasy_bracket_slots={fantasy_bracket_slots}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
            />
          </div>
          <div>
            {getRegionTitle(quadrants.topRight, 'right')}
            <BracketSlot
              fantasy_bracket_slot_id={roots[quadrants.topRight]}
              fantasy_bracket_slots={fantasy_bracket_slots}
              isRightSide={true}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style = {{ marginRight: 20 }}>
            <Typography type = 'caption' style = {{ textAlign: 'center' }}>Final Four</Typography>
            <BracketSlot
              fantasy_bracket_slot_id={left_final_four_fantasy_bracket_slot}
              fantasy_bracket_slots={fantasy_bracket_slots}
              disableRecursion={true}
              team_id_x_seed={team_id_x_seed}
            />
          </div>

          <div style = {{ display: 'inline-block', justifyContent: 'center', margin: '0px 20px' }}>
            <Typography type="h6" style={{ fontWeight: 'bold', textAlign: 'center' }}>NATIONAL CHAMPIONSHIP</Typography>
            <div style = {{ display: 'flex', justifyContent: 'center' }}>
              <BracketSlot
                fantasy_bracket_slot_id={national_champion_fantasy_bracket_slot?.fantasy_bracket_slot_id || null}
                fantasy_bracket_slots={fantasy_bracket_slots}
                disableRecursion={true}
                team_id_x_seed={team_id_x_seed}
              />
            </div>
            {
              national_champion_fantasy_bracket_slot && national_champion_fantasy_bracket_slot.picked_winner_team_id ?
                <WinnerContainer team_id={national_champion_fantasy_bracket_slot.picked_winner_team_id} />
                : ''
            }
          </div>

          <div style = {{ marginRight: 20 }}>
            <Typography type = 'caption' style = {{ textAlign: 'center' }}>Final Four</Typography>
            <BracketSlot
              fantasy_bracket_slot_id={right_final_four_fantasy_bracket_slot}
              fantasy_bracket_slots={fantasy_bracket_slots}
              disableRecursion={true}
              team_id_x_seed={team_id_x_seed}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 5 }}>
          <div style = {{ marginRight: 20 }}>
            {getRegionTitle(quadrants.bottomLeft, 'left')}
            <BracketSlot
              fantasy_bracket_slot_id={roots[quadrants.bottomLeft]}
              fantasy_bracket_slots={fantasy_bracket_slots}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
            />
          </div>
          <div>
            {getRegionTitle(quadrants.bottomRight, 'right')}
            <BracketSlot
              fantasy_bracket_slot_id={roots[quadrants.bottomRight]}
              fantasy_bracket_slots={fantasy_bracket_slots}
              isRightSide={true}
              region_x_round_x_seed_x_bracket_teams = {region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
            />
          </div>
        </div>
      </>
    );
  };


  const getMobileView = () => {
    const round_x_title = {
      1: (width < 475 ? 'R1' : '1st Round'),
      2: (width < 475 ? 'R2' : '2nd Round'),
      3: (width < 475 ? 'S16' : 'Sweet 16'),
      4: (width < 475 ? 'E8' : 'Elite 8'),
      5: (width < 475 ? 'F4' : 'Final Four'),
      6: (width < 475 ? 'CHAMP' : 'Championship'),
    };

    const transitionStyle = {
      // '@keyframes slideInBracket': {
      //   from: { opacity: 0, transform: 'translateX(140px)' },
      //   to: { opacity: 1, transform: 'translateX(0)' },
      // },
      // animation: 'slideInBracket 0.3s ease-out forwards',
    };


    return (
      <>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'fixed',
          padding: '10px 15px',
          width: '100%',
          backgroundColor: theme.background.main,
          zIndex: Style.getZIndex().appBar,
        }}>
          {rounds.map((r) => (
            <Chip
              key={r}
              onClick={() => setSelectedRound(r)}
              filled={r === selectedRound}
              title={round_x_title[r]}
              value={r}
            />
          ))}
        </div>

        <div style={{ width: '100%', padding: '52px 5px 0px 5px' }}>
          <Typography type = 'h5' style = {{ textAlign: 'center' }}>{fantasy_entry.name}</Typography>
          <div
            key={selectedRound}
            className = {Style.getStyleClassName(transitionStyle)}
            style={{ width: '100%' }}
          >
            <div style={{ marginBottom: 10 }}>
              {getRegionTitle(round_x_title[selectedRound], 'left')}
            </div>
            <BracketSlot
              fantasy_bracket_slot_id={roots.National}
              fantasy_bracket_slots={fantasy_bracket_slots}
              selectedRound={selectedRound}
              region_x_round_x_seed_x_bracket_teams={region_x_round_x_seed_x_bracket_teams}
              team_id_x_seed={team_id_x_seed}
              isLargeScreen={false}
            />
          </div>
        </div>
      </>
    );
  };

  // With no slots the layout still drew every region heading over a grid of empty boxes, which is
  // exactly what a bracket group looks like before the api has built it.
  if (!slot_values.length) {
    return (
      <div style = {{ padding: 40, textAlign: 'center' }}>
        <Typography type = 'h6'>This bracket is not ready yet</Typography>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>
          The games are set once the tournament field is announced. Check back then to make your picks.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      {isLargeScreen ? getFullView() : getMobileView()}
    </div>
  );
};

export default Bracket;
