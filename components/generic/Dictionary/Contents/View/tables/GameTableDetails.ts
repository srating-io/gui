import { BaseTableDetails } from './BaseTableDetails';
import { SectionConfig } from './types';

export class GameTableDetails extends BaseTableDetails {
  public override getSections(): SectionConfig[] {
    return [
      {
        title: 'Basic Info',
        fields: ['season', 'status', 'start_date', 'start_datetime', 'start_timestamp', 'network', 'attendance', 'neutral_site', 'is_conf_game', 'boxscore'],
      },
      {
        title: 'Scores & Timing',
        fields: ['away_team_id', 'home_team_id', 'away_score', 'home_score', 'current_period', 'clock', 'clock_last_updated_at'],
      },
      {
        title: 'Organization',
        fields: ['organization_id', 'division_id', 'game_type_terminology_id'],
      },
      {
        title: 'System',
        fields: ['guid'],
      },
    ];
  }
}
