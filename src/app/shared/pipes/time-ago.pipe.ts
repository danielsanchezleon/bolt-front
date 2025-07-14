import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(seconds)) return '';

    const intervals: { [key: string]: number } = {
      año: 31536000,
      mes: 2592000,
      semana: 604800,
      día: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1
    };

    for (const i in intervals) {
      const interval = Math.floor(seconds / intervals[i]);
      if (interval >= 1) {
        const plural = interval > 1 ? this.pluralize(i) : i;
        return `hace ${interval} ${plural}`;
      }
    }

    return 'justo ahora';
  }

  private pluralize(unit: string): string {
    switch (unit) {
      case 'mes': return 'meses';
      case 'día': return 'días';
      case 'año': return 'años';
      default: return unit + 's';
    }
  }
}