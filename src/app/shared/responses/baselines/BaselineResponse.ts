import { AlertIndicatorViewDto } from "../../dto/alert/AlertIndicatorViewDto";

export class BaselineResponse 
{
    name?: string;
    alertIndicatorViewDto?: AlertIndicatorViewDto;

    constructor (name: string, alertIndicatorViewDto: AlertIndicatorViewDto) 
    {
        this.name = name;
        this.alertIndicatorViewDto = alertIndicatorViewDto;
    }
}