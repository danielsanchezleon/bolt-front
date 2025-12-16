import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-analytics-module',
  imports: [PageWrapperComponent, ButtonModule, AccordionComponent, SelectButtonModule, CommonModule, FormsModule, SelectModule, MultiSelectModule, SliderModule],
  templateUrl: './analytics-module.component.html',
  styleUrl: './analytics-module.component.scss'
})
export class AnalyticsModuleComponent 
{
  cityFilterOptions: any[] = [{ label: 'España', value: 'spain' },{ label: 'Alemania', value: 'germany' }];
  severityFilterOptions: any[] = [{ label: 'Critical + Disaster', value: 'critical-disaster' }];
  platformFilterOptions: any[] = [{ label: 'CDN', value: 'cdn' },{ label: 'GVP', value: 'GVP' },{ label: 'PPGG', value: 'ppgg' }];
  selectedCityFilterOption: any;
  selectedSeverityFilterOption: any;
  selectedPlatformFilterOption: any;

  timeFilterOptions: any[] = [{ label: 'Últimas 6 horas', value: '6h' }, { label: 'Últimas 12 horas', value: '12h' }, { label: 'Últimas 24 horas', value: '24h' }, { label: 'Últimos 3 días', value: '3d' }, { label: 'Últimos 10 días', value: '10d' }, { label: 'Último mes', value: '1m' }, { label: 'Últimos 3 meses', value: '3m' }];
  selectedTimeFilterOption: any;

  groupedFilters: any[] = [
    {
      label: 'OB',
      value: 'ob',
      items: [
        { label: 'PE', value: 'pe' },
        { label: 'AR', value: 'ar' },
        { label: 'BR', value: 'br' },
        { label: 'EC', value: 'ec' },
        { label: 'DE', value: 'de' },
        { label: 'CO', value: 'co' },
        { label: 'SP', value: 'sp' },
        { label: 'GL', value: 'GL' }
      ]
    },
    {
      label: 'Severidad',
      value: 'severity',
      items: [
        { label: 'Disaster', value: 'disaster' },
        { label: 'Critical', value: 'critical' },
        { label: 'Major', value: 'major' },
        { label: 'Warning', value: 'warning' }
      ]
    },
    {
      label: 'Servicio',
      value: 'service',
      items: [
        { label: 'Video', value: 'video' },
        { label: 'Kernel', value: 'kernel' },
        { label: 'LA', value: 'la' },
        { label: 'SW', value: 'sw' },
        { label: 'MC', value: 'mc' },
        { label: 'Observabilidad', value: 'observability' }
      ]
    },
    {
      label: 'Subservicio',
      value: 'subservice',
      items: [
        { label: 'Live', value: 'live' },
        { label: 'VOD', value: 'vod' },
        { label: 'IPTV', value: 'iptv' },
        { label: 'OTT', value: 'ott' },
        { label: 'Playback', value: 'playback' },
        { label: 'Navegación', value: 'navigation' },
        { label: 'VOD L7D', value: 'vod-l7d' },
        { label: 'VOD Standard', value: 'vod-standard' }
      ]
    },
    {
      label: 'Plataforma',
      value: 'platform',
      items: [
        { label: 'CDN', value: 'cdn' },
        { label: 'GVP', value: 'GVP' },
        { label: 'PPGG', value: 'ppgg' },
        { label: 'QoE', value: 'qoe' },
        { label: 'IT', value: 'it' }
      ]
    }
  ];
  selectedElements: any[] = [];

  //Accordion 2
  selectedPercentile: number = 50;

  constructor (private router: Router) {}

  onClickNavigateToHome() {
    this.router.navigate(['']);
  }

  onClickClearFilters()
  {
    this.selectedCityFilterOption = null;
    this.selectedSeverityFilterOption = null;
    this.selectedPlatformFilterOption = null;
  }

  onCityFilterChange()
  {

  }

  onSeverityFilterChange()
  {

  }

  onPlatformFilterChange()
  {
    
  }
}
