import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators'


@Directive({
  selector: '[appHoldableTime]'
})
export class HoldableTimeDirective {

  @Output() holdtime: EventEmitter<number> = new EventEmitter();

  state: Subject<string> = new Subject();

  cancel: Observable<string>;

  constructor() { 

    this.cancel = this.state.pipe(
      filter(v => v === 'cancel'),
      tap(v => {
        console.log('stopped');
        this.holdtime.emit(0);
      })
    )

  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('touchend', ['$event'])
  onExit() {
    console.log('pressed cancel')
    this.state.next('cancel');
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onHold() {
    console.log('started....')

    this.state.next('start');

    const n = 100;

    interval(n).pipe(
      takeUntil(this.cancel),
      tap(v => {
        console.log(v * n);
        this.holdtime.emit(v * n)
      })
    ).subscribe()
  }

}
