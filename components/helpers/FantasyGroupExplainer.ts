import { Dates, Numbers } from '@esmalley/ts-utils';
import { Fantasy, General } from '@srating-io/types';
import { TERMINOLOGY_ID } from '@srating-io/common';
import FantasyGroup, { DRAFT_ROUNDS } from './FantasyGroup';
import Payment from './Payment';


export type ExplainerPhase = 'open' | 'locked' | 'drafting' | 'drafted' | 'running' | 'finished';

export type ExplainerStatus = 'done' | 'active' | 'todo' | 'info';

/** Rendered as a Slab, so `info` feeds its built-in explain affordance. */
export type ExplainerFact = {
  label: string;
  primary: string | number;
  info?: string;
};

/** One line of rule. The detail lives in `info` and stays hidden until it is asked for. */
export type ExplainerPoint = {
  text: string;
  info?: string;
};

/** Where on the page a section's own card lives. The renderer resolves it to a dom id. */
export type ExplainerTarget = 'entries' | 'entries_and_fees' | 'draft_settings' | 'payouts' | 'bracket' | 'rosters';

/** Data, not JSX, so the helper stays JSX-free and a walkthrough can reuse the same copy. */
export type ExplainerAction =
  | { kind: 'view'; title: string; view: string; subview?: string }
  | { kind: 'create_entry'; title: string }
  | { kind: 'scroll'; title: string; target: ExplainerTarget };

export type ExplainerSection = {
  /** Stable, so a walkthrough can key its steps off these. */
  id: string;
  title: string;
  status: ExplainerStatus;
  badge?: string;
  /** The one thing the reader has to know. A single string, so prose creep is a type error. */
  lead: string;
  points?: ExplainerPoint[];
  facts?: ExplainerFact[];
  actions?: ExplainerAction[];
};

export type Explainer = {
  title: string;
  summary: string;
  phase: ExplainerPhase;
  sections: ExplainerSection[];
  /** Which section to open on first paint, or null once there is nothing left to prepare for. */
  defaultOpenSectionId: string | null;
};


/**
 * Turns a league's configuration into the prose that explains it. Everything is injected rather
 * than read from the store, so the copy is a pure function of the league and can be called
 * conditionally without upsetting hook order.
 *
 * User-visible strings here avoid betting vocabulary on purpose - see .agents/conventions.md. This
 * card renders for logged-out visitors, which is exactly the copy that got the site disapproved.
 */
class FantasyGroupExplainer {
  constructor(
    {
      fantasy_group,
      fantasy_entrys,
      fantasy_draft_orders,
      fantasy_entry_pre_picks,
      terminology,
      fantasy_payout_rule,
      user_id,
      now,
    }:
    {
      fantasy_group: Fantasy.FantasyGroup;
      fantasy_entrys: Fantasy.FantasyEntrys;
      fantasy_draft_orders: Fantasy.FantasyDraftOrders;
      /** The api only ever returns this user's own, per the slice. */
      fantasy_entry_pre_picks: Fantasy.FantasyEntryPrePicks;
      terminology: General.Terminologies;
      fantasy_payout_rule: Fantasy.FantasyPayoutRule | null;
      user_id?: string | null;
      now: Date;
    },
  ) {
    this.fantasy_group = fantasy_group;
    this.fantasy_entrys = fantasy_entrys || {};
    this.fantasy_draft_orders = fantasy_draft_orders || {};
    this.fantasy_entry_pre_picks = fantasy_entry_pre_picks || {};
    this.terminology = terminology || {};
    this.fantasy_payout_rule = fantasy_payout_rule;
    this.user_id = user_id;
    this.now = now;
    this.groupHelper = new FantasyGroup({ fantasy_group });
  }

  private fantasy_group: Fantasy.FantasyGroup;
  private fantasy_entrys: Fantasy.FantasyEntrys;
  private fantasy_draft_orders: Fantasy.FantasyDraftOrders;
  private fantasy_entry_pre_picks: Fantasy.FantasyEntryPrePicks;
  private terminology: General.Terminologies;
  private fantasy_payout_rule: Fantasy.FantasyPayoutRule | null;
  private user_id?: string | null;
  private now: Date;
  private groupHelper: FantasyGroup;

