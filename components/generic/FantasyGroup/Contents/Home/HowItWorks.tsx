'use client';

import MenuBookIcon from '@esmalley/react-material-icons/MenuBook';
import { useEffect, useMemo, useState } from 'react';
import { Button, Columns, Paper, Slab, Typography, useTheme } from '@esmalley/react-material-ui';
import { getTitle, innerBreakPoint, paperStyle } from '../../Card';
import Collapsible from '@/components/generic/Collapsible';
import FantasyGroupExplainer, { ExplainerSection, ExplainerStatus } from '@/components/helpers/FantasyGroupExplainer';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy_group-slice';


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
  const user = useAppSelector((state) => state.userReducer.user);

  // the phase turns on the draft start passing, which no store update announces
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const [openId, setOpenId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

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

  // until someone clicks, follow whatever the league's own state says is worth reading
  const activeId = touched ? openId : explainer.defaultOpenSectionId;

  const handleToggle = (id: string) => {
    setTouched(true);
    setOpenId(activeId === id ? null : id);
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

  const getAction = (section: ExplainerSection) => {
    if (!section.action) {
      return null;
    }

    const { action } = section;

    const onClick = () => {
      if (action.kind === 'create_entry') {
        dispatch(setDataKey({ key: 'joining_entry_name', value: '' }));
        return;
      }

      navigation.fantasyGroupView(action.subview ? { view: action.view, subview: action.subview } : { view: action.view });
    };

    return (
      <div style = {{ marginTop: 8 }}>
        <Button value = {`${section.id}-action`} title = {action.title} onClick = {onClick} />
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Getting started</Typography>
      <Paper style = {paperStyle}>
        {getTitle(
          <MenuBookIcon style = {{ color: theme.info.main, fontSize: 24 }} />,
          explainer.title,
        )}
        <Typography type = 'body2' style = {{ color: theme.text.secondary, marginBottom: 12 }}>
          {explainer.summary}
        </Typography>
        {explainer.sections.map((section, index) => (
          <Collapsible
            key = {section.id}
            id = {section.id}
            title = {`${index + 1}. ${section.title}`}
            summary = {section.paragraphs[0]}
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
            {section.paragraphs.map((paragraph, p) => (
              <Typography key = {p} type = 'body2' style = {{ marginBottom: 8 }}>{paragraph}</Typography>
            ))}
            {
              section.facts && section.facts.length ?
                <Columns numberOfColumns = {section.facts.length > 2 ? 3 : 2} breakPoint = {innerBreakPoint}>
                  {section.facts.map((fact) => (
                    <Slab key = {fact.label} label = {fact.label} primary = {fact.primary} info = {fact.info} />
                  ))}
                </Columns>
                : null
            }
            {getAction(section)}
          </Collapsible>
        ))}
      </Paper>
    </div>
  );
};

export default HowItWorks;
