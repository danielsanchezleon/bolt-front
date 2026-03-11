export class DimensionValuesResponse 
{
    dimension: string;
    values: string[];

    constructor(dimension: string, values: string[]) {
        this.dimension = dimension;
        this.values = values;
    }
}