import { Component, signal } from '@angular/core';
import { SheriaChatWidget } from './sheria-chat-widget/sheria-chat-widget';

@Component({
  selector: 'app-root',
  imports: [SheriaChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sheria-ai-frontend');
}
