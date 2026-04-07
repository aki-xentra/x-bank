import { 
  Component, 
  AfterViewInit, 
  ViewChild, 
  ElementRef, 
  Inject, 
  PLATFORM_ID 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DatePickerComponent } from '../../components/date-picker.component/date-picker.component';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [DatePickerComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {

  @ViewChild('salesChart') chartRef!: ElementRef;

  isCustom = false;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  onPresetChange(event: any) {
    this.isCustom = event.target.value === 'custom';
  }

  ngAfterViewInit(): void {
    // 🚨 Only run in browser (fixes your error)
    if (this.isBrowser) {
      this.createChart();
    }
  }

  createChart() {
    new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Mon', '', 'Tue', 'Wed', 'Thurs', '', 'Fri'],
        datasets: [
          {
            data: [40, 52, 72, 72, 60, 56, 67],
            borderColor: '#1aa36f',
            backgroundColor: 'rgba(26,163,111,0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
  }
}