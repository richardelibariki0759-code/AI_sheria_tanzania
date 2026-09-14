import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const API_BASE_URL = 'http://127.0.0.1:5000';

@Component({
  selector: 'app-sheria-chat-widget',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './sheria-chat-widget.html',
  styleUrl: './sheria-chat-widget.scss'
})
export class SheriaChatWidget implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollArea') private scrollArea!: ElementRef<HTMLDivElement>;

  isOpen = true;
  isExpanded = true;
  draftMessage = '';
  isTyping = false;

  topics: string[] = [];

  messages: ChatMessage[] = [
    {
      from: 'bot',
      text: "I'm Sheria AI. I can help explain your legal rights — choose a topic below or type your question."
    }
  ];

  constructor(private http: HttpClient) {}

  private readonly handleViewportResize = (): void => this.updateKeyboardOffset();

  ngOnInit(): void {
    this.http.get<{ topics: string[] }>(`${API_BASE_URL}/api/topics`).subscribe({
      next: (res) => (this.topics = res.topics),
      error: (err) => console.error('Failed to load topics from backend:', err)
    });

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleViewportResize);
      window.visualViewport.addEventListener('scroll', this.handleViewportResize);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleViewportResize);
      window.visualViewport.removeEventListener('scroll', this.handleViewportResize);
    }
  }

  private updateKeyboardOffset(): void {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }
    const keyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    document.documentElement.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);
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

  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  private sendToBackend(text: string): void {
    this.messages.push({ from: 'user', text });
    this.isTyping = true;

    this.http
      .post<{ reply: string }>(`${API_BASE_URL}/api/chat`, { message: text })
      .subscribe({
        next: (res) => {
          this.isTyping = false;
          this.messages.push({ from: 'bot', text: res.reply });
        },
        error: () => {
          this.isTyping = false;
          this.messages.push({
            from: 'bot',
            text: "Sorry, I couldn't reach the server. Is the Flask app running?"
          });
        }
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
