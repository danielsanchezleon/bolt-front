export class AlertClauseDto 
{
  constructor(
    public startBrackets: number | null,
    public compOperation: number,
    public threshold: number,
    public endBrackets: number | null,
    public order: number | null,
    public externalOperation: number | null,
  ) {}
}