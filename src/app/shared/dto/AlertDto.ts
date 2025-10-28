import { AlertConditionDto } from "./AlertConditionDto";
import { AlertConditionHistoryDto } from "./AlertConditionHistoryDto";
import { ConditionFilterDto } from "./ConditionFilterDto";
import { AlertIndicatorDto } from "./AlertIndicatorDto";
import { AlertPermissionDto } from "./AlertPermissionDto";
import { AlertSilenceDto } from "./AlertSilenceDto";
import { EndpointAlertDto } from "./EndpointAlertDto";

export class AlertDto 
{
  public alertConditions?: AlertConditionDto[];
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
    public opiUrl: string | null,
    public alarmNumPeriods: number,
    public alarmTotalPeriods: number,
    public recoveryNumPeriods: number,
    public recoveryTotalPeriods: number,
    public logsService: string | null,
    public logsCatalog: string | null,
  ) {}
}