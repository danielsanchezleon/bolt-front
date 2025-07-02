import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-floating-graph',
  imports: [ButtonModule],
  templateUrl: './floating-graph.component.html',
  styleUrls: ['./floating-graph.component.scss']
})
export class FloatingGraphComponent {
  isHovering = false;

  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }
}
