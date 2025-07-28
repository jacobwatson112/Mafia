import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UserPlayingCardComponent } from './user-playing-card/user-playing-card.component';
import { SystemControlComponent } from './system-control.component/system-control.component';

const components = [
    SystemControlComponent,
    UserPlayingCardComponent,
]

const directives = []

@NgModule({
    declarations: [...components, ...directives],
    exports: [...components, ...directives],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ComponentsModule { }
