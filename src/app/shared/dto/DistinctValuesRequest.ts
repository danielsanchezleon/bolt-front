import { SelectedDimensionDto } from "./SelectedDimensionDto";

export class DistinctValuesRequest
{
    constructor(
        public selectedDimensionDto: SelectedDimensionDto[]
    ) {}
}