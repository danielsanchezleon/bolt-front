import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inner-accordion',
  imports: [CommonModule],
  templateUrl: './inner-accordion.component.html',
  styleUrl: './inner-accordion.component.scss'
})
export class InnerAccordionComponent 
{
  @Input() title: string = '';
  isOpen = false;

  toggle() 
  {
    this.isOpen = !this.isOpen;
  }
}
