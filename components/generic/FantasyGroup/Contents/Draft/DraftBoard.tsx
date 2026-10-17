'use client';

import FantasyGroup from '@/components/helpers/FantasyGroup';
import { useAppSelector } from '@/redux/hooks';
import { Dates } from '@esmalley/ts-utils';

import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import HourglassBottomIcon from '@esmalley/react-material-icons/HourglassBottom';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { useEffect, useState } from 'react';
import { Button, Modal, Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';


const DraftBoard = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyGroupReducer.fantasy_draft_orders);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const player_team_seasons = useAppSelector((state) => state.fantasyGroupReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyGroupReducer.players);
  const [openModal, setOpenModal] = useState(false);


  const fantasyHelper = new FantasyGroup({ fantasy_group });

  const current_fantasy_draft_order = fantasyHelper.getCurrentPick({ fantasy_draft_orders });

  const [viewRound, setViewRound] = useState(current_fantasy_draft_order ? current_fantasy_draft_order.round : 1);

  const draft_order = fantasyHelper.getDraftOrder({ fantasy_entrys, fantasy_draft_orders });

  const decorateDraftOrder = () => {
    const elements: React.JSX.Element[] = [];
    let current_round = 0;
    for (let d = 0; d < draft_order.length; d++) {
      if (current_round !== draft_order[d].round) {
        current_round++;
        elements.push(<Typography key = {`round-${current_round}`} type = 'subtitle1' style = {{ color: theme.info.main }}>Round {current_round}</Typography>);
      }

      const name = (draft_order[d].fantasy_entry_id in fantasy_entrys) ? fantasy_entrys[draft_order[d].fantasy_entry_id].name : draft_order[d].fantasy_entry_id;

      elements.push(
        <Typography key = {d} type = 'caption'># {draft_order[d].pick} - {name} {draft_order[d].eligible ? Dates.format(Dates.parse(draft_order[d].eligible, true), 'M jS g:i a') : ''}</Typography>,
      );
    }
    return elements;
  };

  let maxRounds = 0;
  const elements: React.JSX.Element[] = [];

  for (let d = 0; d < draft_order.length; d++) {
    const row = draft_order[d];

    if (row.round > maxRounds) {
      maxRounds = row.round;
    }

    if (row.round !== viewRound) {
      continue;
    }

    const name = (draft_order[d].fantasy_entry_id in fantasy_entrys) ? fantasy_entrys[draft_order[d].fantasy_entry_id].name : draft_order[d].fantasy_entry_id;

    let primary = `# ${draft_order[d].pick} - ${name} ${draft_order[d].eligible ? Dates.format(Dates.parse(draft_order[d].eligible, true), 'M jS g:i a') : ''}`;

    if (row.picked) {
      const player = (
        row.fantasy_entry_player_id &&
        row.fantasy_entry_player_id in fantasy_entry_players &&
        fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id &&
        fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id in player_team_seasons &&
        players[player_team_seasons[fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id].player_id]
      );
      const player_name = player ? `${player.first_name} ${player.last_name}` : 'Unknown';

      primary = `Picked ${player_name}`;
    }

    elements.push(
      <Tile
        key = {row.fantasy_draft_order_id}
        icon = {row.picked ? <CheckCircleIcon style = {{ fontSize: 24, color: theme.success.main }} /> : <HourglassBottomIcon style = {{ fontSize: 24 }} />}
        primary = {primary}
        secondary = {name}
      />,
    );
  }


  useEffect(() => {
    if (current_fantasy_draft_order) {
      setViewRound(current_fantasy_draft_order.round);
    }
  }, [current_fantasy_draft_order?.round]);


  const getContents = () => {
    if (!fantasy_group.locked) {
      return (
        <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
          <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
          <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Waiting for draft to start!<Typography type = 'a' style = {{ marginLeft: 5 }} onClick={() => setOpenModal(true)}>Preview draft order</Typography></Typography>
        </div>
      );
    }

    return (
      <div>
        <Typography type = 'body1' style = {{ color: theme.yellow[(theme.mode === 'dark' ? 500 : 900)] }}>Round #{viewRound}</Typography>
        {elements}
        <div style = {{ display: 'flex', justifyContent: 'space-between' }}>
          {viewRound > 1 ? <Button ink value = 'previous' title = {`View round ${viewRound - 1}`} onClick={() => setViewRound(viewRound - 1)} /> : <div></div>}
          {viewRound < maxRounds ? <Button ink value = 'next' title = {`View round ${viewRound + 1}`} onClick={() => setViewRound(viewRound + 1)} /> : <div></div>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Draft board</Typography>
      <Paper style={{ padding: 20 }}>
        {getContents()}
      </Paper>
      <Modal
        open = {openModal}
        onClose={() => setOpenModal(false)}
        showCloseButton
      >
        <Typography type = 'h6'>Preview draft order</Typography>
        <div style = {{ maxHeight: 500, overflowY: 'scroll', width: '100%' }}>
          {decorateDraftOrder()}
        </div>
      </Modal>
    </div>
  );
};

export default DraftBoard;
