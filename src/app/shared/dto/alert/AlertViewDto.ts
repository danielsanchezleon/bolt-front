import { EndpointViewDto } from "../endpoint/EndpointViewDto";
import { AlertConditionViewDto } from "./AlertConditionViewDto";
import { AlertIndicatorViewDto } from "./AlertIndicatorViewDto";
import { PermissionViewDto } from "./PermissionViewDto";
import { SilencePeriodViewDto } from "./SilencePeriodBiewDto";
import { TagViewDto } from "./TagViewDto";

export class AlertViewDto {
  alertId?: number;
  internalName?: string;
  name?: string;
  alertText?: string;
  alertDetail?: string;
  opiUrl?: string;
  alertType?: string;
  evaluationFrequency?: string;
  evaluationPeriod?: string;
  createdAt?: Date;
  offset!: number;
  alarmNumPeriods!: number;
  alarmTotalPeriods!: number;
  recoveryNumPeriods!: number;
  recoveryTotalPeriods!: number;
  status?: string;
  logsService?: string;
  logsCatalog?: string;
  baselineType?: string;
  groupBy?: string[];
  alertTags?: TagViewDto[];
  conditions?: AlertConditionViewDto[];
  indicators?: AlertIndicatorViewDto[];
  silencePeriods?: SilencePeriodViewDto[];
  endpoints?: EndpointViewDto[];
  permissions?: PermissionViewDto[];
}