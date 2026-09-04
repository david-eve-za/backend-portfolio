import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { By } from '@angular/platform-browser';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', 'Tooltip text');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show tooltip initially', () => {
    const tooltip = fixture.debugElement.query(By.css('[role="tooltip"]'));
    expect(tooltip).toBeFalsy();
  });

  it('should show tooltip after delay on mouseenter', fakeAsync(() => {
    fixture.componentRef.setInput('delay', 100);
    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement;
    host.dispatchEvent(new Event('mouseenter'));
    tick(50);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="tooltip"]'))).toBeFalsy();

    tick(100);
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('[role="tooltip"]'));
    expect(tooltip).toBeTruthy();
    expect(tooltip.nativeElement.textContent).toContain('Tooltip text');
  }));

  it('should hide tooltip after delay on mouseleave', fakeAsync(() => {
    fixture.componentRef.setInput('delay', 100);
    fixture.componentRef.setInput('hideDelay', 50);
    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement;
    host.dispatchEvent(new Event('mouseenter'));
    tick(150);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="tooltip"]'))).toBeTruthy();

    host.dispatchEvent(new Event('mouseleave'));
    tick(25);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="tooltip"]'))).toBeTruthy();

    tick(50);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="tooltip"]'))).toBeFalsy();
  });

  it('should respect disabled state', fakeAsync(() => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement;
    host.dispatchEvent(new Event('mouseenter'));
    tick(150);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="tooltip"]'))).toBeFalsy();
  });

  it('should apply position classes', () => {
    fixture.componentRef.setInput('position', 'bottom');
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('[role="tooltip"]'));
    expect(tooltip.nativeElement.classList).toContain('top-full');
  });

  it('should render content', fakeAsync(() => {
    fixture.componentRef.setInput('delay', 0);
    fixture.detectChanges();
    const host = fixture.debugElement.nativeElement;
    host.dispatchEvent(new Event('mouseenter'));
    tick();
    fixture.detectChanges();
    const tooltip = fixture.debugElement.query(By.css('[role="tooltip"]'));
    expect(tooltip.nativeElement.textContent).toContain('Tooltip text');
  });
});