import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  sendMessage = output<string>();
  sendFile = output<File>();

  messageText = signal('');
  showEmojiPicker = signal(false);

  emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙌', '👏'];

  onSubmit() {
    const text = this.messageText().trim();
    if (text) {
      this.sendMessage.emit(text);
      this.messageText.set('');
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.sendFile.emit(input.files[0]);
      input.value = ''; // Reset input
    }
  }

  addEmoji(emoji: string) {
    this.messageText.set(this.messageText() + emoji);
    this.showEmojiPicker.set(false);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker.set(!this.showEmojiPicker());
  }
}
