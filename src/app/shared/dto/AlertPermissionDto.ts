import { TeamDto } from "./TeamDto";

export class AlertPermissionDto 
{
  constructor(
    public writePermission: boolean,
    public team: TeamDto
  ) {}
}