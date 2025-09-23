export class AlertPermissionDto 
{
  constructor(
    public id: number | null,
    public writePermission: boolean,
    public teamId: number
  ) {}
}