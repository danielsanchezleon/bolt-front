import { Component, OnInit } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { Router } from '@angular/router';
import { MetricOptions, Metric, metricList, metricOperationOptions, operationOptions, timeWindowOptions, discardTimeOptions, periodicityOptions, permissionTeamOptions} from '../../shared/constants/metric-options';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SanitizeExpressionPipe } from '../../shared/pipes/replace-empty.pipe';
import { FloatLabelModule } from 'primeng/floatlabel';

import { thresholdOptions, activationRecoverEvaluationOptions, errorBehaviorOptions } from '../../shared/constants/threshold-options';
import { InputNumberModule } from 'primeng/inputnumber';
import { InnerAccordionComponent } from '../../shared/components/inner-accordion/inner-accordion.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { channelOptions } from '../../shared/constants/addressee-options';
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { FloatingGraphComponent } from '../../shared/components/floating-graph/floating-graph.component';

export class MetricOption
{
  id: string;
  metric: Metric;
  operation: any = {value: 'add', label: 'Sumar ( + )', symbol: '+', description: 'Sumar con la métrica anterior'};

  constructor (id: string, metric: Metric)
  {
    this.id = id;
    this.metric = metric;
  }
}

export class Threshold
{
  id: string;
  type: string;
  comparation: string;
  value?: number;

  constructor (id: string, type: string, comparation: string, value?: number)
  {
    this.id = id;
    this.type = type;
    this.comparation = comparation;

    if (value)
    {
      this.value = value;
    }
  }
}

export class SilencePeriod
{
  id: string;
  days?: string[];
  from?: string;
  to?: string;

  constructor (id: string)
  {
    this.id = id;
    this.days = [];
  }
}

export class Permission
{
  id: string;
  team?: string[] = [];
  permission: string;

  constructor (id: string)
  {
    this.id = id;
    this.permission = 'r'
  }
}

export class Channel
{
  id: string;
  channel: string;
  value?: string;
  alerts: string[];

  constructor (id: string)
  {
    this.id = id;
    this.channel = 'email';
    this.alerts = [];
  }
}

export class Label
{
  name: string;
  value: string;

  constructor (name: string, value: string)
  {
    this.name = name;
    this.value = value;
  }
}

@Component({
  selector: 'app-create-simple-condition-alert',
  imports: [PageWrapperComponent, ReactiveFormsModule, FloatingGraphComponent, TabsModule, TextareaModule, ButtonModule, CommonModule, AccordionComponent, MultiSelectModule, FormsModule, FluidModule, SelectModule, TooltipModule, InputTextModule, SanitizeExpressionPipe, FloatLabelModule, InputNumberModule, InnerAccordionComponent, CheckboxModule, DatePickerModule, RadioButtonModule],
  templateUrl: './create-simple-condition-alert.component.html',
  styleUrl: './create-simple-condition-alert.component.scss'
})
export class CreateSimpleConditionAlertComponent implements OnInit
{
  //Step 1
  metricOptions: MetricOptions = new MetricOptions();
  metricOperationOptions: any[] = [];
  metricList: Metric[] = [];
  selectedMetricList: Metric[] = [];
  selectedMetrics: MetricOption[] = [];
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  customizeMetric: boolean = false;
  resultMetric: string = '';
  resultMetricLabel: string = '';

  tagIntersectionOptions: any[] = [];
  operationOptions: any[] = []

  timeWindowOptions: any[] = [];
  discardTimeOptions: any[] = [];
  periodicityOptions: any[] = [];

  //Step 2
  thresholdList: Threshold[] = [];
  thresholdOptions: any[] = [];
  errorBehaviorOptions: any[] = [];
  silencePeriodList: SilencePeriod[] = [];
  activationRecoverEvaluationOptions: any[] = [];

  //Step 3
  channelOptions: any[] = [];
  channelList: Channel[] = [];
  iconMap: Map<String, string> = new Map<string, string>();

  labelForm: FormGroup;
  labelList: Label[] = [];

  notificationMessageForm: FormGroup;

  //Step 4
  permissionTeamOptions: any[] = [];
  permissionList: Permission[] = [];

  //Steps
  step2Disabled: boolean = true;
  step3Disabled: boolean = true;
  step4Disabled: boolean = true;

  constructor(private router: Router, private _fb: FormBuilder)
  {
    this.labelForm = this._fb.group({
      name: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });

    this.notificationMessageForm = this._fb.group({
      message: ['', [Validators.required]],
      details: ['', []],
      proccedure: ['', []]
    });
  }

  ngOnInit(): void 
  {
    //Step 1
    this.metricList = metricList;
    this.metricOperationOptions = metricOperationOptions;

    this.operationOptions = operationOptions;

    this.timeWindowOptions = timeWindowOptions;
    this.discardTimeOptions = discardTimeOptions;
    this.periodicityOptions = periodicityOptions;

    //Step 2
    this.thresholdOptions = thresholdOptions;
    this.thresholdList.push(new Threshold('1', 'disaster', 'greater-than'));
    this.errorBehaviorOptions = errorBehaviorOptions;
    this.silencePeriodList.push(new SilencePeriod('1'));
    this.activationRecoverEvaluationOptions = activationRecoverEvaluationOptions;

    //Step 3
    this.channelOptions = channelOptions;
    this.channelList.push(new Channel('1'));

    for (const option of channelOptions) {
      this.iconMap.set(option.value, option.icon);
    }

    //Step 4
    this.permissionTeamOptions = permissionTeamOptions;
    this.permissionList.push(new Permission('1'));
  }

