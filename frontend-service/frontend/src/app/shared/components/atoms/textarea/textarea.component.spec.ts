import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';
import { By } from '@angular/platform-browser';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Enter text');
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.placeholder).toBe('Enter text');
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Description');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label'));
    expect(label.nativeElement.textContent).toContain('Description');
  });

  it('should emit valueChange on input', () => {
    spyOn(component.valueChange, 'emit');
    const textarea = fixture.debugElement.query(By.css('textarea'));
    textarea.nativeElement.value = 'test content';
    textarea.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('test content');
  });

  it('should show error message when error is provided', () => {
    fixture.componentRef.setInput('error', 'Too short');
    fixture.detectChanges();
    const error = fixture.debugElement.query(By.css('p.text-error'));
    expect(error.nativeElement.textContent).toContain('Too short');
  });

  it('should show char count when enabled', () => {
    fixture.componentRef.setInput('showCharCount', true);
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();
    const count = fixture.debugElement.query(By.css('[id$="-count"]'));
    expect(count.nativeElement.textContent).toContain('5');
  });

  it('should show max length in char count when set', () => {
    fixture.componentRef.setInput('showCharCount', true);
    fixture.componentRef.setInput('maxLength', 100);
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();
    const count = fixture.debugElement.query(By.css('[id$="-count"]'));
    expect(count.nativeElement.textContent).toContain('5 / 100');
  });

  it('should show error color when at max length', () => {
    fixture.componentRef.setInput('showCharCount', true);
    fixture.componentRef.setInput('maxLength', 5);
    fixture.componentRef.setInput('value', 'hello');
    fixture.detectChanges();
    const count = fixture.debugElement.query(By.css('[id$="-count"]'));
    expect(count.nativeElement.classList).toContain('text-error');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.disabled).toBe(true);
  });

  it('should apply readonly state', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(By.css('textarea'));
    expect(textarea.nativeElement.readOnly).toBe(true);
  });

  it('should emit blur event', () => {
    spyOn(component.blur, 'emit');
    const textarea = fixture.debugElement.query(By.css('textarea'));
    textarea.nativeElement.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(component.blur.emit).toHaveBeenCalled();
  });

  it('should emit focus event', () => {
    spyOn(component.focus, 'emit');
    const textarea = fixture.debugElement.query(By.css('textarea'));
    textarea.nativeElement.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(component.focus.emit).toHaveBeenCalled();
  });
});