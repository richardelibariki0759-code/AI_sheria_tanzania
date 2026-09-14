import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

// This is where your Flask kitchen lives. Change it when you deploy
// (e.g. to your Cloud Run URL) — everything else stays the same.
const API_BASE_URL = 'http://127.0.0.1:5000';

@Component({
  selector: 'app-sheria-chat-widget',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './sheria-chat-widget.html',
  styleUrl: './sheria-chat-widget.scss'
})
export class SheriaChatWidget implements OnInit, AfterViewChecked {
  @ViewChild('scrollArea') private scrollArea!: ElementRef<HTMLDivElement>;

  isOpen = true;
  isExpanded = true;
  draftMessage = '';

  // Starts empty — filled in by GET /api/topics once the component loads.
  topics: string[] = [];

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: "I'm Sheria AI. I can help explain your legal rights — choose a topic below or type your question."
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // The "order slip" here is a GET request — we're just asking for
    // information, not sending anything.
    this.http.get<{ topics: string[] }>(`${API_BASE_URL}/api/topics`).subscribe({
      next: (res) => (this.topics = res.topics),
      error: (err) => console.error('Could not load topics from Flask:', err)
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleWidget(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isExpanded = true;
    }
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  selectTopic(topic: string): void {
    this.sendToBackend(topic);
  }

  sendMessage(): void {
    const text = this.draftMessage.trim();
    if (!text) {
      return;
    }
    this.sendToBackend(text);
    this.draftMessage = '';
  }

  private sendToBackend(text: string): void {
    // Show the user's own message immediately — don't wait on the network.
    this.messages.push({ from: 'user', text });

    // This is a POST request — we're sending data ({ message: text }) and
    // expecting Flask to send something back in return.
    this.http
      .post<{ reply: string }>(`${API_BASE_URL}/api/chat`, { message: text })
      .subscribe({
        next: (res) => this.messages.push({ from: 'bot', text: res.reply }),
        error: () =>
          this.messages.push({
            from: 'bot',
            text: "Sorry, I couldn't reach the server. Is the Flask app running?"
          })
      });
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollArea?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch {
      // element not rendered yet — nothing to do
    }
  }
}
