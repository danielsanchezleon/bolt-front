export class FilterOcurrencesDto {
    constructor(
        public field: string,
        public operator: string, //'GREATER_THAN', 'LIKE'
        public value: string,
        public logicalOperator: string | null //'AND', 'OR'
    ) {}
}