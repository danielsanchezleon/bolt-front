export class AlertClauseViewDto {
  id?: number | null;
  indicatorName?: string;
  startBrackets?: string | null;
  compOperation?: string;
  threshold?: number | null;
  endBrackets?: string | null;
  order?: number;
  externalOperation?: string | null;
  thresholdInclude?: boolean | null;
  thresholdUp?: number | null;
  thresholdIncludeUp?: boolean | null;

  constructor(id: number | null, indicatorName: string, startBrackets: string | null, compOperation: string, threshold: number | null, endBrackets: string | null, order: number, externalOperation: string | null, thresholdInclude: boolean | null, thresholdUp: number | null, thresholdIncludeUp: boolean | null)
  {
    this.id = id;
    this.indicatorName = indicatorName;
    this.startBrackets = startBrackets;
    this.compOperation = compOperation;
    this.threshold = threshold;
    this.endBrackets = endBrackets;
    this.order = order;
    this.externalOperation = externalOperation;
    this.thresholdInclude = thresholdInclude;
    this.thresholdUp = thresholdUp;
    this.thresholdIncludeUp = thresholdIncludeUp;
  }
}