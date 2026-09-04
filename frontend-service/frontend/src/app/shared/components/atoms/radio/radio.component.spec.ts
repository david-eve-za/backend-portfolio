import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent } from './radio.component';
import { By } from '@angular/platform-browser';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render options', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.css('label'));
    expect(labels.length).toBe(2);
  });

  it('should show selected option', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.componentRef.setInput('value', '1');
    fixture.detectChanges();
    const checkedInput = fixture.debugElement.query(By.css('input:checked'));
    expect(checkedInput).toBeTruthy();
  });

  it('should emit valueChange when option selected', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    inputs[1].nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('2');
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('should not emit when option disabled', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1', disabled: true },
    ]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('should render card variant', () => {
    fixture.componentRef.setInput('card', true);
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.p-4.border'));
    expect(card).toBeTruthy();
  });

  it('should render label', () => {
    fixture.componentRef.setInput('label', 'Choose one');
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label:first-of-type'));
    expect(label.nativeElement.textContent).toContain('Choose one');
  });

  it('should show hint', () => {
    fixture.componentRef.setInput('hint', 'Select an option');
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('p'));
    expect(hint).toBeTruthy();
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBe(true);
  });

  it('should show required indicator', () => {
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('label', 'Choose');
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('label:first-of-type'));
    expect(label.nativeElement.textContent).toContain('*');
  });
});