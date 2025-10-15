export class FilterLogDto 
{
  constructor(
    public id: number | null,
    public externalOperation: string,
    public field: string,
    public operation: string,
    public value: string
  ) {}
}