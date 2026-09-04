import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { By } from '@angular/platform-browser';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default spinner', () => {
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon).toBeTruthy();
    expect(lucideIcon.nativeElement.classList).toContain('animate-spin');
  });

  it('should render dots spinner', () => {
    fixture.componentRef.setInput('type', 'dots');
    fixture.detectChanges();
    const dots = fixture.debugElement.queryAll(By.css('.flex > div'));
    expect(dots.length).toBe(3);
  });

  it('should render bars spinner', () => {
    fixture.componentRef.setInput('type', 'bars');
    fixture.detectChanges();
    const bars = fixture.debugElement.queryAll(By.css('.flex > div'));
    expect(bars.length).toBe(4);
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.classList).toContain('h-12');
  });

  it('should have role status', () => {
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.getAttribute('role')).toBe('status');
  });

  it('should have aria-label when label provided', () => {
    fixture.componentRef.setInput('label', 'Loading data');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.getAttribute('aria-label')).toBe('Loading data');
  });
});