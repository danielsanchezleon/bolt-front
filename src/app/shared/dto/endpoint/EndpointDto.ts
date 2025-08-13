import { EndpointTypeDto } from "./EndpointTypeDto";

export class EndpointDto
{
    name?: string;
    destination?: string;
    type?: EndpointTypeDto;

    constructor (name: string, destination: string, type: EndpointTypeDto)
    {
        this.name = name;
        this.destination = destination;
        this.type = type;
    }
}