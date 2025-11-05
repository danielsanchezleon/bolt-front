export class ChartDimensionDto
{
    dimension: string;
    filters: string[];

    constructor(dimension: string, filters: string[])
    {
        this.dimension = dimension;
        this.filters = filters;
    }
}