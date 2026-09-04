import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { By } from '@angular/platform-browser';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render unchecked by default', () => {
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.checked).toBe(false);
  });

  it('should render checked when value is true', () => {
    fixture.componentRef.setInput('value', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.checked).toBe(true);
  });

  it('should emit valueChange on change', () => {
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith(true);
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('should show indeterminate state', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.indeterminate).toBe(true);
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label span'));
    expect(label.nativeElement.textContent).toContain('Accept terms');
  });

  it('should show hint when provided', () => {
    fixture.componentRef.setInput('hint', 'You must agree');
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('p'));
    expect(hint.nativeElement.textContent).toContain('You must agree');
  });

  it('should apply label position left', () => {
    fixture.componentRef.setInput('labelPosition', 'left');
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.classList).toContain('flex-row-reverse');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBe(true);
    expect(input.nativeElement.classList).toContain('opacity-50');
  });

  it('should have correct aria attributes', () => {
    fixture.componentRef.setInput('ariaLabel', 'Custom label');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.getAttribute('aria-label')).toBe('Custom label');
  });
});