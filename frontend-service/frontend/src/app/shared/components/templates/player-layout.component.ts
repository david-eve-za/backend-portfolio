import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause, FastForward, RotateCcw, List, Settings, ChevronDown, Minimize2, Maximize2, Heart, Repeat, Shuffle } from 'lucide-angular';

interface AudioChapter {
  id: string;
  number: number;
  title: string;
  duration: number;
  status: 'completed' | 'generating' | 'queued' | 'failed';
  audioUrl?: string;
}

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  previewUrl?: string;
}

@Component({
  selector: 'bt-player-layout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './player-layout.component.html',
  styleUrl: './player-layout.component.scss',
})
export class PlayerLayoutComponent {
  readonly chapters = input<AudioChapter[]>([]);
  readonly currentChapter = input<AudioChapter | null>(null);
  readonly availableVoices = input<Voice[]>([]);
  readonly selectedVoice = input<Voice | null>(null);
  readonly isPlaying = input(false);
  readonly currentTime = input(0);
  readonly duration = input(0);
  readonly playbackRate = input(1);
  readonly volume = input(1);
  readonly isMuted = input(false);
  readonly repeatMode = input<'off' | 'one' | 'all'>('off');
  readonly shuffle = input(false);
  readonly queueOpen = signal(true);
  readonly minimized = signal(false);

  readonly VolumeIcon = Volume2;
  readonly VolumeXIcon = VolumeX;
  readonly SkipBackIcon = SkipBack;
  readonly SkipForwardIcon = SkipForward;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly FastForwardIcon = FastForward;
  readonly RotateCcwIcon = RotateCcw;
  readonly ListIcon = List;
  readonly SettingsIcon = Settings;
  readonly ChevronDownIcon = ChevronDown;
  readonly MinimizeIcon = Minimize2;
  readonly MaximizeIcon = Maximize2;
  readonly HeartIcon = Heart;
  readonly RepeatIcon = Repeat;
  readonly ShuffleIcon = Shuffle;

  readonly progress = computed(() => {
    const dur = this.duration();
    return dur > 0 ? (this.currentTime() / dur) * 100 : 0;
  });

  readonly formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this.duration()));

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}