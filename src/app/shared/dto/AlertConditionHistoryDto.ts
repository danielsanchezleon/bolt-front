export class AlertConditionHistoryDto 
{
  constructor(
    public versionNumber: number,
    public operation: string,
    public state: string,
    public errorDetail: string,
    public date: string,
    public user: string,
    public retries: number,
    public configurationData: Record<string, any>
  ) {}
}