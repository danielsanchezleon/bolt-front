import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion',
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss'
})
export class AccordionComponent 
{
  @Input() title: string = '';
  @Input() highlightTitle: boolean = false;
  @Input() disabled: boolean = false;
  @Input() isOpen: boolean = false;

  toggle() 
  {
    this.isOpen = !this.isOpen;
  }
}
