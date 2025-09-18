export interface UserUpdateDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  teamId: number | null;
  roleId: number | null;
}