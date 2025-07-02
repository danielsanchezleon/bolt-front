import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sanitizeExpression',
  pure: true // muy importante para que sea eficiente
})
export class SanitizeExpressionPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Reemplaza expresiones vacías o dobles operadores con un espacio
    // Opcional: mejorar legibilidad con espacios entre operadores
    return value
      .replace(/''/g, ' ')          // reemplaza string vacío
      .replace(/([+\-*/()])/g, ' $1 ') // agrega espacios alrededor de operadores
      .replace(/\s+/g, ' ')         // reduce múltiples espacios a uno
      .trim();
  }
}
