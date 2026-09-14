import { Component } from '@angular/core';
import { SheriaLanding } from './sheria-landing/sheria-landing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SheriaLanding],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
