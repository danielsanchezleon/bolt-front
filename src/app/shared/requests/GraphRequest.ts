import { AlertIndicatorDto } from "../dto/AlertIndicatorDto";

export class GraphRequest
{
    timeRangeInHours: number;
    groupBy: string[];
    alertIndicators: AlertIndicatorDto[];
    filters: Map<string, string[]> = new Map<string, string[]>();

    constructor (timeRangeInHours: number, groupBy: string[], alertIndicators: AlertIndicatorDto[], filters: Map<string, string[]>)
    {
        this.timeRangeInHours = timeRangeInHours;
        this.groupBy = groupBy;
        this.alertIndicators = alertIndicators;
        this.filters = filters;
    }
}