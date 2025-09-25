export class AlertMetricViewDto {
  metricId?: number | null;
  dbName?: string;
  tableName?: string;
  metricName?: string;
  operation?: string;
  order?: number;
}