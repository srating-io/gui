

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
   * Get the team name: the short display name ("Purdue", "Arizona St."), else the full one.
   * Never `code`, which is an abbreviation.
   */
  getName(): string {
    if (!this.getTeam()) {
      return 'Unknown';
    }
    if (this.getTeam().name_short) {
      return this.getTeam().name_short;
    }
    if (this.getTeam().name) {
      return this.getTeam().name;
    }

    return this.getTeam().team_id || 'Unknown';
  }


  /**
   * Get the team's short code. A curated `code` (PUR, NU, ILST) is printed as is; without one, the
   * first three letters of the ncaa code or the name, with spaces dropped so "W GA" is never "W G".
   */
  getNameShort(): string {
    const team = this.getTeam();

    if (!team) {
      return 'UNK';
    }

    // only an abbreviation shaped code is curated; anything longer is a leftover name
    if (team.code && /^[A-Z0-9&'.-]{2,5}$/.test(team.code)) {
      return team.code;
    }

    const name = team.char6 || team.name_short || team.name || 'Unknown';

    return String(name).replace(/\s+/g, '').toUpperCase().substring(0, 3);
  }

  /**
   * Get the conference name
   */
  /**
   * `fallback` is the code resolved on the server, for the render where the dictionary is still
   * empty. Without it this answered 'Unknown', which is what a crawler then read.
   */
  getConference(conferences, fallback?: string): string {
    let name = fallback || 'Unknown';

    const conference = conferences && conferences[this.getTeam().conference_id];

    if (conference && conference.code) {
      name = conference.code;
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
