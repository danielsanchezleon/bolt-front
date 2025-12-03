import { AlertIndicatorDto } from "../dto/AlertIndicatorDto";

export class GraphRequest
{
    timeRangeInHours: number;
    groupBy: string[];
    alertIndicators: AlertIndicatorDto[];

    constructor (timeRangeInHours: number, groupBy: string[], alertIndicators: AlertIndicatorDto[])
    {
        this.timeRangeInHours = timeRangeInHours;
        this.groupBy = groupBy;
        this.alertIndicators = alertIndicators;
    }
}