import { TeamDto } from "./TeamDto";

export interface AlertPermissionDto 
{
  writePermission: boolean;
  team: TeamDto;
}