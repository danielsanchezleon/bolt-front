import { SelectedDimensionDto } from "./SelectedDimensionDto";
import { FilterOcurrencesDto } from "./FilterOcurrencesDto";

export class DistinctValuesRequest
{
    constructor(
        public selectedDimensions: SelectedDimensionDto[] | null,
        public filterParameters: FilterOcurrencesDto[] | null
    ) {}
}