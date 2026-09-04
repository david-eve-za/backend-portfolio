import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressRingComponent } from './progress-ring.component';
import { By } from '@angular/platform-browser';

describe('ProgressRingComponent', () => {
  let component: ProgressRingComponent;
  let fixture: ComponentFixture<ProgressRingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressRingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressRingComponent);
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

  it('should calculate circumference correctly', () => {
    fixture.componentRef.setInput('size', 'md');
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();
    // radius = 32, circumference = 2 * PI * (32 - 4) = 2 * PI * 28 ≈ 175.9
    expect(component.circumference()).toBeCloseTo(175.9, 0);
  });

  it('should calculate stroke dashoffset correctly', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    // dashoffset = circumference * (1 - 0.5) = circumference * 0.5
    expect(component.strokeDashoffset()).toBeCloseTo(component.circumference() * 0.5);
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg.nativeElement.getAttribute('width')).toBe('96'); // 48 * 2
  });

  it('should apply variant color', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const progressCircle = fixture.debugElement.queryAll(By.css('circle'))[1];
    expect(progressCircle.nativeElement.getAttribute('stroke')).toBe('var(--color-success)');
  });

  it('should show value text when enabled', () => {
    fixture.componentRef.setInput('showValue', true);
    fixture.componentRef.setInput('value', 75);
    fixture.detectChanges();
    const text = fixture.debugElement.query(By.css('text'));
    expect(text).toBeTruthy();
    expect(text.nativeElement.textContent).toContain('75%');
  });

  it('should have correct aria label', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg.nativeElement.getAttribute('aria-label')).toContain('50% complete');
  });

  it('should apply custom aria label', () => {
    fixture.componentRef.setInput('ariaLabel', 'Custom progress');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg.nativeElement.getAttribute('aria-label')).toBe('Custom progress');
  });
});