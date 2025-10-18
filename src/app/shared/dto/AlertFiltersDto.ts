export class AlertFiltersDto
{
    constructor(
        public id: number | null,
        public comparation: string,
        public externalOperation: string,
        public filterField: string,
        public filterValue: string
    ) {}
}