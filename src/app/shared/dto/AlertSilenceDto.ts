export class AlertSilenceDto {
  constructor(
    public weekday: number,
    public startTime: string,
    public endTime: string
  ) {}
}