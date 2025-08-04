import { EndpointDto } from "./EndpointDto";

export class EndpointAlertDto 
{
  constructor(
    public severities: string[],
    public endpoint: EndpointDto
  ) {}
}