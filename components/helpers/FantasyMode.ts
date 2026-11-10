import { ORGANIZATION_ID, TERMINOLOGY_ID } from '@srating-io/common';
import { Fantasy } from '@srating-io/types';

/**
 * The one place that knows what each fantasy game mode is called and how it behaves.
 *
 * Before this, a mode's differences were ~18 `isDraft() ? x : y` ternaries plus four raw
 * terminology uuids pasted into components. Two problems with that, and the second is the
 * expensive one: a bare uuid does not break when the constant is renamed, and a two armed ternary
 * silently files any third mode under "bracket".
 *
 * Adding a mode should be a row here plus its own screen, nothing else.
 */

export type FantasyModeCode = 'draft' | 'bracket' | 'survivor';

export type FantasyModeDescriptor = {
  code: FantasyModeCode;
  terminology_id: string;
  /** Short label for a card or a heading. */
  label: string;
  /** What one entry *is*, for copy like "you need one before the first game". */
  entryNoun: string;
  /** Plural, for a heading over a list of them. */
  entryNounPlural: string;
  /** Heading over the public list of open leagues of this mode. */
  publicTitle: string;
  /** One line under that heading, explaining the game. */
  publicBlurb: string;
  /** Empty state for that list. */
  publicEmpty: string;
  /**
   * The `view` its play surface lives at, or null when the mode plays on the entry page instead.
   * A bracket is filled in on its entry; a draft and a survivor league have a room of their own.
   */
  playView: string | null;
  /**
   * Whether a rival's entry stays hidden until the league starts. True for a bracket, because the
   * whole field's selections are visible at once and seeing them early decides the pool.
   */
  hidesEntriesUntilStarted: boolean;
  /** Whether the owner gets a manual "close entries" action. */
  ownerCanLock: boolean;
  /**
   * The sports that can actually host this mode.
   *
   * The Fantasy surface is open to every sport now, so without this the create wizard offered a
   * bracket on the nba -- which fails on `brackets.ts` having no season for it -- and a draft on a
   * sport with no player stats pipeline. The home page also listed a card per mode per sport, two
   * of them permanently empty.
   */
  organization_ids: string[];
  /**
   * When the mode's own window opens and closes inside a season, as month and day offsets from the
   * season's ending year. A negative year offset belongs to the previous calendar year, the same
   * convention sports-api/util/official_pools.ts uses.
   *
   * Per sport because a cbb season is november to april and cfb is august to january -- the wizard
   * used one hardcoded cbb range for all of them, so a cfb league could not be given a september
   * start at all.
   */
  season_windows: {[organization_id: string]: { start: string; end: string; start_year_offset: number }};
};

