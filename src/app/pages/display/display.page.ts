import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';

@Component({
  selector: 'app-display',
  templateUrl: './display.page.html',
  styleUrls: ['./display.page.scss'],
  standalone: false,
})
export class DisplayPage implements OnInit {
  currentPlayer = '';

  constructor(
    private broadcastService: BroadcastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.broadcastService.message$.subscribe((msg) => {
      if (msg.type === BroadcastType.Role) {
        this.currentPlayer = msg.role;

        this.cdr.detectChanges();
      }
    });
  }
}
