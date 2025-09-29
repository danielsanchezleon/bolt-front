export class ChangePasswordDto
{
    userId: number;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;

    constructor(userId: number, oldPassword: string, newPassword: string, confirmNewPassword: string)
    {
        this.userId = userId;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confirmNewPassword = confirmNewPassword;
    }
}