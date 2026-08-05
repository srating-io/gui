import { General } from '@srating-io/types';



class Player {
  constructor({ player }) {
    this.player = player;
  }

  private player;

  /**
   * Get the player
   */
  getPlayer(): General.Player {
    return this.player;
  }


  /**
   * Get the player name
   */
  getName(): string {
    if (!this.getPlayer()) {
      return 'Unknown';
    }

    const player = this.getPlayer();

    return `${player.first_name} ${player.last_name}`;
  }


  /**
   * Get the player name short
   */
  getNameShort(): string {
    if (!this.getPlayer()) {
      return 'UNK';
    }

    const player = this.getPlayer();

    return `${player.first_name.charAt(0)}. ${player.last_name}`;
  }
}

export default Player;
