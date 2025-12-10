export class DimensionValuesRequest
{
    baselineType: string;
    id: number
    selectedDimensions: string[];

    constructor(baselineType: string, id: number, selectedDimensions: string[])
    {
        this.baselineType = baselineType;
        this.id = id;
        this.selectedDimensions = selectedDimensions;
    }
}