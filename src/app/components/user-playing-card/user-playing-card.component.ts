import { Component, Input } from '@angular/core';
import { User } from '../../models/user.models';

@Component({
  selector: 'comp-user-playing-card',
  templateUrl: './user-playing-card.component.html',
  styleUrls: ['./user-playing-card.component.scss'],
  standalone: false,
})

export class UserPlayingCardComponent {
    @Input() users: User[]

    constructor() {}

}