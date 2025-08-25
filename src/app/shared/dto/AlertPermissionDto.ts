export class AlertPermissionDto 
{
  constructor(
    public writePermission: boolean,
    public teamId: number
  ) {}
}