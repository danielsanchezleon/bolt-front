export class MetricDataSetDto {
  label: string;
  fill: boolean;
  color: string;
  yAxisId: string;
  tension: number;
  data: any[];

  constructor(
    label: string,
    fill: boolean,
    color: string,
    yAxisId: string,
    tension: number,
    data: any[]
  ) {
    this.label = label;
    this.fill = fill;
    this.color = color;
    this.yAxisId = yAxisId;
    this.tension = tension;
    this.data = data;
  }
}