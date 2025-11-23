import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'chat',
    component: ChatPageComponent,
    children: [
      { path: ':id', component: ChatRoomComponent }
    ]
  },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];
