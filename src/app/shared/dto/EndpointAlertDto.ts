import { EndpointDto } from "./EndpointDto";

export class EndpointAlertDto 
{
  constructor(
    public severities: number[],
    public endpoint: EndpointDto
  ) {}
}