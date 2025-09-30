export class TableAction 
{
  key: string;
  label: string;
  icon?: string | null;
  level?: 'primary' | 'warn' | 'neutral' | null;
  confirm: boolean;
  meta?: Record<string, any> | null;

  constructor(
    key: string,
    label: string,
    icon?: string | null,
    level?: 'primary' | 'warn' | 'neutral' | null,
    confirm: boolean = false,
    meta?: Record<string, any> | null
  ) 
  {
    this.key = key;
    this.label = label;
    this.icon = icon ?? null;
    this.level = level ?? null;
    this.confirm = confirm;
    this.meta = meta ?? null;
  }
}
