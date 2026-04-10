import { Component, signal } from '@angular/core';
import { RouterOutlet, NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './components/header/header';
import { SideBar } from './components/side-bar/side-bar';
import { CommonModule } from '@angular/common';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, SideBar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('x-bank');

  showLayout = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.activatedRoute;

        while (route.firstChild){
          route = route.firstChild;
        }
        
        route.data.subscribe(data => {
          this.showLayout = !data ['hideLayout'];
        });
      });
  }
}
