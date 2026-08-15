

class Team {
  constructor({ team }) {
    this.team = team;
  }

  private team;

  /**
   * Get the team
   */
  getTeam() {
    return this.team;
  }


  /**
   * Get the team name
   */
  getName(): string {
    if (!this.getTeam()) {
      return 'Unknown';
    }
    if (this.getTeam().code) {
      return this.getTeam().code;
    }
    if (this.getTeam().alt_name) {
      return this.getTeam().alt_name;
    }
    if (this.getTeam().name) {
      return this.getTeam().name;
    }

    return this.getTeam().team_id || 'Unknown';
  }


  /**
   * Get the team name short
   */
  getNameShort(): string {
    let name = 'Unknown';

    if (this.getTeam().char6) {
      name = this.getTeam().char6;
    } else if (this.getTeam().code) {
      name = this.getTeam().code;
    } else if (this.getTeam().alt_name) {
      name = this.getTeam().alt_name;
    } else if (this.getTeam().name) {
      name = this.getTeam().name;
    }

    return name.toUpperCase().substring(0, 3);
  }

  /**
   * Get the conference name
   */
  getConference(conferences): string {
    let name = 'Unknown';

    if (this.getTeam().conference_id) {
      name = conferences[this.getTeam().conference_id].code;
    }

    return name;
  }

  // This doesnt really work with BIG TEN vs BIG EAST, ETC... probably need to curate the list myself
  // getConferenceShort() {
  //   let name = 'UNK';

  //   if (this.getTeam().conference) {
  //     name = this.getTeam().conference;
  //   }

  //   return name.toUpperCase().substring(0,3);
  // };

  // todo this all needs cleaned and normalized and fixed
  getLastRanking() {
    let last = null;
    if (
      this.team &&
      this.getTeam().ranking
    ) {
      last = this.getTeam().ranking;
    } else if (
      this.team &&
      this.getTeam().rankings
    ) {
      last = this.getTeam().rankings;
    } else if (
      this.team &&
      this.getTeam().stats
    ) {
      last = this.getTeam().stats;
    }
    return last;
  }

  getRank(opt_rankDisplay) {
    let rankDisplay = opt_rankDisplay || 'rank';

    // legacy
    if (rankDisplay === 'composite_rank') {
      rankDisplay = 'rank';
    }

    const lastRanking = this.getLastRanking();

    if (
      lastRanking &&
      lastRanking[rankDisplay]
    ) {
      return lastRanking[rankDisplay];
    }
    return null;
  }

  getPrimaryColor() {
    if (
      this.getTeam().primary_color
    ) {
      return this.getTeam().primary_color;
    }

    console.warn('team missing primary color');
    return '#9c27b0';
  }
}

export default Team;