  private allowedLetters(): string[] {
    let letters = [];

    for (let i = 0; i < this.selectedMetrics.length; i++) 
    {
      letters.push(this.letters[i]);
    }

    return letters;
  }

  private get allowedChars(): string[] {
    return ['+', '-', '*', '/', '(', ')', ...this.allowedLetters()];
  }

  allowCharacters(event: KeyboardEvent) 
  {
    const char = event.key;

    if (!this.allowedChars.includes(char))
    {
      event.preventDefault();
    }
  }

  onClickNavigateToCreateAlert()
  {
    this.router.navigate(['crear-alerta']);
  }

  onClickSelectMetrics()
  {
    let offset: number = this.selectedMetrics.length;

    this.selectedMetricList.forEach((selectedMetric, i) => {
      this.selectedMetrics.push(new MetricOption(this.letters[offset + i], selectedMetric));
    });

    this.metricList = this.metricList.filter(metricA => !this.selectedMetricList.some(metricB => metricB.value === metricA.value));

    this.selectedMetricList = [];

    this.checkSteps();
    this.generateResultMetric();
    this.getMetricTagsIntersection();
  }

  generateResultMetric()
  {
    this.resultMetric = '';
    this.resultMetricLabel = '';

    this.selectedMetrics.forEach((selectedMetric, i) => {
      this.resultMetric += selectedMetric.id;
      this.resultMetricLabel += selectedMetric.metric.label;

      if (i < (this.selectedMetrics.length - 1))
      {
        this.resultMetric += this.selectedMetrics[i+1].operation.symbol;
        this.resultMetricLabel += ' ' + this.selectedMetrics[i+1].operation.symbol + ' ';
      }
    });
  }

  getMetricTagsIntersection()
  {
    let commonTags = new Set(this.selectedMetrics[0].metric.tags);

    for (let selectedMetric of this.selectedMetrics.slice(1)) 
    {
      commonTags = new Set(selectedMetric.metric.tags.filter(tag => commonTags.has(tag)));
    }

    this.tagIntersectionOptions = Array.from(commonTags).map(tag => ({ label: tag, value: tag }));
  }

  onClickRemoveSelectedMetric(index: number)
  {
    this.selectedMetrics.splice(index, 1);

    this.metricList = metricList;
    this.metricList = this.metricList.filter(metricA => !this.selectedMetrics.some(metricB => metricB.metric.value === metricA.value));

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();
    this.generateResultMetric();
    this.getMetricTagsIntersection();
  }

  onClickArrowDown(index: number)
  {
    [this.selectedMetrics[index], this.selectedMetrics[index+1]] = [this.selectedMetrics[index+1], this.selectedMetrics[index]];

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  onClickArrowUp(index: number)
  {
    [this.selectedMetrics[index], this.selectedMetrics[index-1]] = [this.selectedMetrics[index-1], this.selectedMetrics[index]];

    this.selectedMetrics.forEach((selectedMetric, i) => {
      selectedMetric.id = this.letters[i];
    });

    this.checkSteps();
    this.generateResultMetric();
  }

  checkSteps()
  {
    //Step 2
    if (this.selectedMetrics.length > 0)
    {
      this.step2Disabled = false;
      this.step3Disabled = false;
      this.step4Disabled = false;
    }
    else
    {
      this.step2Disabled = true;
      this.step3Disabled = true;
      this.step4Disabled = true;
    }
  }

  onClickCustomizeMetric()
  {
    this.customizeMetric = true;
  }

  onChangeSelectOperation()
  {
    this.generateResultMetric();
  }

  onClickSaveMetric()
  {
    this.customizeMetric = false;
  }

  onClickCancelMetricCustomization()
  {
    this.generateResultMetric();
    this.customizeMetric = false;
  }

  onClickSetThresholdType(threshold: Threshold, type: string)
  {
    threshold.type = type;
  }

  onClickAddThreshold()
  {
    this.thresholdList.push(new Threshold((this.thresholdList.length + 1).toString(), 'disaster', 'greater-than'));
  }

  onClickRemoveSilencePeriod(i: number)
  {
    this.silencePeriodList.splice(i, 1);
  }

  onClickAddSilencePeriod()
  {
    this.silencePeriodList.push(new SilencePeriod((this.silencePeriodList.length + 1).toString()));
  }

  onClickAddPermission()
  {
    this.permissionList.push(new Permission((this.silencePeriodList.length + 1).toString()));
  }

  onClickRemovePermission(i: number)
  {
    this.permissionList.splice(i, 1);
  }

  onClickRemoveChannel(i: number)
  {
    this.channelList.splice(i, 1);
  }

  onClickSetChannelAlert(channel: Channel, alert: string)
  {
    if (channel.alerts.includes(alert))
    {
      channel.alerts = channel.alerts.filter((al) => al !== alert);
    }
    else
    {
      channel.alerts.push(alert);
    }
  }

  onClickAddChannel()
  {
    this.channelList.push(new Channel((this.channelList.length + 1).toString()));
  }

  onClickAddLabel()
  {
    this.labelList.push(new Label(this.labelForm.get('name')?.value, this.labelForm.get('value')?.value));

    this.labelForm.reset();
    this.labelForm.updateValueAndValidity();
  }

  onClickRemoveTag(i: number)
  {
    this.labelList.splice(i, 1);
  }

  onClickCreateAlert()
  {
    
  }
}
