// import { Game as GameType } from '@/types/general';

import Team from './Team';
import Organization from './Organization';
import { Bookmakers } from '@/types/general';
import { Color, Dates } from '@esmalley/ts-utils';
import { useTheme } from '@esmalley/react-material-ui';


/**
 * This class helps simplify the Game logic
 */
class Game {
  constructor({ game }) {
    this.game = game;
  }

  private game;

  getGame() {
    return this.game;
  }

  /**
   * Is the game in progress?
   */
  isInProgress(): boolean {
    return (this.getGame().status !== 'pre' && this.getGame().status !== 'final' && this.getGame().status !== 'postponed' && this.getGame().status !== 'cancelled');
  }

  /**
   * Is the game final?
   */
  isFinal(): boolean {
    return (this.getGame().status === 'final');
  }

  /**
   * Is the game played on a neutral court?
   */
  isNeutralSite(): boolean {
    return (+this.getGame().neutral_site === 1);
  }

  isPreSeason(): boolean {
    return (this.getGame().game_type_terminology_id === '068b22b0-5623-11f1-8ce7-46e166b0a263');
  }

  /**
   * Get the friendly formatted start date of the game
   */
  getStartDate(opt_format: string | null | undefined): string {
    return Dates.format(Dates.parse(this.getGame().start_datetime, true), opt_format || 'M jS');
  }

  /**
   * Get the start time or status or time remaining in game
   */
  getTime(): string {
    let startTime = 'Unknown';
    if (this.isFinal()) {
      startTime = 'Final';
    } else if (this.isInProgress()) {
      startTime = this.getGameTime();
    } else if (this.getGame().status === 'pre') {
      startTime = this.getStartTime();
    } else if (this.getGame().status === 'postponed') {
      startTime = 'Postponed';
    } else if (this.getGame().status === 'cancelled') {
      startTime = 'Cancelled';
    }

    return startTime;
  }

  /**
   * Get the start time of a game
   */
  getStartTime(): string {
    const date = new Date(this.getGame().start_timestamp * 1000);
    let startTime = `${((date.getHours() % 12) || 12) + (date.getMinutes() ? `:${date.getMinutes().toString().length === 1 ? '0' : ''}${date.getMinutes()}` : '')} ${date.getHours() < 12 ? 'am' : 'pm'} `;
    if (date.getHours() >= 2 && date.getHours() <= 6) {
      startTime = 'TBA';
    }

    return startTime;
  }

  /**
   * Get the time remaining in game
   */
  getGameTime(): string {
    const period = this.getGame().current_period;
    if (
      (this.getGame().clock === '00:00' || this.getGame().clock === '00:00.00') &&
      period &&
      (
        (Organization.getCBBID() === this.getGame().organization_id && period.toUpperCase() === '2ND') ||
        (Organization.getCFBID() === this.getGame().organization_id && period.toUpperCase() === '4TH')
      ) &&
      this.getGame().home_score !== this.getGame().away_score
    ) {
      return 'Finalizing game...';
    }

    if (
      (
        (this.getGame().clock === '00:00' || this.getGame().clock === '00:00.00') &&
        period &&
        (
          (Organization.getCBBID() === this.getGame().organization_id && period.toUpperCase() === '1ST')
        ) &&
        +this.getGame().home_score !== 0 &&
        +this.getGame().away_score !== 0
      ) ||
      (
        this.getGame().clock === '20:00' &&
        period &&
        (
          (Organization.getCBBID() === this.getGame().organization_id && period.toUpperCase() === '2ND')
        ) &&
        +this.getGame().home_score !== 0 &&
        +this.getGame().away_score !== 0
      )
    ) {
      return 'Half';
    }

    let text = '';

    if (this.getGame().clock) {
      text += this.getGame().clock;
    }

    if (period) {
      text += (text.length ? ' ' : '') + period;
    }

    if (!text) {
      return 'Live';
    }

    return text;
  }

  /**
   * Get the network of the game
   */
  getNetwork(): string | null {
    if (this.getGame().network) {
      return this.getGame().network;
    }
    return null;
  }

