import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, NgZone, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChartModule, UIChart } from 'primeng/chart';
import { Chart, ChartDataset } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-floating-graph',
  imports: [ButtonModule, ChartModule, CommonModule, SelectButtonModule, FormsModule, MultiSelectModule, ProgressSpinnerModule],
  templateUrl: './floating-graph.component.html',
  styleUrls: ['./floating-graph.component.scss']
})
export class FloatingGraphComponent 
{
  datasetsCount = 0;
  selectedCurves = new Set<number>();

  isHovering = false;
  options: any;
  data: any;

  @Input('disabled') disabled: boolean = false;
  @Input('graphSeries') graphSeries: any;
  @Input('conditionGraphList') conditionGraphList: any[] = [];
  @Input('graphGroupBy') graphGroupBy!: Map<string, string[]>;
  @Input('isGraphLoading') isGraphLoading: boolean = false;

  @Output('hoursEvent') hoursEvent: EventEmitter<number> = new EventEmitter<number>();

  platformId = inject(PLATFORM_ID);

  @ViewChild('chart') chart?: UIChart;

  onClickButton: boolean = false;

  hoursOptions: any[] = [{ label: '1 h', value: 1 }, { label: '3 h', value: 3 }, { label: '6 h', value: 6 }, { label: '12 h', value: 12 }, { label: '24 h', value: 24 }];
  selectedHoursOption: number = 24;

  groupBy: string[] = [];

  groupByChartSelectedMap: Map<string, string[]> = new Map<string, string[]>();
  selectedGroupBy: string[] = [];

  @Output('graphGroupByEvent') graphGroupByEvent: EventEmitter<Map<string, string[]>> = new EventEmitter<Map<string, string[]>>();

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit() 
  {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) 
  {
    //If series data changes, update the chart datasets
    if ((changes['graphSeries'] && !changes['graphSeries'].firstChange && this.graphSeries)) 
    {
      this.updateDataSets();
    }

    //If condition graphs change, update the annotations
    if ((changes['conditionGraphList'] && !changes['conditionGraphList'].firstChange && this.conditionGraphList))
    {
      this.updateConditionGraphs();
    }

    //If group by options change, reset the selected options and emit the new map
    if ((changes['graphGroupBy'] && !changes['graphGroupBy'].firstChange && this.graphGroupBy)) 
    {
      this.groupBy = [];
      this.selectedGroupBy = [];
      this.groupByChartSelectedMap = new Map();

      for(let key of this.graphGroupBy.keys())
      {
        this.groupBy.push(key);
        this.selectedGroupBy.push(key);
        this.groupByChartSelectedMap.set(key, this.graphGroupBy.get(key)!);
      }
    }
  }

  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }

  //This method is called once to initialize the chart options with theme colors
  initChart() 
  {
    this.datasetsCount = this.data?.datasets?.length ?? 0;

    if (isPlatformBrowser(this.platformId)) 
    {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            onClick: (_e: any, legendItem: any, legend: any) => {

              this.ngZone.run(() => {
                const chart = legend.chart;
                const idx = legendItem.datasetIndex as number;
                const total = chart.data.datasets.length;

                this.datasetsCount = total; // por si cambia dinámicamente

                // ESTADOS:
                // selected.size === 0 -> modo "sin filtro" (se ven todas)
                // 1..total-1 -> modo filtro (solo selected)
                // selected.size === total -> modo "todas seleccionadas" (y el siguiente click reinicia a solo idx)

                if (this.selectedCurves.size === 0) {
                  // De "sin filtro" a "solo la clicada"
                  this.selectedCurves = new Set([idx]);
                } else if (this.selectedCurves.size === total) {
                  // Estabas en "todas seleccionadas": reinicia a solo la clicada
                  this.selectedCurves = new Set([idx]);
                } else {
                  // Modo filtro normal: toggle
                  if (this.selectedCurves.has(idx)) this.selectedCurves.delete(idx);
                  else this.selectedCurves.add(idx);

                  // Si te quedas sin ninguna => vuelve a "sin filtro" (todas visibles)
                  if (this.selectedCurves.size === 0) {
                    for (let i = 0; i < total; i++) chart.setDatasetVisibility(i, true);
                    chart.update();
                    return;
                  }
                }

                // Aplicar visibilidad según estado
                if (this.selectedCurves.size === 0) {
                  for (let i = 0; i < total; i++) chart.setDatasetVisibility(i, true);
                } else {
                  for (let i = 0; i < total; i++) {
                    chart.setDatasetVisibility(i, this.selectedCurves.has(i));
                  }
                }

                chart.update();
                this.cdr.markForCheck();
              });
            },
            labels: {
              color: textColor
            }
          },
          annotation: {
            annotations: {}
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          }
        }
      };
      this.cdr.markForCheck();
    }
  }

  private generateRandomColor(alpha: number = 1): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  updateDataSets() 
  {
    if (isPlatformBrowser(this.platformId)) 
    {
      const documentStyle = getComputedStyle(document.documentElement);

      if (!this.graphSeries || this.graphSeries.length === 0)
        return;

      // 1) labels del eje X (asumo que todas las series comparten los mismos labels)
      const labels = this.graphSeries[0].seriePointList.map((p: any) => p.label);

      // 2) datasets: cada serie del backend -> una curva
      const datasets = this.graphSeries.map((serie: any, index: number) => 
      {
        return {
          label: serie.name,
          data: serie.seriePointList.map( (p: any) => p.value),
          borderColor: this.generateRandomColor(1),
          fill: false,
          tension: 0.3,
          pointRadius: 3,
        } as ChartDataset<'line'>;
      });

      // 3) actualizar la gráfica
      this.chart?.refresh();

      this.data = {
        labels: labels,
        datasets: datasets
      };

      this.cdr.markForCheck();
    }
  }

  updateConditionGraphs()
  {
    if (isPlatformBrowser(this.platformId)) {
      this.options.plugins.annotation.annotations = this.buildAnnotations();

      this.chart?.refresh();
      this.cdr.markForCheck();
    }
  }

  buildAnnotations(): any {
    const annotations: any = {};

    this.conditionGraphList.forEach((graph) => {
      if (graph.type === 'line') {
        annotations[graph.label] = {
          type: graph.type,
          yMin: graph.y,
          yMax: graph.y,
          borderColor: graph.color,
          borderWidth: 2,
          label: {
            content: graph.label,
            enabled: true,
            position: 'end',
            backgroundColor: `${graph.color}20`,
            color: graph.color
          }
        };
      }
    });

    return annotations;
  }

  onChangeHoursSelectButton(event: any)
  {
    this.hoursEvent.emit(event.value);
  }

  onChangeGraphGroupBy(event: any)
  {
    this.selectedGroupBy = event.value;

    this.groupByChartSelectedMap = new Map<string, string[]>();

    event.value.forEach((dimension: string) => {
      this.groupByChartSelectedMap.set(dimension, this.graphGroupBy.get(dimension)!);
    });
  }

  onChangeGraphFilters(event: any, dimension: string)
  {
    this.groupByChartSelectedMap.set(dimension, event.value);
  }

  emitGraphGroupByEvent()
  {
    this.graphGroupByEvent.emit(this.groupByChartSelectedMap);
  }

  resetLabelStates() 
  {
    this.selectedCurves.clear();

    const chart = this.chart?.chart;
    if (!chart) return;

    const total = chart.data.datasets.length;
    for (let i = 0; i < total; i++) chart.setDatasetVisibility(i, true);
    chart.update();
  }
}
