export interface AlertConditionHistoryDto 
{
  versionNumber: number;
  operation: string;
  state: string;
  errorDetail: string;
  date: string; // ISO date string
  user: string;
  retries: number;
  configurationData: Record<string, any>;
}