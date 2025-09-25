import { AlertConditionDto } from "./AlertConditionDto";
import { AlertConditionHistoryDto } from "./AlertConditionHistoryDto";
import { AlertIndicatorDto } from "./AlertIndicatorDto";
import { AlertPermissionDto } from "./AlertPermissionDto";
import { AlertSilenceDto } from "./AlertSilenceDto";
import { EndpointAlertDto } from "./EndpointAlertDto";
import { FilterLogDto } from "./FilterLogDto";

export class AlertDto 
{
  public alertConditions?: AlertConditionDto[];
  public filterLogs?: FilterLogDto[];
  public alertIndicators?: AlertIndicatorDto[];
  public alertSilences?: AlertSilenceDto[];
  public alertConditionHistories?: AlertConditionHistoryDto[];
  public endpointAlerts?: EndpointAlertDto[];
  public alertPermissions?: AlertPermissionDto[];

  constructor(
    public internalName: string,
    public name: string,
    public alertText: string,
    public alertDetail: string,
    public alertTags: any[],
    public evaluationFrequency: string,
    public evaluationPeriod: string,
    public alertType: number,
    public offset: number,
    public groupBy: string[],
    public matOperation: string,
    public opiUrl: string | null,
    public alarmNumPeriods: number,
    public alarmTotalPeriods: number,
    public recoveryNumPeriods: number,
    public recoveryTotalPeriods: number,
  ) {}
}