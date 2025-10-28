export class ConditionFilterDto
{
    constructor(
        public id: number | null,
        public externalOperation: string | null,
        public compOperation: string,
        public filterField: string,
        public filterValue: string
    ) {}
}