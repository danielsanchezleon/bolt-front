import { DimensionValuesMetricRequest } from "./DimensionValuesMetricRequest";
import { DimensionValuesAgroupationRequest } from "./DimensionValuesAgroupationRequest";

export class DimensionValuesRequest {
    
    metrics: DimensionValuesMetricRequest[];
    dimensions: DimensionValuesAgroupationRequest[];

    constructor(metrics: DimensionValuesMetricRequest[], dimensions: DimensionValuesAgroupationRequest[]) {
        this.metrics = metrics;
        this.dimensions = dimensions;
    }
}