  // ---------------------------------------------------------------- derived state

  private isSnake(): boolean {
    return this.fantasy_group.draft_type_terminology_id === TERMINOLOGY_ID.DRAFT_TYPE.SNAKE;
  }

  private isFreeForAll(): boolean {
    return this.fantasy_group.draft_type_terminology_id === TERMINOLOGY_ID.DRAFT_TYPE.FREE_FOR_ALL;
  }

  private isPaid(): boolean {
    return !!this.fantasy_group.entry_fee;
  }

  private myEntries(): Fantasy.FantasyEntry[] {
    if (!this.user_id) {
      return [];
    }

    return Object.values(this.fantasy_entrys).filter((row) => row.user_id === this.user_id);
  }

  private myCountingEntries(): Fantasy.FantasyEntry[] {
    // billing counts a seat in a paid league as a paid entry; a free league counts them all
    return this.isPaid() ? this.myEntries().filter((row) => +row.paid === 1) : this.myEntries();
  }

  /**
   * Entries that will actually be in the draft. generateDraftOrder drops unpaid entries in a paid
   * league, so this is what sets the length of a round.
   */
  private eligibleEntryCount(): number {
    const rows = Object.values(this.fantasy_entrys);
    return this.isPaid() ? rows.filter((row) => +row.paid === 1).length : rows.length;
  }

  private paidEntryCount(): number {
    return Object.values(this.fantasy_entrys).filter((row) => +row.paid === 1).length;
  }

  /**
   * True only once the real rows exist. The preview from getDraftOrder sorts by date_of_entry and
   * keeps unpaid entries, so it looks nothing like the seeded, paid-only draw - never read it here.
   */
  private orderIsFinal(): boolean {
    return !!this.fantasy_group.locked && Object.keys(this.fantasy_draft_orders).length > 0;
  }

  private myDraftOrderRows(): Fantasy.FantasyDraftOrder[] {
    const mine = this.myEntries().map((row) => row.fantasy_entry_id);

    if (!mine.length) {
      return [];
    }

    return Object.values(this.fantasy_draft_orders)
      .filter((row) => mine.includes(row.fantasy_entry_id))
      .sort((a, b) => a.pick - b.pick);
  }

  /** Turn numbers per entry of mine, ascending. Empty unless the draw is done. */
  private myTurnNumbers(): { fantasy_entry_id: string; name: string; turns: number[] }[] {
    if (!this.orderIsFinal()) {
      return [];
    }

    const grouped: { [fantasy_entry_id: string]: number[] } = {};

    for (const row of this.myDraftOrderRows()) {
      if (!(row.fantasy_entry_id in grouped)) {
        grouped[row.fantasy_entry_id] = [];
      }
      grouped[row.fantasy_entry_id].push(row.pick);
    }

    return Object.keys(grouped).map((fantasy_entry_id) => ({
      fantasy_entry_id,
      name: this.fantasy_entrys[fantasy_entry_id]?.name || 'Your entry',
      turns: grouped[fantasy_entry_id],
    }));
  }

  /** My slots that are open and unfilled. Correct for snake and free for all alike. */
  private myOpenRows(): Fantasy.FantasyDraftOrder[] {
    return this.myDraftOrderRows().filter((row) => (
      !!row.eligible &&
      !row.picked &&
      !row.fantasy_entry_player_id &&
      Dates.parse(row.eligible, true) <= this.now
    ));
  }

  private prePickCount(): number {
    return Object.keys(this.fantasy_entry_pre_picks).length;
  }

  private getTerminology(terminology_id: string | null): General.Terminology | null {
    if (!terminology_id || !(terminology_id in this.terminology)) {
      return null;
    }

    return this.terminology[terminology_id];
  }

  private draftType(): General.Terminology | null {
    return this.getTerminology(this.fantasy_group.draft_type_terminology_id);
  }

  private draftScoring(): General.Terminology | null {
    return this.getTerminology(this.fantasy_group.draft_scoring_terminology_id);
  }

  // ---------------------------------------------------------------- formatting

  private plural(count: number, one: string, many: string): string {
    return count === 1 ? one : many;
  }

  private formatDateTime(value: string | null): string | null {
    return value ? Dates.format(Dates.parse(value, true), 'D M jS @ g:i a') : null;
  }

