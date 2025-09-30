export class TableSelection 
{
  enabled: boolean;
  mode: 'single' | 'multiple';
  showSelectAll: boolean;

  constructor(enabled: boolean, mode: 'single' | 'multiple', showSelectAll: boolean = false) 
  {
    this.enabled = enabled;
    this.mode = mode;
    this.showSelectAll = showSelectAll;
  }
}