import { EndpointTypeDto } from "./EndpointTypeDto";

export class EndpointViewDto
{
    id?: number;
    name?: string;
    destination?: string;
    type?: EndpointTypeDto;
    configuredAlerts?: string;
    date?: Date;
}