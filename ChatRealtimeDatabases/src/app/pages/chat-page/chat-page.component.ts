import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ChatListComponent } from '../../components/chat-list/chat-list.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatListComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class ChatPageComponent {
}
