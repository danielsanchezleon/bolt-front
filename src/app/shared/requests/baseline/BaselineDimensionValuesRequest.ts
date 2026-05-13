export class BaselineDimensionValuesRequest
{
    baselineTable: string;
    dimensionList: string[];

    constructor(baselineTable: string, dimensionList: string[])
    {
        this.baselineTable = baselineTable;
        this.dimensionList = dimensionList;
    }
}
