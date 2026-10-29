'use client';

import CloseIcon from '@esmalley/react-material-icons/Close';
import ExpandLessIcon from '@esmalley/react-material-icons/ExpandLess';
import ExpandMoreIcon from '@esmalley/react-material-icons/ExpandMore';
import HelpIcon from '@esmalley/react-material-icons/Help';
import { useEffect, useMemo, useState } from 'react';
import { Button, Columns, IconButton, Paper, Slab, Typography, useTheme } from '@esmalley/react-material-ui';
import { innerBreakPoint, paperStyle } from '../../Card';
import { FANTASY_ANCHOR } from '../../anchors';
import Collapsible from '@/components/generic/Collapsible';
import FantasyGroupExplainer, { ExplainerSection, ExplainerStatus } from '@/components/helpers/FantasyGroupExplainer';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { setDataKey as setDisplayDataKey } from '@/redux/features/display-slice';


const HowItWorks = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyGroupReducer.fantasy_draft_orders);
  const fantasy_entry_pre_picks = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_pre_picks);
  const terminology = useAppSelector((state) => state.dictionaryReducer.terminology);
  const fantasy_payout_rules = useAppSelector((state) => state.dictionaryReducer.fantasy_payout_rule);
  const dismissed = useAppSelector((state) => state.displayReducer.fantasyGuideDismissed);
  const user = useAppSelector((state) => state.userReducer.user);

  // the phase turns on the draft start passing, which no store update announces
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const [openId, setOpenId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [expanded, setExpanded] = useState<boolean | null>(null);
  // one map for every point, since a hook cannot live inside the section map
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});

  const fantasy_payout_rule = (
    fantasy_group.fantasy_payout_rule_id && fantasy_group.fantasy_payout_rule_id in fantasy_payout_rules ?
      fantasy_payout_rules[fantasy_group.fantasy_payout_rule_id]
      : null
  );

  const explainer = useMemo(() => new FantasyGroupExplainer({
    fantasy_group,
    fantasy_entrys,
    fantasy_draft_orders,
    fantasy_entry_pre_picks,
    terminology,
    fantasy_payout_rule,
    user_id: user?.user_id,
    now,
  }).getExplainer(), [
    fantasy_group,
    fantasy_entrys,
    fantasy_draft_orders,
    fantasy_entry_pre_picks,
    terminology,
    fantasy_payout_rule,
    user,
    now,
  ]);

  if (fantasy_group.fantasy_group_id in (dismissed || {})) {
    return null;
  }

  // the entry section only leads when the viewer has no usable entry yet, which is exactly the
  // person who needs this open. everyone else gets the one line strip.
  const isNewcomer = explainer.defaultOpenSectionId === 'entry';
  const isExpanded = expanded === null ? isNewcomer : expanded;

  // until someone clicks, follow whatever the league's own state says is worth reading
  const activeId = touched ? openId : explainer.defaultOpenSectionId;

  const handleToggle = (id: string) => {
    setTouched(true);
    setOpenId(activeId === id ? null : id);
  };

  const handleDismiss = () => {
    dispatch(setDisplayDataKey({
      key: 'fantasyGuideDismissed',
      value: { ...(dismissed || {}), [fantasy_group.fantasy_group_id]: 1 },
    }));
  };

  const getMarkerColor = (status: ExplainerStatus) => {
    if (status === 'done') {
      return theme.success.main;
    }

    if (status === 'active') {
      return theme.info.main;
    }

    return theme.text.secondary;
  };

  const getActions = (section: ExplainerSection) => {
    if (!section.actions || !section.actions.length) {
      return null;
    }

    return (
      <div style = {{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {section.actions.map((action, a) => {
          const onClick = () => {
            if (action.kind === 'create_entry') {
              dispatch(setDataKey({ key: 'joining_entry_name', value: '' }));
              return;
            }

            if (action.kind === 'scroll') {
              dispatch(setDataKey({ key: 'highlighted_anchor', value: FANTASY_ANCHOR[action.target] }));
              return;
            }

            navigation.fantasyGroupView(action.subview ? { view: action.view, subview: action.subview } : { view: action.view });
          };

          return (
            <Button
              key = {`${section.id}-${a}`}
              value = {`${section.id}-${a}`}
              title = {action.title}
              onClick = {onClick}
              // the thing to see must not outrank the thing to do
              ink = {action.kind === 'scroll'}
            />
          );
        })}
      </div>
    );
  };

  const paperButtons = [
    <IconButton
      key = 'expand'
      type = 'circle'
      value = 'expand'
      onClick = {() => setExpanded(!isExpanded)}
      icon = {isExpanded ? <ExpandLessIcon style = {{ fontSize: 22 }} /> : <ExpandMoreIcon style = {{ fontSize: 22 }} />}
    />,
    <IconButton
      key = 'dismiss'
      type = 'circle'
      value = 'dismiss'
      onClick = {handleDismiss}
      icon = {<CloseIcon style = {{ fontSize: 20 }} />}
    />,
  ];

  return (
    <div>
      <Typography type = 'h6'>{explainer.title}</Typography>
      <Paper style = {paperStyle} buttons = {paperButtons}>
        <Typography
          type = 'body2'
          style = {{ color: theme.text.secondary, marginBottom: isExpanded ? 8 : 0, cursor: 'pointer' }}
          onClick = {() => setExpanded(!isExpanded)}
        >
          {explainer.summary}
        </Typography>
        {isExpanded ? explainer.sections.map((section, index) => (
          <Collapsible
            key = {section.id}
            id = {section.id}
            title = {section.title}
            marker = {
              <Typography type = 'caption' style = {{ color: getMarkerColor(section.status), fontWeight: 'bold' }}>
                {section.status === 'done' ? '✓' : index + 1}
              </Typography>
            }
            badge = {section.badge}
            badgeColor = {getMarkerColor(section.status)}
            open = {activeId === section.id}
            onToggle = {handleToggle}
            divider = {index < explainer.sections.length - 1}
          >
            <Typography type = 'body2' style = {{ color: theme.text.secondary, marginBottom: 8 }}>{section.lead}</Typography>
            {(section.points || []).map((point, p) => {
              const key = `${section.id}-${p}`;

              return (
                <div key = {key} style = {{ marginBottom: 6 }}>
                  <Typography type = 'body2' style = {{ color: theme.text.secondary, display: 'flex', alignItems: 'flex-start' }}>
                    <span style = {{ marginRight: 6 }}>&bull;</span>
                    <span>{point.text}</span>
                    {
                      point.info ?
                        <span style = {{ display: 'flex' }} onClick = {() => setRevealed({ ...revealed, [key]: !revealed[key] })}>
                          <HelpIcon style = {{ color: theme.info.main, cursor: 'pointer', marginLeft: 5, fontSize: 20 }} />
                        </span>
                        : null
                    }
                  </Typography>
                  {
                    point.info && revealed[key] ?
                      <Typography type = 'caption' style = {{ color: theme.text.secondary, marginLeft: 14 }}>{point.info}</Typography>
                      : null
                  }
                </div>
              );
            })}
            {
              section.facts && section.facts.length ?
                <Columns numberOfColumns = {section.facts.length > 2 ? 3 : 2} breakPoint = {innerBreakPoint}>
                  {section.facts.map((fact) => (
                    <Slab key = {fact.label} label = {fact.label} primary = {fact.primary} info = {fact.info} />
                  ))}
                </Columns>
                : null
            }
            {getActions(section)}
          </Collapsible>
        )) : null}
      </Paper>
    </div>
  );
};

export default HowItWorks;
