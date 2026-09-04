import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default variant (primary)', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('bg-primary');
  });

  it('should apply variant classes correctly', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('bg-secondary');
  });

  it('should apply size classes correctly', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('h-12');
  });

  it('should emit clicked event on click', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit clicked when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should show loader when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const loader = fixture.debugElement.query(By.css('lucide-icon'));
    expect(loader).toBeTruthy();
  });

  it('should apply fullWidth class when true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.classList).toContain('w-full');
  });

  it('should have correct aria attributes when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('should have correct aria attributes when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-busy')).toBe('true');
  });
});