  /**
   * Return the number to display next to a team
   * Ex: 1 Purdue
   * @param  {string} side            home or away
   * @param  {string} rankDisplay     the column to display
   */
  getTeamRank(side: string, rankDisplay: string): number | null {
    if (
      rankDisplay &&
      this.getGame() &&
      this.getGame()[`${side}_team_id`] &&
      this.getGame().teams &&
      this.getGame()[`${side}_team_id`] in this.getGame().teams &&
      this.getGame().teams[this.getGame()[`${side}_team_id`]].ranking &&
      this.getGame().teams[this.getGame()[`${side}_team_id`]].ranking[rankDisplay]
    ) {
      return this.getGame().teams[this.getGame()[`${side}_team_id`]].ranking[rankDisplay];
    }
    return null;
  }

  /**
   * Get the team name
   * @param  {string} side home or away
   */
  getTeamName(side: string): string {
    let name = 'Unknown';
    if (
      this.getGame() &&
      this.getGame()[`${side}_team_id`] &&
      this.getGame().teams &&
      this.getGame()[`${side}_team_id`] in this.getGame().teams
    ) {
      const team = this.getGame().teams[this.getGame()[`${side}_team_id`]];
      name = new Team({ team }).getName();
    }

    return name;
  }

  /**
   * Get the team short
   * @param  {string} side home or away
   */
  getTeamNameShort(side: string): string {
    let name = 'UNK';
    if (
      this.getGame() &&
      this.getGame()[`${side}_team_id`] &&
      this.getGame().teams &&
      this.getGame()[`${side}_team_id`] in this.getGame().teams
    ) {
      const team = this.getGame().teams[this.getGame()[`${side}_team_id`]];
      name = new Team({ team }).getNameShort();
    }

    return name;
  }

  /**
   * Get the teams conference name
   * @param {string} side
   */
  getTeamConference(side: string, conferences): string {
    let name = 'Unknown';
    if (
      this.getGame() &&
      this.getGame()[`${side}_team_id`] &&
      this.getGame().teams &&
      this.getGame()[`${side}_team_id`] in this.getGame().teams
    ) {
      const team = this.getGame().teams[this.getGame()[`${side}_team_id`]];
      name = new Team({ team }).getConference(conferences);
    }

    return name;
  }

  /**
   * Get the teams short conference name
   * This doesnt really work with BIG TEN vs BIG EAST, ETC... probably need to curate the list myself
   * @param {string} side
   * @return {string}
   */
  // getTeamConferenceShort(side) {
  //   let name = 'UNK';
  //   if (
  //     this.getGame() &&
  //     this.getGame()[side + '_team_id'] &&
  //     this.getGame().teams &&
  //     this.getGame()[side + '_team_id'] in this.getGame().teams
  //   ) {
  //     const team = this.getGame().teams[this.getGame()[side + '_team_id']];
  //     name = new Team({'team': team}).getConferenceShort();
  //   }

  //   return name;
  // }


  /**
   * Get the bookmakers lines object
   */
  getBookMakers(): Bookmakers | null {
    if (
      this.getGame().odds &&
      this.getGame().odds.live &&
      this.getGame().odds.live.json_bookmakers
    ) {
      return this.getGame().odds.live.json_bookmakers;
    }

    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      this.getGame().odds.pre.json_bookmakers
    ) {
      return this.getGame().odds.pre.json_bookmakers;
    }

