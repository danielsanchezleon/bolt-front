import { Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal',
  imports: [ButtonModule, DialogModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent 
{
  @Input() title: string = '';
  @Input() visible: boolean = false;
}
