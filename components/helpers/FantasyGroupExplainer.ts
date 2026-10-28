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

/** Data, not JSX, so the helper stays JSX-free and a walkthrough can reuse the same copy. */
export type ExplainerAction =
  | { kind: 'view'; title: string; view: string; subview?: string }
  | { kind: 'create_entry'; title: string };

export type ExplainerSection = {
  /** Stable, so a walkthrough can key its steps off these. */
  id: string;
  title: string;
  status: ExplainerStatus;
  badge?: string;
  paragraphs: string[];
  facts?: ExplainerFact[];
  action?: ExplainerAction;
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

  private joinList(values: string[]): string {
    if (values.length <= 1) {
      return values.join('');
    }

    return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;
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
      this.orderSection(),
      this.turnsSection(phase),
      this.clockSection(phase),
      this.rosterSection(),
      this.scoringSection(),
      this.scheduleSection(),
      ...(this.isPaid() ? [this.payoutSection()] : []),
    ];
  }

  private entrySection(phase: ExplainerPhase): ExplainerSection {
    const { name, entries_per_user, entry_fee, cap, entries, private: is_private, locked } = this.fantasy_group;
    const paragraphs: string[] = [];
    const counting = this.myCountingEntries().length;
    const unpaid = this.isPaid() && this.myEntries().some((row) => +row.paid !== 1);
    const eligible = this.eligibleEntryCount();

    const several = entries_per_user > 1;

    if (this.groupHelper.isDraft()) {
      paragraphs.push(`An entry is your team in ${name}, and you need one before you can draft.${several ? ` You can hold up to ${entries_per_user} of them here, and each one drafts its own separate roster.` : ' You get one.'}`);
    } else {
      paragraphs.push(`An entry is one bracket in ${name}.${several ? ` You can hold up to ${entries_per_user} of them here, and each one is filled in and scored separately.` : ' You get one.'}`);
    }

    if (this.isPaid() && entry_fee) {
      paragraphs.push(`Entry costs $${entry_fee}. Only a paid entry counts: an unpaid one is left out${this.groupHelper.isDraft() ? ' of the draft order entirely' : ' of scoring entirely'}${several ? ', and it does not use up one of your slots either' : ''}.`);
    } else {
      paragraphs.push('Entry is free.');
    }

    if (cap && entries) {
      paragraphs.push(`The league is capped at ${entries} ${this.plural(entries, 'entry', 'entries')}, and ${eligible} ${this.plural(eligible, 'is', 'are')} in so far.`);
    }

    paragraphs.push(
      is_private ?
        'This league is private, so only people the owner invites can enter.'
        : 'This league is public, so anyone with the link can enter.',
    );

    if (!locked && this.groupHelper.isDraft()) {
      const moment = this.lockMoment();
      paragraphs.push(`Entries close when the league locks, which happens on its own about five minutes before the draft${moment ? `, so around ${moment}` : ''}. The owner does not have to do anything.`);
    } else if (locked) {
      paragraphs.push(`Entries are closed. The league locked when ${this.groupHelper.isDraft() ? 'the draft order was drawn' : 'the tournament began'}.`);
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

    const section: ExplainerSection = {
      id: 'entry',
      title: 'Get an entry in this league',
      status,
      badge,
      paragraphs,
      facts: [
        { label: 'Entry fee', primary: this.isPaid() && entry_fee ? `$${entry_fee}` : 'Free' },
        { label: 'Entries you can hold', primary: entries_per_user },
      ],
    };

    if (phase === 'open' && this.canCreateEntry()) {
      section.action = { kind: 'create_entry', title: unpaid ? 'Finish payment' : 'Create an entry' };
    }

    return section;
  }

  private orderSection(): ExplainerSection {
    const { locked, draft_start_datetime } = this.fantasy_group;
    const paragraphs: string[] = [];
    const count = this.eligibleEntryCount();
    const type = this.draftType();

    paragraphs.push(`Every entry gets one turn in each of the ${DRAFT_ROUNDS} rounds${count ? `, so with ${count} ${this.plural(count, 'entry', 'entries')} the draft runs ${count * DRAFT_ROUNDS} turns end to end` : ''}.`);

    paragraphs.push('The order is not who joined first. It is a shuffle, seeded from a value saved on the league, so the exact same draw can be reproduced later if anyone ever questions it.');

    if (this.isPaid()) {
      paragraphs.push('Only paid entries go into the draw. An entry that is not paid up when the league locks is not in the draft at all.');
    }

    if (this.isSnake()) {
      paragraphs.push(`This is a snake draft, so the order reverses every even round. Go first in round one and you go last in round two, first again in round three, and so on through round ${DRAFT_ROUNDS}.`);
    } else if (this.isFreeForAll()) {
      paragraphs.push(`This is a free for all draft, so the order never reverses: the same running order repeats in all ${DRAFT_ROUNDS} rounds. Every entry's first turn opens the moment the draft starts, so your opening selection does not have to wait. After that first round, each turn opens the next one.`);
    }

    if (!locked) {
      paragraphs.push('The draw happens at lock time. Until then nobody\'s position is decided, including the owner\'s. Anything shown as a preview before that is only an example of the shape.');
    } else {
      paragraphs.push('The draw is done. The full order is on the Draft Settings card below, under "View draft order".');
    }

    if (type?.description) {
      paragraphs.push(type.description);
    }

    const facts: ExplainerFact[] = [
      { label: 'Draft style', primary: type?.name || 'Not set', info: type?.description },
      { label: 'Rounds', primary: DRAFT_ROUNDS },
    ];

    const starts = this.formatDateTime(draft_start_datetime);

    if (starts) {
      facts.push({ label: 'Draft starts', primary: starts, info: 'You get an email and a notification before it begins.' });
    }

    return {
      id: 'order',
      title: 'How the draft order is drawn',
      status: locked ? 'done' : 'info',
      badge: locked ? 'Drawn' : undefined,
      paragraphs,
      facts,
    };
  }

  private turnsSection(phase: ExplainerPhase): ExplainerSection {
    const { draft_start_datetime } = this.fantasy_group;
    const paragraphs: string[] = [];
    const mine = this.myTurnNumbers();
    const count = this.eligibleEntryCount();
    const done = phase === 'drafted' || phase === 'running' || phase === 'finished';

    if (mine.length) {
      const single = mine.length === 1;

      for (const row of mine) {
        const list = this.joinList(row.turns.map((turn) => `#${turn}`));
        paragraphs.push(
          done ?
            `${single ? 'You drafted' : `${row.name} drafted`} at ${list}.`
            : `${single ? 'You are on the clock at' : `${row.name} is on the clock at`} ${list}.`,
        );
      }

      if (!done) {
        paragraphs.push(`That is ${DRAFT_ROUNDS} turns, one in every round.`);
      }

      const open = this.myOpenRows();

      if (open.length && phase === 'drafting') {
        const soonest = open.map((row) => row.expires).filter((value) => !!value).sort()[0];
        const expires = soonest ? this.formatDateTime(soonest) : null;
        paragraphs.push(`${open.length === 1 ? 'One of your turns is open right now' : `${open.length} of your turns are open right now`}${expires ? `, and the clock runs out at ${expires}` : ''}.`);
      }
    } else if (this.myEntries().length) {
      const starts = this.formatDateTime(draft_start_datetime);
      paragraphs.push(`Your position is not decided yet. It is drawn when the league locks${starts ? `, about five minutes before the draft on ${starts}` : ''}.`);

      if (count) {
        paragraphs.push(`With ${count} ${this.plural(count, 'entry', 'entries')} in, each round is ${count} ${this.plural(count, 'turn', 'turns')} long. Whatever position you draw, you select ${DRAFT_ROUNDS} times.`);
      }
    } else {
      paragraphs.push(`Once you have an entry and the league locks, your own turn numbers show up here. Everyone gets ${DRAFT_ROUNDS}, one in every round.`);
    }

    const facts: ExplainerFact[] = [{ label: 'Your turns', primary: DRAFT_ROUNDS }];

    if (count) {
      facts.push({ label: 'Turns in the draft', primary: count * DRAFT_ROUNDS });
    }

    if (mine.length === 1) {
      facts.push({ label: 'You are up at', primary: mine[0].turns.map((turn) => `#${turn}`).join(', ') });
    }

    const section: ExplainerSection = {
      id: 'turns',
      title: 'When your turn comes around',
      status: this.myOpenRows().length && phase === 'drafting' ? 'active' : 'info',
      badge: this.myOpenRows().length && phase === 'drafting' ? 'Your turn' : undefined,
      paragraphs,
      facts,
    };

    if (phase === 'drafting' || phase === 'locked') {
      section.action = { kind: 'view', title: 'Enter draft room', view: 'draft' };
    }

    return section;
  }

  private clockSection(phase: ExplainerPhase): ExplainerSection {
    const { draft_time_per_user_in_seconds, drafted } = this.fantasy_group;
    const paragraphs: string[] = [];
    const lined_up = this.prePickCount();
    const has_entry = this.myEntries().length > 0;

    if (draft_time_per_user_in_seconds) {
      paragraphs.push(`Each turn gets ${this.formatClock(draft_time_per_user_in_seconds)}. The clock is not a fixed schedule: it starts the instant the turn before yours is filled, so the draft moves as fast as the room does and can reach you earlier than you expect.`);
    } else {
      paragraphs.push('This league has no clock, so no turn ever times out. The draft only moves when someone makes a selection.');
    }

    paragraphs.push('Missing your turn does not cost you the player. The draft takes the highest name still available on your pre-draft list. If that list is empty, or everyone on it is already gone, it takes someone at random from the undrafted players instead.');

    paragraphs.push('That makes the pre-draft list the one thing worth doing ahead of draft day. Order it best first and it drafts for you whether you are watching or not, and you can keep editing it right up until the draft ends.');

    if (this.isSnake()) {
      paragraphs.push('A player somebody drafts is gone for everyone, so your list gets worked down from the top as names disappear.');
    } else if (this.isFreeForAll()) {
      paragraphs.push('Two entries can hold the same player here, so only your own roster takes a name off your board.');
    }

    const facts: ExplainerFact[] = [
      { label: 'Time per turn', primary: draft_time_per_user_in_seconds ? this.formatClock(draft_time_per_user_in_seconds) : 'No limit' },
      {
        label: 'Your pre-draft list',
        primary: lined_up ? `${lined_up} ${this.plural(lined_up, 'player', 'players')}` : 'Not set',
        info: 'This is what drafts for you if you miss a turn.',
      },
    ];

    const needs_list = has_entry && !lined_up && !drafted;

    const section: ExplainerSection = {
      id: 'clock',
      title: 'The clock, and missing your turn',
      status: needs_list ? 'active' : 'info',
      badge: needs_list ? 'Not set' : undefined,
      paragraphs,
      facts,
    };

    if (!drafted && phase !== 'running' && phase !== 'finished') {
      section.action = { kind: 'view', title: 'Set pre-draft selections', view: 'draft', subview: 'pre_picks' };
    }

    return section;
  }

  private rosterSection(): ExplainerSection {
    const ended = this.formatDate(this.fantasy_group.end_date);
    const paragraphs = [
      `Every roster in this league is exactly ${DRAFT_ROUNDS} players, one from each round. There is no bench and no reserve.`,
      `Positions show up on your roster so you can see its shape, but nothing is enforced. ${DRAFT_ROUNDS} guards is a legal roster here.`,
      `There are no trades, no waivers and no lineup to set. What you draft is what scores for you${ended ? ` until ${ended}` : ''}.`,
    ];

    return {
      id: 'roster',
      title: 'What you end up with',
      status: 'info',
      paragraphs,
      facts: [
        { label: 'Roster size', primary: `${DRAFT_ROUNDS} players` },
        { label: 'Changes after the draft', primary: 'None' },
      ],
    };
  }

  private scoringSection(): ExplainerSection {
    const { start_date, end_date, draft_scoring_terminology_id } = this.fantasy_group;
    const scoring = this.draftScoring();
    const paragraphs: string[] = [];
    const opens = this.formatDate(start_date);
    const ended = this.formatDate(end_date);
    const count = this.eligibleEntryCount();

    if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.FANTASY_POINTS) {
      paragraphs.push(`All ${DRAFT_ROUNDS} of your players earn fantasy points, and your score is the total.`);
      paragraphs.push('A point is worth 1, a rebound 1.2, an assist 1.5, a steal 3, a block 3, and a turnover -1.');
      paragraphs.push('So 25 points, 12 rebounds, 10 assists, 1 steal and 4 turnovers works out to 25 + 14.4 + 15 + 3 - 4, which is 53.4.');
    } else if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.EFFICIENCY_RATING) {
      paragraphs.push(`All ${DRAFT_ROUNDS} of your players get an efficiency rating, and your score is the total.`);
      paragraphs.push('A rating is points plus rebounds, assists, steals and blocks, minus missed field goals, missed free throws and turnovers, all divided by games played.');
      paragraphs.push('Because it is a per game rate rather than a season total, a productive player in a handful of games can out-score a steady one who played many.');
    } else if (draft_scoring_terminology_id === TERMINOLOGY_ID.DRAFT_SCORING.ROTO) {
      paragraphs.push(`Your ${DRAFT_ROUNDS} players' stats add into one team total, and the teams are then ranked in each of nine categories.`);
      paragraphs.push('The categories are points, rebounds, assists, steals, blocks, three pointers made, field goal percentage, free throw percentage, and turnovers, with turnovers being the one where fewer is better.');

      if (count) {
        paragraphs.push(`With ${count} ${this.plural(count, 'entry', 'entries')}, the best team in a category takes ${count} points, the next takes ${count - 1}, down to 1. Teams that tie split those points between them. Add up all nine categories and the highest total wins.`);
      } else {
        paragraphs.push('The best team in a category takes a point for every team it beat, and teams that tie split those points. Add up all nine categories and the highest total wins.');
      }
    }

    if (opens && ended) {
      paragraphs.push(`Only games played between ${opens} and ${ended} count. Whatever your players did before the league started is ignored.`);
    }

    paragraphs.push(`Standings are recalculated once a day while the league runs, and the final result lands the day after it ends${ended ? `, so just after ${ended}` : ''}.`);

    if (scoring?.description) {
      paragraphs.push(scoring.description);
    }

    const facts: ExplainerFact[] = [
      { label: 'Scoring metric', primary: scoring?.name || 'Not set', info: scoring?.description },
    ];

    if (opens && ended) {
      facts.push({ label: 'Games that count', primary: `${opens} to ${ended}` });
    }

    return {
      id: 'scoring',
      title: 'How scoring works',
      status: 'info',
      paragraphs,
      facts,
    };
  }

  private scheduleSection(): ExplainerSection {
    const { draft_start_datetime, start_date, end_date, season } = this.fantasy_group;
    const paragraphs: string[] = [];
    const draft = this.formatDateTime(draft_start_datetime);
    const opens = this.formatDate(start_date);
    const ended = this.formatDate(end_date);

    if (draft) {
      paragraphs.push(`The draft is ${draft}. You get an email and a notification beforehand, and the league locks itself about five minutes ahead of it.`);
    }

    if (opens && ended) {
      paragraphs.push(`Scoring runs ${opens} through ${ended}, and the final standings land the day after that.`);
    }

    const facts: ExplainerFact[] = [];

    if (draft) {
      facts.push({ label: 'Draft starts', primary: draft });
    }

    if (opens) {
      facts.push({ label: 'League starts', primary: opens });
    }

    if (ended) {
      facts.push({ label: 'League ends', primary: ended });
    }

    facts.push({ label: 'Season', primary: season });

    return {
      id: 'schedule',
      title: 'The dates that matter',
      status: 'info',
      paragraphs,
      facts,
    };
  }

  private payoutSection(): ExplainerSection {
    const { entry_fee } = this.fantasy_group;
    const paragraphs: string[] = [];
    const paid = this.paidEntryCount();
    const pool = Payment.get_pool_after_fees(entry_fee, paid);
    const split = Payment.get_payout_split(this.fantasy_payout_rule?.json_payout_structure);

    paragraphs.push(`Entry is $${entry_fee}. The pool is every paid entry's fee less the card processing fee of ${(Payment.stripe_percentage * 100).toFixed(2)}% plus $0.${Payment.stripe_transaction_cents}, and the srating.io fee of ${(Payment.srating_percentage * 100).toFixed(2)}%.`);

    paragraphs.push(`With ${paid} paid ${this.plural(paid, 'entry', 'entries')} in, the pool stands at $${pool.toFixed(2)}, and it grows with every entry that pays.`);

    if (this.fantasy_payout_rule && split.length) {
      const shares = split.map((row) => `${Numbers.formatOrdinal(row.rank)} takes ${(row.share * 100).toFixed(1)}% of it`);
      paragraphs.push(`${this.fantasy_payout_rule.name}: ${this.joinList(shares)}.`);
    }

    paragraphs.push('Winners are paid by hand once the league finishes. The live numbers are on the Payout Info card below.');

    return {
      id: 'payouts',
      title: 'Entry fee and payouts',
      status: 'info',
      paragraphs,
    };
  }

  // ---------------------------------------------------------------- bracket sections

  private getBracketSections(phase: ExplainerPhase): ExplainerSection[] {
    return [
      this.entrySection(phase),
      this.bracketSection(),
      this.scheduleSection(),
      ...(this.isPaid() ? [this.payoutSection()] : []),
    ];
  }

  private bracketSection(): ExplainerSection {
    return {
      id: 'bracket',
      title: 'How a bracket is scored',
      status: 'info',
      paragraphs: [
        'You call every game in the tournament before it starts, and the bracket locks once the first game tips off.',
        'A correct call is worth more the further the round goes: 1 point in the first round, then 2, 4, 8, 16, and 32 for the champion. A perfect bracket is 192.',
        'There is one bonus point on top of that, for getting the exact combined score of the championship game.',
      ],
      facts: [
        { label: 'Perfect bracket', primary: 192 },
        { label: 'Tiebreaker', primary: 'Championship combined score' },
      ],
    };
  }
}

export default FantasyGroupExplainer;
