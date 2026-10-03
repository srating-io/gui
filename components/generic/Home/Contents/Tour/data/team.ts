/**
 * One real season, for the landing page tour: Michigan, 37-3 in 2026.
 *
 * The same team the hero scatter names, so a reader scrolling the page follows one season rather
 * than meeting a new one in every panel - and a real one, pulled from the endpoints the team page
 * itself reads. The ranks, the splits, the schedule and the results are what happened.
 *
 * Every derived figure here is computed the way the live page computes it. A bar is the team page
 * own distance-from-the-middle, (standing - 0.5) * 2 against a league of 365; a percentile on the
 * radar is one minus the rank over the field, the same arithmetic the player page does.
 */
import type {
  CalibrationPoint, DivergingBar, DumbbellRow, RadarSpoke, RankStripRow, SequenceCell,
} from '@/components/generic/Chart';

/** The team these panels are about, and the season they are from. */
export const TEAM_NAME = 'Michigan';
export const SEASON = 2026;

/** The denominator every team rank on this page is measured against. */
export const LEAGUE_SIZE = 365;

/** The same, for the player profile: everyone the division ranked that season. */
export const RANKED_PLAYERS = 5634;

/** The headline measures, as positions on a track rather than bare ordinals. */
export const rankStripRows: RankStripRow[] = [
  { key: 'adjusted_efficiency_rating', label: 'aEM', value: 32.89, rank: 2 },
  { key: 'offensive_rating', label: 'ORtg', value: 120.79, rank: 6 },
  { key: 'defensive_rating', label: 'DRtg', value: 96.13, rank: 6 },
  { key: 'elo_sos', label: 'SOS', value: 1641.03, rank: 2 },
  { key: 'field_goal_percentage', label: 'FG%', value: 50.68, rank: 4 },
  { key: 'turnovers', label: 'TO', value: 11.43, rank: 239 },
];

/**
 * What stands out, as distance from the middle of the league.
 *
 * Both ends on purpose. The chart takes its rows from the top and the bottom of this list rather
 * than by absolute size, because a team that won the title has strengths and no weaknesses if you
 * sort by magnitude, and twelve full bars all saying "good" is not a finding.
 */
export const divergingBars: DivergingBar[] = [
  { key: 'adjusted_efficiency_rating', label: 'aEM', value: 0.995, detail: '32.89 · 2nd' },
  { key: 'blocks', label: 'BLK', value: 0.995, detail: '6 · 2nd' },
  { key: 'elo_sos', label: 'SOS', value: 0.995, detail: '1641.03 · 2nd' },
  { key: 'defensive_rebounds', label: 'DR', value: 0.989, detail: '27.5 · 3rd' },
  { key: 'field_goal_percentage', label: 'FG%', value: 0.984, detail: '50.68 · 4th' },
  { key: 'assists', label: 'AST', value: 0.978, detail: '18.57 · 5th' },
  { key: 'offensive_rating', label: 'ORtg', value: 0.973, detail: '120.79 · 6th' },
  { key: 'defensive_rating', label: 'DRtg', value: 0.973, detail: '96.13 · 6th' },
  { key: 'pace', label: 'Pace', value: 0.83, detail: '72.08 · 32nd' },
  { key: 'three_point_field_goal_percentage', label: '3FG%', value: 0.819, detail: '36.74 · 34th' },
  { key: 'free_throw_percentage', label: 'FT%', value: 0.505, detail: '74.75 · 91st' },
  { key: 'offensive_rebounds', label: 'OR', value: 0.28, detail: '9.38 · 132nd' },
  { key: 'turnovers', label: 'TO', value: -0.308, detail: '11.43 · 239th' },
  { key: 'steals', label: 'STL', value: -0.56, detail: '5.58 · 285th' },
];

/**
 * The two splits the team page draws, as win rates on one shared scale.
 *
 * The scale has to be shared or every gap looks the same size, which is the one thing this chart
 * exists to distinguish. The detail beside each row is the record itself.
 */
export const dumbbellRows: DumbbellRow[] = [
  { key: 'venue', label: 'Home / road', from: 93.3, to: 100, fromDetail: '14-1', toDetail: '11-0', tooltip: 'Win rate at home against win rate away from home.' },
  { key: 'competition', label: 'Conf. / non-conf.', from: 95, to: 90, fromDetail: '19-1', toDetail: '18-2', tooltip: 'Win rate inside the conference against everyone else.' },
];

