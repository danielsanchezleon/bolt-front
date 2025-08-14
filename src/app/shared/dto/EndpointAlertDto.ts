export class EndpointAlertDto 
{
  constructor(
    public severities: string[],
    public endpointId: number
  ) {}
}