export class LoginRequest
{
    usernameOrEmail: string;
    password: string;

    constructor (usernameOrEmail: string, password: string)
    {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }
}