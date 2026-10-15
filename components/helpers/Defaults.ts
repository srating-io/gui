import { CURRENT_SEASON, ORGANIZATION_ID } from '@srating-io/common';

// Why is it doing this? Beacuse of circular references due to imports
// A Client was running import Organization, which imports the store, which imports the organization-slice, which imports the Organization + runs initalization code which used Organization before the import finished, causing circular loop

// The seasons come from @srating-io/common so a rollover is one edit there, not one per repo
export const DEFAULT_CFB_SEASON = CURRENT_SEASON[ORGANIZATION_ID.CFB];
export const DEFAULT_CBB_SEASON = CURRENT_SEASON[ORGANIZATION_ID.CBB];
export const DEFAULT_NBA_SEASON = CURRENT_SEASON[ORGANIZATION_ID.NBA];
export const DEFAULT_CFB_ID = 'f1dedce6-3b4c-11ef-94bc-2a93761010b8';
export const DEFAULT_CBB_ID = 'f1c37c98-3b4c-11ef-94bc-2a93761010b8';
export const DEFAULT_NBA_ID = 'd36a29dc-5453-11f1-8ce7-46e166b0a263';
export const DEFAULT_ORGANIZATION_ID = DEFAULT_CFB_ID;
export const DEFAULT_FBS_DIVISION_ID = 'bf258a3f-3b4a-11ef-94bc-2a93761010b8';
export const DEFAULT_FCS_DIVISION_ID = 'bf4a4dac-3b4a-11ef-94bc-2a93761010b8';
export const DEFAULT_D1_DIVISION_ID = 'bf602dc4-3b4a-11ef-94bc-2a93761010b8';
export const DEFAULT_D2_DIVISION_ID = 'bf891a3f-3b4a-11ef-94bc-2a93761010b8';
export const DEFAULT_D3_DIVISION_ID = 'bf9ea506-3b4a-11ef-94bc-2a93761010b8';
export const DEFAULT_NBA_DIVISION_ID = 'b5cbe40e-5454-11f1-8ce7-46e166b0a263';

