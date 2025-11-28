import { AlertViewDto } from "../../dto/alert/AlertViewDto";

export class CrupdateAlertResultResponse
{
    dbSuccess: boolean;
    dbMessage: string;

    dolphinSuccess: boolean;
    dolphinMessage: string;

    alert: AlertViewDto;

    constructor(dbSuccess: boolean, dbMessage: string, dolphinSuccess: boolean, dolphinMessage: string, alert: AlertViewDto)
    {
        this.dbSuccess = dbSuccess;
        this.dbMessage = dbMessage;
        this.dolphinSuccess = dolphinSuccess;
        this.dolphinMessage = dolphinMessage;
        this.alert = alert;
    }
}