    return null;
  }


  /**
   * Get the pre-game money line odds
   * @param  {string} side home or away
   */
  getPreML(side: string): string {
    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      this.getGame().odds.pre[`money_line_${side}`]
    ) {
      return this.getGame().odds.pre[`money_line_${side}`];
    }

    return '-';
  }

  /**
   * Get the pre-game spread odds
   * @param  {string} side home or away
   * @return {string}
   */
  getPreSpread(side) {
    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      this.getGame().odds.pre[`spread_${side}`]
    ) {
      return this.getGame().odds.pre[`spread_${side}`];
    }

    return '-';
  }

  /**
   * Get the pre-game over odds
   * @return {string}
   */
  getPreOver() {
    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      this.getGame().odds.pre.over
    ) {
      return this.getGame().odds.pre.over;
    }

    return '-';
  }

  /**
   * Get the pre-game under odds
   * @return {string}
   */
  getPreUnder() {
    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      this.getGame().odds.pre.under
    ) {
      return this.getGame().odds.pre.under;
    }

    return '-';
  }

  /**
   * Get the live money line odds
   * @param  {string} side home or away
   * @return {string}
   */
  getLiveML(side) {
    if (
      this.isInProgress() &&
      this.getGame().odds &&
      this.getGame().odds.live &&
      this.getGame().odds.live[`money_line_${side}`] &&
      this.getGame().odds.live[`money_line_${side}`] > -9000
    ) {
      return this.getGame().odds.live[`money_line_${side}`];
    }

    return '-';
  }

  /**
   * Get the live spread odds
   * @param  {string} side home or away
   * @return {string}
   */
  getLiveSpread(side) {
    if (
      this.isInProgress() &&
      this.getGame().odds &&
      this.getGame().odds.live &&
      this.getGame().odds.live[`spread_${side}`]
    ) {
      return this.getGame().odds.live[`spread_${side}`];
    }

    return '-';
  }

  /**
   * Get the live over odds
   * @return {string}
   */
  getLiveOver() {
    if (
      this.isInProgress() &&
      this.getGame().odds &&
      this.getGame().odds.live &&
      this.getGame().odds.live.over
    ) {
      return this.getGame().odds.live.over;
    }

    return '-';
  }

  /**
   * Get the live under odds
   * @return {string}
   */
  getLiveUnder() {
    if (
      this.isInProgress() &&
      this.getGame().odds &&
      this.getGame().odds.live &&
      this.getGame().odds.live.under
    ) {
      return this.getGame().odds.live.under;
    }

    return '-';
  }

  won(side) {
    const otherSide = (side === 'away' ? 'home' : 'away');
    if (
      this.isFinal() &&
      this.game[`${side}_score`] > this.game[`${otherSide}_score`]
    ) {
      return true;
    }

    return false;
  }

  coveredSpread(side) {
    const otherSide = (side === 'away' ? 'home' : 'away');
    const spread = this.getPreSpread(side);
    if (
      this.isFinal() &&
      (this.game[`${side}_score`] - this.game[`${otherSide}_score`]) > (spread * -1)
    ) {
      return true;
    }

    return false;
  }

  coveredOver() {
    const over = this.getPreOver();
    if (
      this.isFinal() &&
      (this.getGame().home_score + this.getGame().away_score) > over
    ) {
      return true;
    }

    return false;
  }

  coveredUnder() {
    const under = this.getPreUnder();
    if (
      this.isFinal() &&
      (this.getGame().home_score + this.getGame().away_score) < under
    ) {
      return true;
    }

    return false;
  }

  /**
   * Have the odds reversed since pre-game?
   * @param  {string} side home or away
   * @return {boolean}
   */
  oddsReversal(side) {
    let pre = 0;
    let live = 0;
    if (
      this.getGame().odds &&
      this.getGame().odds.pre &&
      (pre = +this.getGame().odds.pre[`money_line_${side}`]) &&
      this.isInProgress() &&
      this.getGame().odds &&
      this.getGame().odds.live &&
      (live = +this.getGame().odds.live[`money_line_${side}`]) &&
      (pre < 0 && live > 0 && live > 100)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get the homeColor and awayColor for a game
   * @return {object} {homeColor: string, awayColor: string}
   */
  getColors() {
    // todo probably shouldnt have hooks in here
    const theme = useTheme();

    const { game } = this;

    let homeColor = game.teams[game.home_team_id].primary_color || theme.info.main;
    let awayColor = game.teams[game.away_team_id].primary_color === homeColor ? theme.info.main : game.teams[game.away_team_id].primary_color;

    if (!homeColor) {
      homeColor = theme.info.main;
    }

    if (!awayColor) {
      awayColor = theme.info.main;
    }

    if (Color.areColorsSimilar(homeColor, awayColor)) {
      const analogousColors = Color.getAnalogousColors(awayColor);
      let any = false;

      for (let i = 0; i < analogousColors.length; i++) {
        if (!Color.areColorsSimilar(homeColor, analogousColors[i])) {
          awayColor = analogousColors[i];
          any = true;
          break;
        }
      }

      if (!any) {
        awayColor = Color.invertColor(awayColor);
      }
    }

    return { homeColor, awayColor };
  }
}

export default Game;
