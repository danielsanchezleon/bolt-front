export class MetricDataDto {
  constructor(
    public table: string,
    public metric: string,
    public operation: string
  ) {}
}
