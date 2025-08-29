export class AlertClauseViewDto {
  startBrackets?: string | null;
  compOperation?: string;
  threshold?: number | null;
  endBrackets?: string | null;
  order?: number;
  externalOperation?: string | null;

  constructor(startBrackets: string | null, compOperation: string, threshold: number | null, endBrackets: string | null, order: number, externalOperation: string | null)
  {
    this.startBrackets = startBrackets;
    this.compOperation = compOperation;
    this.threshold = threshold;
    this.endBrackets = endBrackets;
    this.order = order;
    this.externalOperation = externalOperation;
  }
}