import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abreviateValueXDisplay',
  standalone: true,
})
export class AbreviateValueXDisplayPipe implements PipeTransform {
  transform(
    display: string | undefined,
    parentDisplay: string | undefined,
  ): string {
    return (display ?? '')
      .replace((parentDisplay ?? '').toLowerCase(), '')
      .trim();
  }
}
