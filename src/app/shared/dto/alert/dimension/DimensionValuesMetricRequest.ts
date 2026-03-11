export class DimensionValuesMetricRequest
{
    dataBase: string;
    tableName: string;
    metricName: string;

    constructor(dataBase: string, tableName: string, metricName: string) {
        this.dataBase = dataBase;
        this.tableName = tableName;
        this.metricName = metricName;
    }
}