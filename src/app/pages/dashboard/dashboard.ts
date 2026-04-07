import { Component, AfterViewInit } from '@angular/core';
import { DatePickerComponent } from '../../components/date-picker.component/date-picker.component';
import Chart from 'chart.js/auto'

@Component({
  selector: 'app-dashboard',
  imports: [ DatePickerComponent ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {
  isCustom = false;

  onPresetChange(event: any) {
    this.isCustom = event.target.value === 'custom';
  }

  ngAfterViewInit(): void {
    this.createChart();
  }
  createChart() {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;

    if (!canvas) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri'],
        datasets: [
          {
            data: [40, 52, 72, 60, 67],
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
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    });
  }
}
