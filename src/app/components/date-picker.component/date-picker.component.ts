import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  start: Date | null;
  end: Date | null;
  preset?: string;
}

interface CalendarDay {
  date: Date;
  currentMonth: boolean;
  isToday: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  disabled: boolean;
}

const PRESETS = [
  { label: 'Today', key: 'today' },
  { label: 'Yesterday', key: 'yesterday' },
  { label: 'Last week', key: 'last_week' },
  { label: 'Last month', key: 'last_month' },
  { label: 'Last quarter', key: 'last_quarter' },
];

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  @Output() rangeSelected = new EventEmitter<DateRange>();

  isOpen = false;
  presets = PRESETS;
  weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  viewDate: Date = new Date();
  hoverDate: Date | null = null;

  selectedPreset: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;
  selecting: 'start' | 'end' = 'start';

  calendarDays: CalendarDay[] = [];
  displayLabel = 'Select date range';

  private onChange: (value: DateRange) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.buildCalendar();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMousedown(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get monthLabel(): string {
    return this.viewDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectPreset(key: string): void {
    this.selectedPreset = key;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (key) {
      case 'today':
        this.startDate = new Date(today);
        this.endDate = new Date(today);
        break;
      case 'yesterday': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        this.startDate = y;
        this.endDate = new Date(y);
        break;
      }
      case 'last_week': {
        const end = new Date(today);
        end.setDate(today.getDate() - today.getDay()); // last Sunday
        const start = new Date(end);
        start.setDate(end.getDate() - 6);
        this.startDate = start;
        this.endDate = end;
        break;
      }
      case 'last_month': {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        this.startDate = start;
        this.endDate = end;
        break;
      }
      case 'last_quarter': {
        const q = Math.floor(today.getMonth() / 3);
        const start = new Date(today.getFullYear(), (q - 1) * 3, 1);
        const end = new Date(today.getFullYear(), q * 3, 0);
        this.startDate = start;
        this.endDate = end;
        break;
      }
    }

    this.selecting = 'start';
    this.hoverDate = null;
    this.viewDate = new Date(this.startDate!);
    this.buildCalendar();
  }

  prevMonth(): void {
    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() - 1,
      1
    );
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(
      this.viewDate.getFullYear(),
      this.viewDate.getMonth() + 1,
      1
    );
    this.buildCalendar();
  }

  onDayHover(day: CalendarDay): void {
    if (this.selecting === 'end' && this.startDate) {
      this.hoverDate = day.date;
      this.buildCalendar();
    }
  }

  onDayClick(day: CalendarDay): void {
    this.selectedPreset = null;

    if (this.selecting === 'start') {
      this.startDate = new Date(day.date);
      this.endDate = null;
      this.hoverDate = null;
      this.selecting = 'end';
    } else {
      const clicked = new Date(day.date);
      if (clicked < this.startDate!) {
        // Clicked before start — swap
        this.endDate = new Date(this.startDate!);
        this.startDate = clicked;
      } else {
        this.endDate = clicked;
      }
      this.selecting = 'start';
      this.hoverDate = null;
    }

    this.buildCalendar();
  }

  confirm(): void {
    if (!this.startDate) return;
    const range: DateRange = {
      start: this.startDate,
      end: this.endDate ?? this.startDate,
      preset: this.selectedPreset ?? undefined,
    };
    this.updateLabel(range);
    this.onChange(range);
    this.rangeSelected.emit(range);
    this.isOpen = false;
  }

  reset(): void {
    this.startDate = null;
    this.endDate = null;
    this.selectedPreset = null;
    this.selecting = 'start';
    this.hoverDate = null;
    this.displayLabel = 'Select date range';
    this.buildCalendar();
    const range: DateRange = { start: null, end: null };
    this.onChange(range);
    this.rangeSelected.emit(range);
  }

  private updateLabel(range: DateRange): void {
    if (this.selectedPreset) {
      const p = PRESETS.find((p) => p.key === this.selectedPreset);
      this.displayLabel = p ? p.label : this.formatRange(range);
    } else {
      this.displayLabel = this.formatRange(range);
    }
  }

  private formatRange(range: DateRange): string {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    if (!range.start) return 'Select date range';
    if (!range.end || range.start.getTime() === range.end.getTime())
      return fmt(range.start);
    return `${fmt(range.start)} – ${fmt(range.end)}`;
  }

  buildCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Monday-based: getDay() returns 0=Sun, adjust
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: CalendarDay[] = [];
    const calStart = new Date(firstDay);
    calStart.setDate(calStart.getDate() - startOffset);

    const effectiveEnd = this.endDate ?? this.hoverDate;

    for (let i = 0; i < 42; i++) {
      const date = new Date(calStart);
      date.setDate(calStart.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isStart =
        !!this.startDate && date.getTime() === this.startDate.getTime();
      const isEnd =
        !!effectiveEnd && date.getTime() === effectiveEnd.getTime();
      const inRange =
        !!this.startDate &&
        !!effectiveEnd &&
        date > this.startDate &&
        date < effectiveEnd;

      days.push({
        date,
        currentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isStart,
        isEnd,
        inRange,
        disabled: false,
      });
    }

    this.calendarDays = days;
  }

  // ControlValueAccessor
  writeValue(value: DateRange): void {
    if (value) {
      this.startDate = value.start;
      this.endDate = value.end;
      this.buildCalendar();
    }
  }
  registerOnChange(fn: (value: DateRange) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}