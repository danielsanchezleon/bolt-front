import { SeriePointResponse } from "./SeriePointResponse";

export class GraphSerieResponse
{
    name: string;
    seriePointList: SeriePointResponse[];

    constructor(name: string, seriePointList: SeriePointResponse[])
    {
        this.name = name;
        this.seriePointList = seriePointList;
    }
}