import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { By } from '@angular/platform-browser';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage correctly', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    expect(component.percentage()).toBe(50);
  });

  it('should clamp percentage at 100', () => {
    fixture.componentRef.setInput('value', 150);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    expect(component.percentage()).toBe(100);
  });

  it('should clamp percentage at 0', () => {
    fixture.componentRef.setInput('value', -10);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    expect(component.percentage()).toBe(0);
  });

  it('should render progress bar with correct width', () => {
    fixture.componentRef.setInput('value', 75);
    fixture.detectChanges();
    const progress = fixture.debugElement.query(By.css('.h-full'));
    expect(progress.nativeElement.style.width).toBe('75%');
  });

  it('should show indeterminate animation', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    const pulse = fixture.debugElement.query(By.css('.animate-pulse'));
    expect(pulse).toBeTruthy();
  });

  it('should apply variant classes', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const progress = fixture.debugElement.query(By.css('.h-full'));
    expect(progress.nativeElement.classList).toContain('bg-success');
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('.relative'));
    expect(container.nativeElement.classList).toContain('h-4');
  });

  it('should show label inside when enabled', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('showLabel', true);
    fixture.componentRef.setInput('labelPosition', 'inside');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.absolute.right-2'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent).toContain('50%');
  });

  it('should show label outside when enabled', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('showLabel', true);
    fixture.componentRef.setInput('labelPosition', 'outside');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.text-xs.text-muted-foreground'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent).toContain('50%');
  });

  it('should have correct aria attributes', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('ariaLabel', 'Progress');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('[role="progressbar"]'));
    expect(container.nativeElement.getAttribute('aria-valuenow')).toBe('50');
    expect(container.nativeElement.getAttribute('aria-valuemin')).toBe('0');
    expect(container.nativeElement.getAttribute('aria-valuemax')).toBe('100');
  });

  it('should not show label inside when percentage too low', () => {
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('showLabel', true);
    fixture.componentRef.setInput('labelPosition', 'inside');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('.absolute.right-2'));
    expect(label).toBeFalsy();
  });
});