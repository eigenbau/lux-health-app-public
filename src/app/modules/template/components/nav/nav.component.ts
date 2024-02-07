import { Component } from '@angular/core';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    hostDirectives: [RemoveHostDirective],
    standalone: true,
    imports: [IonicModule, RouterLinkActive, RouterLink]
})
export class NavComponent {}
