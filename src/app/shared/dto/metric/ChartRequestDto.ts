import { ChartDimensionDto } from "./ChartDimensionDto";
import { ChartIndicatorDto } from "./ChartIndicatorDto";

export class ChartRequestDto
{
    hours: number;
    evaluationPeriod: string;
    dimensions: ChartDimensionDto[];
    indicators: ChartIndicatorDto[];

    constructor (hours: number, evaluationPeriod: string, dimensions: ChartDimensionDto[], indicators: ChartIndicatorDto[])
    {
        this.hours = hours;
        this.evaluationPeriod = evaluationPeriod;
        this.dimensions = dimensions;
        this.indicators = indicators;
    }
}