const DESCRIPTORS: FantasyModeDescriptor[] = [
  {
    code: 'draft',
    terminology_id: TERMINOLOGY_ID.FANTASY_GROUP_TYPE.DRAFT,
    label: 'Draft',
    entryNoun: 'team',
    entryNounPlural: 'teams',
    publicTitle: 'Open public draft groups',
    publicBlurb: 'Join one of these groups to draft a team of players!',
    publicEmpty: 'No public draft groups!',
    playView: 'draft',
    hidesEntriesUntilStarted: false,
    ownerCanLock: true,
    // a draft scores on player statistics, which only cbb has a pipeline for
    organization_ids: [ORGANIZATION_ID.CBB],
    season_windows: {
      [ORGANIZATION_ID.CBB]: { start: '11-01', end: '04-10', start_year_offset: -1 },
    },
  },
  {
    code: 'bracket',
    terminology_id: TERMINOLOGY_ID.FANTASY_GROUP_TYPE.NCAA_BRACKET,
    label: 'Bracket',
    entryNoun: 'bracket',
    entryNounPlural: 'brackets',
    publicTitle: 'Open public bracket groups',
    publicBlurb: 'Join one of these groups to fill out a bracket!',
    publicEmpty: 'No public bracket groups!',
    playView: null,
    hidesEntriesUntilStarted: true,
    ownerCanLock: false,
    // the ncaa tournament, so cbb only
    organization_ids: [ORGANIZATION_ID.CBB],
    season_windows: {
      [ORGANIZATION_ID.CBB]: { start: '11-01', end: '04-10', start_year_offset: -1 },
    },
  },
  {
    code: 'survivor',
    terminology_id: TERMINOLOGY_ID.FANTASY_GROUP_TYPE.SURVIVOR,
    label: 'Survivor',
    entryNoun: 'entry',
    entryNounPlural: 'entries',
    publicTitle: 'Open public survivor groups',
    publicBlurb: 'Choose one winning team each round. Get it wrong and your entry is out.',
    publicEmpty: 'No public survivor groups!',
    playView: 'survivor',
    // a selection is hidden per slate by the api, not per league, so the entry list stays open
    hidesEntriesUntilStarted: false,
    ownerCanLock: false,
    // survivor needs a schedule and a final score, which all three have
    organization_ids: [ORGANIZATION_ID.CBB, ORGANIZATION_ID.CFB, ORGANIZATION_ID.NBA],
    season_windows: {
      [ORGANIZATION_ID.CBB]: { start: '11-01', end: '04-10', start_year_offset: -1 },
      [ORGANIZATION_ID.CFB]: { start: '08-01', end: '01-20', start_year_offset: -1 },
      [ORGANIZATION_ID.NBA]: { start: '10-01', end: '04-15', start_year_offset: -1 },
    },
  },
];

/**
 * Mode helpers. Static and store free, so a component can call them in any order.
 */
class FantasyMode {
  public static getModes(): FantasyModeDescriptor[] {
    return DESCRIPTORS;
  }

  /** Null for a league whose type is unset or unknown, which the callers already handle. */
  public static getMode(fantasy_group: Fantasy.FantasyGroup | null | undefined): FantasyModeDescriptor | null {
    if (!fantasy_group || !fantasy_group.fantasy_group_type_terminology_id) {
      return null;
    }

    return FantasyMode.getModeByTerminologyID(fantasy_group.fantasy_group_type_terminology_id);
  }

  public static getModeByTerminologyID(terminology_id: string | null | undefined): FantasyModeDescriptor | null {
    if (!terminology_id) {
      return null;
    }

    return DESCRIPTORS.find((row) => row.terminology_id === terminology_id) || null;
  }

  public static getModeByCode(code: FantasyModeCode): FantasyModeDescriptor | null {
    return DESCRIPTORS.find((row) => row.code === code) || null;
  }

  /** What one entry is called in this league, for copy. Falls back to the neutral word. */
  public static getEntryNoun(fantasy_group: Fantasy.FantasyGroup | null | undefined): string {
    return FantasyMode.getMode(fantasy_group)?.entryNoun || 'entry';
  }

  /** The modes a sport can host, which is what the create wizard and the public lists offer. */
  public static getModesForOrganization(organization_id: string | null | undefined): FantasyModeDescriptor[] {
    if (!organization_id) {
      return [];
    }

    return DESCRIPTORS.filter((row) => row.organization_ids.includes(organization_id));
  }

  /**
   * The first and last date a league of this mode can be played on, as `Y-m-d`.
   *
   * Null when the sport cannot host the mode at all, which the callers read as "no dates to offer".
   * `season` is the ending year, so a 2027 cbb season starts in november 2026.
   */
  public static getSeasonWindow(
    mode: FantasyModeDescriptor | null | undefined,
    organization_id: string | null | undefined,
    season: number,
  ): { opens: string; closes: string } | null {
    if (!mode || !organization_id || !(organization_id in mode.season_windows)) {
      return null;
    }

    const window = mode.season_windows[organization_id];

    return {
      opens: `${season + window.start_year_offset}-${window.start}`,
      closes: `${season}-${window.end}`,
    };
  }
}

export default FantasyMode;