/**
 * The season, one cell per game.
 *
 * The bar is how strong the opponent was and the mark underneath is what happened, kept apart
 * rather than layered - a colored letter on a colored background is two encodings fighting over
 * the same pixels, and the letter loses against the dark end of the ramp.
 *
 * A cell with no intensity is a game against an opponent the division does not rank. It draws
 * blank rather than pale, because "there is nothing to rate here" and "this opponent was weak"
 * must not look alike.
 */
export const sequenceCells: SequenceCell[] = [
  { key: 'g01', title: 'OAK', intensity: 0.484, mark: 'W', outcome: 'good', tooltip: 'Oakland (H) · won 121-78' },
  { key: 'g02', title: 'WAK', intensity: 0.808, mark: 'W', outcome: 'good', tooltip: 'Wake Forest (N) · won 85-84' },
  { key: 'g03', title: 'TCU', intensity: 0.896, mark: 'W', outcome: 'good', tooltip: 'TCU (A) · won 67-63' },
  { key: 'g04', title: 'MID', intensity: 0.53, mark: 'W', outcome: 'good', tooltip: 'Middle Tennessee (H) · won 86-61' },
  { key: 'g05', title: 'SAN', intensity: 0.879, mark: 'W', outcome: 'good', tooltip: 'San Diego St. (N) · won 94-54' },
  { key: 'g06', title: 'AUB', intensity: 0.89, mark: 'W', outcome: 'good', tooltip: 'Auburn (N) · won 102-72' },
  { key: 'g07', title: 'GON', intensity: 0.967, mark: 'W', outcome: 'good', tooltip: 'Gonzaga (N) · won 101-61' },
  { key: 'g08', title: 'RUT', intensity: 0.473, mark: 'W', outcome: 'good', tooltip: 'Rutgers (H) · won 101-60' },
  { key: 'g09', title: 'VIL', intensity: 0.901, mark: 'W', outcome: 'good', tooltip: 'Villanova (H) · won 89-61' },
  { key: 'g10', title: 'MAR', intensity: 0.451, mark: 'W', outcome: 'good', tooltip: 'Maryland (A) · won 101-83' },
  { key: 'g11', title: 'LAS', intensity: 0.283, mark: 'W', outcome: 'good', tooltip: 'La Salle (H) · won 102-50' },
  { key: 'g12', title: 'MCN', intensity: 0.868, mark: 'W', outcome: 'good', tooltip: 'McNeese St. (H) · won 112-71' },
  { key: 'g13', title: 'USC', intensity: 0.676, mark: 'W', outcome: 'good', tooltip: 'USC (H) · won 96-66' },
  { key: 'g14', title: 'PEN', intensity: 0.39, mark: 'W', outcome: 'good', tooltip: 'Penn St. (A) · won 74-72' },
  { key: 'g15', title: 'WIS', intensity: 0.931, mark: 'L', outcome: 'bad', tooltip: 'Wisconsin (H) · lost 88-91' },
  { key: 'g16', title: 'WAS', intensity: 0.742, mark: 'W', outcome: 'good', tooltip: 'Washington (A) · won 82-72' },
  { key: 'g17', title: 'ORE', intensity: 0.585, mark: 'W', outcome: 'good', tooltip: 'Oregon (A) · won 81-71' },
  { key: 'g18', title: 'IND', intensity: 0.843, mark: 'W', outcome: 'good', tooltip: 'Indiana (H) · won 86-72' },
  { key: 'g19', title: 'OHI', intensity: 0.904, mark: 'W', outcome: 'good', tooltip: 'Ohio St. (H) · won 74-62' },
  { key: 'g20', title: 'NEB', intensity: 0.953, mark: 'W', outcome: 'good', tooltip: 'Nebraska (H) · won 75-72' },
  { key: 'g21', title: 'MIC', intensity: 0.975, mark: 'W', outcome: 'good', tooltip: 'Michigan St. (A) · won 83-71' },
  { key: 'g22', title: 'PEN', intensity: 0.39, mark: 'W', outcome: 'good', tooltip: 'Penn St. (H) · won 110-69' },
  { key: 'g23', title: 'OHI', intensity: 0.904, mark: 'W', outcome: 'good', tooltip: 'Ohio St. (A) · won 82-61' },
  { key: 'g24', title: 'NOR', intensity: 0.764, mark: 'W', outcome: 'good', tooltip: 'Northwestern (A) · won 87-75' },
  { key: 'g25', title: 'UCL', intensity: 0.92, mark: 'W', outcome: 'good', tooltip: 'UCLA (H) · won 86-56' },
  { key: 'g26', title: 'PUR', intensity: 0.986, mark: 'W', outcome: 'good', tooltip: 'Purdue (A) · won 91-80' },
  { key: 'g27', title: 'DUK', intensity: 0.995, mark: 'L', outcome: 'bad', tooltip: 'Duke (N) · lost 63-68' },
  { key: 'g28', title: 'MIN', intensity: 0.662, mark: 'W', outcome: 'good', tooltip: 'Minnesota (H) · won 77-67' },
  { key: 'g29', title: 'ILL', intensity: 0.981, mark: 'W', outcome: 'good', tooltip: 'Illinois (A) · won 84-70' },
  { key: 'g30', title: 'IOW', intensity: 0.923, mark: 'W', outcome: 'good', tooltip: 'Iowa (A) · won 71-68' },
  { key: 'g31', title: 'MIC', intensity: 0.975, mark: 'W', outcome: 'good', tooltip: 'Michigan St. (H) · won 90-80' },
  { key: 'g32', title: 'OHI', intensity: 0.904, mark: 'W', outcome: 'good', tooltip: 'Ohio St. (N) · won 71-67' },
  { key: 'g33', title: 'WIS', intensity: 0.931, mark: 'W', outcome: 'good', tooltip: 'Wisconsin (N) · won 68-65' },
  { key: 'g34', title: 'PUR', intensity: 0.986, mark: 'L', outcome: 'bad', tooltip: 'Purdue (N) · lost 72-80' },
  { key: 'g35', title: 'HOW', intensity: 0.61, mark: 'W', outcome: 'good', tooltip: 'Howard (N) · won 101-80' },
  { key: 'g36', title: 'SAI', intensity: 0.929, mark: 'W', outcome: 'good', tooltip: 'Saint Louis (N) · won 95-72' },
  { key: 'g37', title: 'ALA', intensity: 0.964, mark: 'W', outcome: 'good', tooltip: 'Alabama (N) · won 90-77' },
  { key: 'g38', title: 'TEN', intensity: 0.956, mark: 'W', outcome: 'good', tooltip: 'Tennessee (N) · won 95-62' },
  { key: 'g39', title: 'ARI', intensity: 0.997, mark: 'W', outcome: 'good', tooltip: 'Arizona (N) · won 91-73' },
  { key: 'g40', title: 'CON', intensity: 0.989, mark: 'W', outcome: 'good', tooltip: 'Connecticut (N) · won 69-63' },
];

