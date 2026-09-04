import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input with placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.placeholder).toBe('Enter text');
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('Email');
  });

  it('should show required asterisk when required', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('*');
  });

  it('should emit valueChange on input', () => {
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'test';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('test');
  });

  it('should show error message when error is provided', () => {
    fixture.componentRef.setInput('error', 'Invalid email');
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.css('p.text-error'));
    expect(error.nativeElement.textContent).toContain('Invalid email');
  });

  it('should show hint when hint is provided and no error', () => {
    fixture.componentRef.setInput('hint', 'Enter your email');
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('p.text-muted-foreground'));
    expect(hint.nativeElement.textContent).toContain('Enter your email');
  });

  it('should not show hint when error is present', () => {
    fixture.componentRef.setInput('hint', 'Enter your email');
    fixture.componentRef.setInput('error', 'Invalid email');
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('p.text-muted-foreground'));
    expect(hint).toBeFalsy();
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBe(true);
    expect(input.nativeElement.classList).toContain('opacity-50');
  });

  it('should show clear button when clearable and value exists', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', 'test');
    fixture.detectChanges();
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    expect(clearBtn).toBeTruthy();
  });

  it('should emit empty value when clear button clicked', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', 'test');
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    clearBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
  });

  it('should apply error styling when error exists', () => {
    fixture.componentRef.setInput('error', 'Invalid');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.getAttribute('aria-invalid')).toBe('true');
    expect(input.nativeElement.classList).toContain('border-error');
  });

  it('should emit blur event', () => {
    spyOn(component.blur, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(component.blur.emit).toHaveBeenCalled();
  });

  it('should emit focus event', () => {
    spyOn(component.focus, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.focus.emit).toHaveBeenCalled();
  });
});