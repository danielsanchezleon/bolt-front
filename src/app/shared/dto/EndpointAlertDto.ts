export class EndpointAlertDto 
{
  constructor(
    public id: number | null,
    public severities: string[],
    public endpointId: number
  ) {}
}