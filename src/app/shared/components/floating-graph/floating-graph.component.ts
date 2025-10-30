import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChartModule, UIChart } from 'primeng/chart';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-floating-graph',
  imports: [ButtonModule, ChartModule, CommonModule, SelectButtonModule, FormsModule, MultiSelectModule],
  templateUrl: './floating-graph.component.html',
  styleUrls: ['./floating-graph.component.scss']
})
export class FloatingGraphComponent {
  isHovering = false;
  @Input('disabled') disabled: boolean = false;

  options: any;

  @Input('chartData') chartData: any;
  data: any;

  @Input('conditionGraphList') conditionGraphList: any[] = [];

  platformId = inject(PLATFORM_ID);

  @ViewChild('chart') chart?: UIChart;

  onClickButton: boolean = false;

  hoursOptions: any[] = [{ label: '1 h', value: 1 }, { label: '3 h', value: 3 }, { label: '6 h', value: 6 }, { label: '12 h', value: 12 }, { label: '24 h', value: 24 }];
  selectedHoursOption: number = 24;

  @Output('hoursEvent') hoursEvent: EventEmitter<number> = new EventEmitter<number>();

  @Input('groupByChartMap') groupByChartMap!: Map<string, string[]>;
  groupBy: string[] = [];

  groupByChartSelectedMap: Map<string, string[]> = new Map<string, string[]>();
  selectedGroupBy: string[] = [];

  @Output('groupByEvent') groupByEvent: EventEmitter<Map<string, string[]>> = new EventEmitter<Map<string, string[]>>();

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['chartData'] && !changes['chartData'].firstChange && this.chartData)) 
    {
      this.updateDataSets();
    }

    if ((changes['conditionGraphList'] && !changes['conditionGraphList'].firstChange && this.conditionGraphList))
    {
      this.updateConditionGraphs();
    }

    if ((changes['groupByChartMap'] && !changes['groupByChartMap'].firstChange && this.groupByChartMap)) 
    {
      this.groupBy = [];
      this.selectedGroupBy = [];
      this.groupByChartSelectedMap = new Map();
      for(let key of this.groupByChartMap.keys())
      {
        this.groupBy.push(key);
        this.selectedGroupBy.push(key);
        this.groupByChartSelectedMap.set(key, this.groupByChartMap.get(key)!);
      }

      this.groupByEvent.emit(this.groupByChartSelectedMap);
    }
  }

  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }

  initChart() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
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
      this.cd.markForCheck();
    }
  }

  updateDataSets() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);

      this.data = {
        labels: [...this.chartData.labels],
        datasets: [...this.chartData.datasets]
      };

      this.data.datasets.forEach((dataset: any) => {
        dataset.borderColor = documentStyle.getPropertyValue(dataset.borderColor);
      });

      this.chart?.refresh();
      this.cd.markForCheck();
    }
  }

  updateConditionGraphs()
  {
    if (isPlatformBrowser(this.platformId)) {
      this.options.plugins.annotation.annotations = this.buildAnnotations();

      this.chart?.refresh();
      this.cd.markForCheck();
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

  onChangeGroupBy(event: any)
  {
    this.selectedGroupBy = event.value;

    event.value.forEach((dimension: string) => {
      this.groupByChartSelectedMap.set(dimension, this.groupByChartMap.get(dimension)!);
    });

    this.groupByEvent.emit(this.groupByChartSelectedMap);
  }
}
