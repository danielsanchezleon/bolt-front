export class EndpointDto
{
    type?: string;
    data?: Record<string, any>;
    name?: string;

    constructor (type?: string, data?: Record<string, any>, name?: string)
    {
        this.type = type;
        this.data = data;
        this.name = name;
    }
}