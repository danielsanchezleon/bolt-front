import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChartModule, UIChart } from 'primeng/chart';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-floating-graph',
  imports: [ButtonModule, ChartModule, CommonModule],
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
}
