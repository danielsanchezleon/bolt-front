export class BaselineDimensionValuesResponse
{
    dimension: string;
    valueList: string[];

    constructor(dimension: string, valueList: string[])
    {
        this.dimension = dimension;
        this.valueList = valueList;
    }
}
