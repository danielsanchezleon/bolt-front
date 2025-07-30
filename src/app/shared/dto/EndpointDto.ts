export class EndpointDto 
{
  constructor(
    public name: string,
    public endpointType: string,
    public endpointValue: string
  ) {}
}