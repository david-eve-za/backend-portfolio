import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-angular';

export interface WizardStep {
  id: string;
  label: string;
  icon?: any;
  optional?: boolean;
}

@Component({
  selector: 'bt-wizard-layout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './wizard-layout.component.html',
  styleUrl: './wizard-layout.component.scss',
})
export class WizardLayoutComponent {
  readonly steps = input<WizardStep[]>([]);
  readonly currentStep = input.required<string>();
  readonly canGoNext = input(true);
  readonly canGoBack = input(true);
  readonly isLoading = input(false);
  readonly showStepNumbers = input(true);

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly CheckIcon = Check;
  readonly AlertIcon = AlertCircle;
  readonly LoaderIcon = Loader2;

  readonly currentIndex = computed(() => {
    const steps = this.steps();
    return steps.findIndex(s => s.id === this.currentStep());
  });

  readonly nextStep = computed(() => {
    const idx = this.currentIndex();
    const steps = this.steps();
    return idx >= 0 && idx < steps.length - 1 ? steps[idx + 1].id : null;
  });

  readonly prevStep = computed(() => {
    const idx = this.currentIndex();
    return idx > 0 ? this.steps()[idx - 1].id : null;
  });

  readonly isFirstStep = computed(() => this.currentIndex() === 0);
  readonly isLastStep = computed(() => {
    const idx = this.currentIndex();
    return idx === this.steps().length - 1;
  });

  readonly progress = computed(() => {
    const idx = this.currentIndex();
    const total = this.steps().length;
    return total > 0 ? ((idx + 1) / total) * 100 : 0;
  });
}