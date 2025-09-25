export class AlertSilenceDto {
  constructor(
    public id: number | null,
    public weekday: number,
    public startTime: string,
    public endTime: string
  ) {}
}