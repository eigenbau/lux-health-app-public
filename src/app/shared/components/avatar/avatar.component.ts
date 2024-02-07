import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';
import { getInitials } from '@core/utils/fhir/person-functions';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./avatar.component.scss'],
  template: `
    <div class="offset-border">
      <div class="avatar">
        {{ initials }}
      </div>
    </div>
  `,
  standalone: true,
})
export class AvatarComponent implements OnChanges {
  @Input() firstname = '';
  @Input() lastname = '';
  @Input() name = '';

  @HostBinding('style.--background-image') imageUrl: string = '';
  @HostBinding('style.--size') @Input() size = '';
  @HostBinding('style.--color') @Input() color: string = '';
  @HostBinding('style.--background-color') @Input() background: string = '';

  public initials = '';

  @Input() set image(image: string) {
    if (image && image !== '') {
      this.imageUrl = `url(${image})`;
    }
  }

  ngOnChanges(): void {
    this.initials = this.imageUrl
      ? ''
      : getInitials({
          firstname: this.firstname,
          lastname: this.lastname,
          name: this.name,
        });
  }
}