/**
 * The season's confidence bands, read as claimed against actual.
 *
 * Real numbers, across every game the model called that season - 6299 of them. Each band is
 * tested at its midpoint, which is what it claims on average, and a mark is sized by the number of
 * games behind it: area rather than radius, so a band with ten times the sample does not look a
 * hundred times as heavy. This is the only claim on the page a reader can check for themselves,
 * which is exactly why it is drawn rather than asserted.
 */
export const calibrationPoints: CalibrationPoint[] = [
  { key: '50', predicted: 55, observed: 57, total: 1803, correct: 1027, label: '50-60%' },
  { key: '60', predicted: 65, observed: 65.1, total: 1447, correct: 942, label: '60-70%' },
  { key: '70', predicted: 75, observed: 75.2, total: 1209, correct: 909, label: '70-80%' },
  { key: '80', predicted: 85, observed: 84.2, total: 740, correct: 623, label: '80-90%' },
  { key: '90', predicted: 95, observed: 97, total: 1093, correct: 1060, label: '90-100%' },
];

/** The player the profile below belongs to. */
export const radarPlayer = 'Aday Mara';

/**
 * A real player's shape, as percentiles among every ranked player in the division.
 *
 * Every measure here is one where the ranking runs best-first, because that is all a percentile
 * knows how to read. The profile is a lopsided one, which is the point: an all-rounder draws a
 * circle, and a circle tells a reader nothing about what a radar is for.
 *
 * The rank is the figure the endpoint returns and the percentile is derived from it against
 * RANKED_PLAYERS, the same arithmetic the player page does - so the shape and the ordinal beside
 * it cannot drift apart.
 */
export const radarSpokes: RadarSpoke[] = [
  { key: 'points_per_game', label: 'PTS', percentile: 86.6, rank: 755, detail: '12.1' },
  { key: 'true_shooting_percentage', label: 'TS%', percentile: 95.4, rank: 262, detail: '66.74' },
  { key: 'assist_percentage', label: 'AST%', percentile: 86.1, rank: 783, detail: '18.98' },
  { key: 'total_rebound_percentage', label: 'REB%', percentile: 94.1, rank: 335, detail: '17.86' },
  { key: 'steal_percentage', label: 'STL%', percentile: 28.8, rank: 4013, detail: '0.83' },
  { key: 'block_percentage', label: 'BLK%', percentile: 99.2, rank: 45, detail: '11.95' },
];