  private formatDate(value: string | null): string | null {
    return value ? Dates.format(Dates.parse(value, true), 'M jS, Y') : null;
  }

  private formatClock(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} ${this.plural(seconds, 'second', 'seconds')}`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = Math.round(seconds % 60);

    if (!remainder) {
      return `${minutes} ${this.plural(minutes, 'minute', 'minutes')}`;
    }

    return `${minutes} ${this.plural(minutes, 'minute', 'minutes')} ${remainder} ${this.plural(remainder, 'second', 'seconds')}`;
  }

  /** The api locks a league roughly five minutes before the draft, so nobody has to remember to. */
  private lockMoment(): string | null {
    const { draft_start_datetime } = this.fantasy_group;

    if (!draft_start_datetime) {
      return null;
    }

    return this.formatDateTime(new Date(Dates.parse(draft_start_datetime, true).getTime() - (5 * 60 * 1000)).toISOString());
  }

  // ---------------------------------------------------------------- public

  hasStarted(): boolean {
    const { started, start_date } = this.fantasy_group;
    return !!started || (!!start_date && Dates.parse(start_date, true) < this.now);
  }

  /**
   * Mirrors what billing and fantasy_entry.createEntry enforce, so the checklist, the card and
   * My Entries all agree on whether another entry is possible.
   */
  canCreateEntry(): boolean {
    return (
      !!this.user_id &&
      this.fantasy_group.locked === 0 &&
      this.fantasy_group.entries_per_user > this.myCountingEntries().length
    );
  }

  getPhase(): ExplainerPhase {
    const { finished, drafted, locked, draft_start_datetime } = this.fantasy_group;

    if (finished) {
      return 'finished';
    }

    if (this.hasStarted()) {
      return 'running';
    }

    if (drafted) {
      return 'drafted';
    }

    if (locked && draft_start_datetime && Dates.parse(draft_start_datetime, true) <= this.now) {
      return 'drafting';
    }

    if (locked) {
      return 'locked';
    }

    return 'open';
  }

  getExplainer(): Explainer {
    const phase = this.getPhase();
    const sections = this.groupHelper.isDraft() ? this.getDraftSections(phase) : this.getBracketSections(phase);

    return {
      title: this.groupHelper.isDraft() ? 'How this draft works' : 'How this bracket works',
      summary: this.getSummary(phase),
      phase,
      sections,
      defaultOpenSectionId: this.getDefaultOpenSectionId(phase, sections),
    };
  }

  /** Before the draft, open whatever still needs doing. After it, leave the card collapsed. */
  private getDefaultOpenSectionId(phase: ExplainerPhase, sections: ExplainerSection[]): string | null {
    if (phase === 'drafted' || phase === 'running' || phase === 'finished') {
      return null;
    }

    const active = sections.find((row) => row.status === 'active');

    return active ? active.id : null;
  }

  private getSummary(phase: ExplainerPhase): string {
    const { name, start_date, end_date } = this.fantasy_group;
    const scoring = this.draftScoring();
    const count = this.eligibleEntryCount();
    const ended = this.formatDate(end_date);

    if (phase === 'finished') {
      return `${name} is over${ended ? `, as of ${ended}` : ''}. This is how it was run.`;
    }

    if (phase === 'running' && this.groupHelper.isDraft()) {
      return `Your ${DRAFT_ROUNDS} players are scoring${scoring ? ` on ${scoring.name.toLowerCase()}` : ''}${ended ? ` until ${ended}` : ''}. Standings refresh once a day.`;
    }

    if (!this.groupHelper.isDraft()) {
      return `Fill in a bracket, score it by round, and see where you land${ended ? ` by ${ended}` : ''}.`;
    }

    const parts: string[] = [];

    if (count) {
      parts.push(`${count} ${this.plural(count, 'entry', 'entries')} drafting ${DRAFT_ROUNDS} players each`);
    } else {
      parts.push(`Every entry drafts ${DRAFT_ROUNDS} players`);
    }

    if (this.draftType()) {
      parts.push(`${(this.draftType() as General.Terminology).name.toLowerCase()} style`);
    }

    if (scoring) {
      parts.push(`scored on ${scoring.name.toLowerCase()}`);
    }

    const opens = this.formatDate(start_date);

    if (opens && ended) {
      parts.push(`from ${opens} to ${ended}`);
    }

    return `${parts.join(', ')}.`;
  }

  // ---------------------------------------------------------------- draft sections

  private getDraftSections(phase: ExplainerPhase): ExplainerSection[] {
    return [
      this.entrySection(phase),
      this.orderSection(phase),
      this.clockSection(phase),
      this.scoringSection(phase),
      ...(this.isPaid() ? [this.payoutSection()] : []),
    ];
  }

  private entrySection(phase: ExplainerPhase): ExplainerSection {
    const { name, entries_per_user, entry_fee, cap, entries, private: is_private, locked } = this.fantasy_group;
    const points: ExplainerPoint[] = [];
    const counting = this.myCountingEntries().length;
    const unpaid = this.isPaid() && this.myEntries().some((row) => +row.paid !== 1);
    const eligible = this.eligibleEntryCount();

    const several = entries_per_user > 1;
    const isDraft = this.groupHelper.isDraft();

    const lead = locked ?
      `Entries are closed, so every ${isDraft ? 'team' : 'bracket'} in ${name} is set.`
      : `An entry is ${isDraft ? 'your team' : 'one bracket'} in ${name}, and you need one before ${isDraft ? 'the draft' : 'the first game'}.`;

    points.push({
      text: is_private ?
        'Private league, so only people the owner invites can enter.'
        : 'Public league, so anyone with the link can enter.',
    });

    if (!locked && isDraft) {
      const moment = this.lockMoment();
      points.push({
        text: `Entries close about five minutes before the draft${moment ? `, around ${moment}` : ''}.`,
        info: 'The league locks itself at that point, so the owner does not have to do anything.',
      });
    }

    const feeInfo = `Only a paid entry counts. An unpaid one is left out ${isDraft ? 'of the draft order' : 'of scoring'}${several ? ', and it does not use up one of your slots' : ''}.`;

    const facts: ExplainerFact[] = [
      {
        label: 'Entry fee',
        primary: this.isPaid() && entry_fee ? `$${entry_fee}` : 'Free',
        info: this.isPaid() && entry_fee ? feeInfo : undefined,
      },
      {
        label: 'Entries you can hold',
        primary: entries_per_user,
        info: several ? `Each one ${isDraft ? 'drafts its own roster' : 'is filled in and scored'} separately.` : undefined,
      },
    ];

    if (cap && entries) {
      facts.push({
        label: 'Entries in',
        primary: `${eligible} of ${entries}`,
        info: 'The league stops taking entries once it is full.',
      });
    }

    let status: ExplainerStatus = 'info';
    let badge: string | undefined;

    if (unpaid) {
      status = 'active';
      badge = 'Payment pending';
    } else if (counting > 0) {
      status = 'done';
      badge = 'You are in';
    } else if (this.canCreateEntry()) {
      status = 'active';
    } else if (!locked) {
      badge = 'Sign in to enter';
    } else {
      badge = 'Closed';
    }

    const actions: ExplainerAction[] = [];

    if (phase === 'open' && this.canCreateEntry()) {
      actions.push({ kind: 'create_entry', title: unpaid ? 'Finish payment' : 'Create an entry' });
    }

    actions.push({ kind: 'scroll', title: 'Show me', target: 'entries' });

    return {
      id: 'entry',
      title: 'Get an entry in this league',
      status,
      badge,
      lead,
      points,
      facts,
      actions,
    };
  }

  private orderSection(phase: ExplainerPhase): ExplainerSection {
    const { locked, draft_start_datetime } = this.fantasy_group;
    const points: ExplainerPoint[] = [];
    const count = this.eligibleEntryCount();
    const type = this.draftType();
    const open = this.myOpenRows();
    const myTurn = !!open.length && phase === 'drafting';

    let lead: string;

    if (myTurn) {
      const soonest = open.map((row) => row.expires).filter((value) => !!value).sort()[0];
      const expires = soonest ? this.formatDateTime(soonest) : null;
      lead = `It is your turn right now${expires ? `, until ${expires}` : ''}.`;
    } else if (this.orderIsFinal()) {
      lead = `The order is drawn, and every entry takes one turn in each of the ${DRAFT_ROUNDS} rounds.`;
    } else {
      lead = 'The order is a seeded shuffle drawn when the league locks, not who joined first.';
    }

    if (this.isSnake()) {
      points.push({
        text: 'The order reverses every even round.',
        info: `Go first in round one and you go last in round two, first again in round three, and so on through round ${DRAFT_ROUNDS}.`,
      });
    } else if (this.isFreeForAll()) {
      points.push({
        text: `The same running order repeats in all ${DRAFT_ROUNDS} rounds.`,
        info: 'Every entry\'s first turn opens the moment the draft starts, so your opening selection does not have to wait. After that, each turn opens the next one.',
      });
    }

    if (this.isPaid()) {
      points.push({
        text: 'Only paid entries go into the draw.',
        info: 'An entry that is not paid up when the league locks is not in the draft at all.',
      });
    }

    if (!locked) {
      points.push({
        text: 'Nobody\'s position is decided until lock time, the owner\'s included.',
        info: 'The draw is seeded from a value saved on the league, so the exact same order can be reproduced later if anyone questions it. Anything shown before the draw is only an example of the shape.',
      });
    }

    const facts: ExplainerFact[] = [
      { label: 'Draft style', primary: type?.name || 'Not set', info: type?.description },
      {
        label: 'Rounds',
        primary: DRAFT_ROUNDS,
        info: count ? `With ${count} ${this.plural(count, 'entry', 'entries')} in, each round is ${count} ${this.plural(count, 'turn', 'turns')} long, so the draft runs ${count * DRAFT_ROUNDS} turns end to end.` : undefined,
      },
    ];

    const starts = this.formatDateTime(draft_start_datetime);

    if (starts) {
      facts.push({
        label: 'Draft starts',
        primary: starts,
        info: 'You get an email and a notification before it begins.',
      });
    }

    // the viewer's own position reads as part of the order, so it shares this section
    const mine = this.myTurnNumbers();

    for (const row of mine) {
      facts.push({
        label: mine.length === 1 ? 'You are up at' : `${row.name} is up at`,
        primary: row.turns.map((turn) => `#${turn}`).join(', '),
        info: `One turn in every round, ${DRAFT_ROUNDS} in total.`,
      });
    }

    let status: ExplainerStatus = 'info';
    let badge: string | undefined;

    if (myTurn) {
      status = 'active';
      badge = 'Your turn';
    } else if (locked) {
      status = 'done';
      badge = 'Drawn';
    }

    const actions: ExplainerAction[] = [];

    if (phase === 'drafting' || phase === 'locked') {
      actions.push({ kind: 'view', title: 'Enter draft room', view: 'draft' });
    }

    actions.push({
      kind: 'scroll',
      title: this.orderIsFinal() ? 'Show me the order' : 'Show me the settings',
      target: 'draft_settings',
    });

    return {
      id: 'order',
      title: mine.length ? 'The draft order, and when you are up' : 'How the draft order is drawn',
      status,
      badge,
      lead,
      points,
      facts,
      actions,
    };
  }

  private clockSection(phase: ExplainerPhase): ExplainerSection {
    const { draft_time_per_user_in_seconds, drafted } = this.fantasy_group;
    const points: ExplainerPoint[] = [];
    const lined_up = this.prePickCount();
    const has_entry = this.myEntries().length > 0;

    const lead = draft_time_per_user_in_seconds ?
      `Each turn gets ${this.formatClock(draft_time_per_user_in_seconds)}, and it starts the instant the turn before yours is filled.`
      : 'There is no clock here, so the draft only moves when someone makes a selection.';

    // the headline rule stays on screen. only how it resolves is worth hiding
    points.push({
      text: 'Miss your turn and your pre-draft list drafts for you.',
      info: 'It takes the highest name still available on your list. If the list is empty, or everyone on it is already gone, it takes someone at random from the undrafted players instead.',
    });

    points.push({
      text: 'Order it best first, and keep editing it right up until the draft ends.',
      info: 'It is the one thing worth doing ahead of draft day, and it works whether you are watching or not.',
    });

    if (this.isSnake()) {
      points.push({
        text: 'A player somebody drafts is gone for everyone.',
        info: 'Your list gets worked down from the top as names disappear.',
      });
    } else if (this.isFreeForAll()) {
      points.push({
        text: 'Two entries can hold the same player here.',
        info: 'Only your own roster takes a name off your board.',
      });
    }

    const clockInfo = draft_time_per_user_in_seconds ?
      'The clock is not a fixed schedule. It starts when the turn before yours is filled, so the draft can reach you earlier than you expect.'
      : 'No turn ever times out.';

    const facts: ExplainerFact[] = [
      {
        label: 'Time per turn',
        primary: draft_time_per_user_in_seconds ? this.formatClock(draft_time_per_user_in_seconds) : 'No limit',
        info: clockInfo,
      },
      {
        label: 'Your pre-draft list',
        primary: lined_up ? `${lined_up} ${this.plural(lined_up, 'player', 'players')}` : 'Not set',
        info: 'This is what drafts for you if you miss a turn.',
      },
    ];

    const needs_list = has_entry && !lined_up && !drafted;
    const actions: ExplainerAction[] = [];

    // no scroll target: the only thing Draft Settings adds here is already the time per turn fact
    if (!drafted && phase !== 'running' && phase !== 'finished') {
      actions.push({ kind: 'view', title: 'Set pre-draft selections', view: 'draft', subview: 'pre_picks' });
    }

    return {
      id: 'clock',
      title: 'The clock, and missing your turn',
      status: needs_list ? 'active' : 'info',
      badge: needs_list ? 'Not set' : undefined,
      lead,
      points,
      facts,
      actions,
    };
  }

  private scoringSection(phase: ExplainerPhase): ExplainerSection {
    const { start_date, end_date, draft_scoring_terminology_id } = this.fantasy_group;
    const scoring = this.draftScoring();
    const points: ExplainerPoint[] = [];
    const opens = this.formatDate(start_date);
    const ended = this.formatDate(end_date);
    const count = this.eligibleEntryCount();

    const lead = `Your roster is ${DRAFT_ROUNDS} players, one from each round, and what you draft is what scores${ended ? ` until ${ended}` : ''}.`;

    points.push({
      text: 'No trades, no waivers, no lineup to set.',
      info: `There is no bench and no reserve, and positions are not enforced, so ${DRAFT_ROUNDS} guards is a legal roster here.`,
    });

    if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.FANTASY_POINTS) {
      points.push({
        text: `All ${DRAFT_ROUNDS} of your players earn fantasy points, and your score is the total.`,
        info: 'A point is worth 1, a rebound 1.2, an assist 1.5, a steal 3, a block 3, and a turnover -1. So 25 points, 12 rebounds, 10 assists, 1 steal and 4 turnovers is 25 + 14.4 + 15 + 3 - 4, which is 53.4.',
      });
    } else if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.EFFICIENCY_RATING) {
      points.push({
        text: `All ${DRAFT_ROUNDS} of your players get an efficiency rating, and your score is the total.`,
        info: 'A rating is points plus rebounds, assists, steals and blocks, minus missed field goals, missed free throws and turnovers, all divided by games played. Because it is a per game rate rather than a season total, a productive player in a handful of games can out-score a steady one who played many.',
      });
    } else if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.ROTO) {
      const ranking = count ?
        `With ${count} ${this.plural(count, 'entry', 'entries')}, the best team in a category takes ${count} points, the next ${count - 1}, down to 1.`
        : 'The best team in a category takes a point for every team it beat.';

      points.push({
        text: 'Your players\' stats add into one team total, then every team is ranked in nine categories.',
        info: `The categories are points, rebounds, assists, steals, blocks, three pointers made, field goal percentage, free throw percentage, and turnovers, where fewer is better. ${ranking} Teams that tie split those points. Add up all nine and the highest total wins.`,
      });
    }

    points.push({
      text: 'Standings are recalculated once a day.',
      info: `The final result lands the day after the league ends${ended ? `, so just after ${ended}` : ''}.`,
    });

    const facts: ExplainerFact[] = [
      { label: 'Roster size', primary: `${DRAFT_ROUNDS} players` },
      { label: 'Scoring metric', primary: scoring?.name || 'Not set', info: scoring?.description },
    ];

    if (opens && ended) {
      facts.push({
        label: 'Games that count',
        primary: `${opens} to ${ended}`,
        info: 'Whatever your players did before the league started is ignored.',
      });
    }

    // rosters only exist on the page once the league is running, so point at the settings before that
    const running = phase === 'running' || phase === 'finished';

    return {
      id: 'scoring',
      title: 'What you draft, and how it scores',
      status: 'info',
      lead,
      points,
      facts,
      actions: [{ kind: 'scroll', title: 'Show me', target: running ? 'rosters' : 'draft_settings' }],
    };
  }

  private payoutSection(): ExplainerSection {
    const { entry_fee } = this.fantasy_group;
    const points: ExplainerPoint[] = [];
    const paid = this.paidEntryCount();
    const pool = Payment.get_pool_after_fees(entry_fee, paid);
    const split = Payment.get_payout_split(this.fantasy_payout_rule?.json_payout_structure);

    const lead = this.fantasy_payout_rule && split.length ?
      `Every paid entry's fee goes into one pool, split by the ${this.fantasy_payout_rule.name} rule.`
      : 'Every paid entry\'s fee goes into one pool, less processing and site fees.';

    const poolInfo = `Every paid entry's fee, less the card processing fee of ${(Payment.stripe_percentage * 100).toFixed(2)}% plus $0.${Payment.stripe_transaction_cents}, and the srating.io fee of ${(Payment.srating_percentage * 100).toFixed(2)}%. It grows with every entry that pays.`;

    const facts: ExplainerFact[] = [
      { label: 'Current pool', primary: `$${pool.toFixed(2)}`, info: poolInfo },
      { label: 'Paid entries', primary: paid },
    ];

    if (this.fantasy_payout_rule && split.length) {
      const shares = split.map((row) => `${Numbers.formatOrdinal(row.rank)} ${(row.share * 100).toFixed(1)}%`).join(', ');
      points.push({ text: `${shares}.`, info: 'The dollar amounts behind those shares are on the Payout Info card.' });
    }

    points.push({
      text: 'Winners are paid by hand once the league finishes.',
      info: 'Nothing is paid out while the league is still running.',
    });

    // PayoutInfo only renders when the league has a payout rule, so do not point at nothing
    return {
      id: 'payouts',
      title: 'Entry fee and payouts',
      status: 'info',
      lead,
      points,
      facts,
      actions: [{ kind: 'scroll', title: 'Show me', target: this.fantasy_payout_rule ? 'payouts' : 'entries_and_fees' }],
    };
  }

  // ---------------------------------------------------------------- bracket sections

  private getBracketSections(phase: ExplainerPhase): ExplainerSection[] {
    return [
      this.entrySection(phase),
      this.bracketSection(),
      ...(this.isPaid() ? [this.payoutSection()] : []),
    ];
  }

  private bracketSection(): ExplainerSection {
    const lead = 'You call every game before the tournament starts, and the bracket locks when the first game tips off.';

    const points: ExplainerPoint[] = [
      {
        text: 'A correct call is worth more the deeper the round goes.',
        info: '1 point in the first round, then 2, 4, 8, 16, and 32 for the champion.',
      },
      {
        text: 'One bonus point for the exact combined score of the championship game.',
        info: 'It is also what separates two brackets on the same score.',
      },
    ];

    const opens = this.formatDate(this.fantasy_group.start_date);
    const ended = this.formatDate(this.fantasy_group.end_date);

    const facts: ExplainerFact[] = [
      {
        label: 'Perfect bracket',
        primary: 192,
        info: 'Every round doubles: 32 first-round calls at 1 point each, then 2, 4, 8, 16, and 32 for the champion.',
      },
      { label: 'Tiebreaker', primary: 'Championship combined score' },
    ];

    if (opens && ended) {
      facts.push({
        label: 'Tournament',
        primary: `${opens} to ${ended}`,
        info: 'The final standings land the day after it ends.',
      });
    }

    return {
      id: 'bracket',
      title: 'How a bracket is scored',
      status: 'info',
      lead,
      points,
      facts,
      actions: [{ kind: 'scroll', title: 'Show me', target: 'bracket' }],
    };
  }
}

export default FantasyGroupExplainer;
