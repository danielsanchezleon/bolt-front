import { AlertIndicatorViewDto } from "../../dto/alert/AlertIndicatorViewDto";

export class BaselineResponse 
{
    id?: number;
    idInventory?: number;
    name?: string;
    alertIndicatorViewDto?: AlertIndicatorViewDto;
    baselineTable?: string;

    constructor (id: number, idInventory: number, name: string, alertIndicatorViewDto: AlertIndicatorViewDto, baselineTable: string) 
    {
        this.id = id;
        this.idInventory = idInventory;
        this.name = name;
        this.alertIndicatorViewDto = alertIndicatorViewDto;
        this.baselineTable = baselineTable;
    }
}