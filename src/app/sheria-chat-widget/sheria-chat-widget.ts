import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownLitePipe } from './markdown-lite.pipe';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const API_BASE_URL = 'https://sheria-ai-backend-a87r.onrender.com';

@Component({
  selector: 'app-sheria-chat-widget',
  imports: [CommonModule, FormsModule, HttpClientModule, MarkdownLitePipe],
  templateUrl: './sheria-chat-widget.html',
  styleUrl: './sheria-chat-widget.scss'
})
export class SheriaChatWidget implements OnInit, AfterViewChecked {
  @ViewChild('scrollArea') private scrollArea!: ElementRef<HTMLDivElement>;

  isOpen = true;
  isExpanded = true;
  draftMessage = '';

  chatStarted = false;

  topics: string[] = [];

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: "I'm Sheria AI. I can help explain your legal rights — choose a topic below or type your question."
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ topics: string[] }>(`${API_BASE_URL}/api/topics`).subscribe({
      next: (res) => (this.topics = res.topics),
      error: (err) => console.error('Could not load topics from backend:', err)
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
    this.chatStarted = true;

    // Snapshot history BEFORE pushing the new user message, so the
    // backend gets prior turns only — used to detect follow-ups.
    const history = this.messages
      .slice(-8)
      .map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));

    this.messages.push({ from: 'user', text });

    this.http
      .post<{ reply: string }>(`${API_BASE_URL}/api/chat`, { message: text, history })
      .subscribe({
        next: (res) => this.messages.push({ from: 'bot', text: res.reply }),
        error: () =>
          this.messages.push({
            from: 'bot',
            text: "Sorry, I couldn't reach the server. It may be waking up from sleep — try again in a moment."
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
    }
  }
}
