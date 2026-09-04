import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { By } from '@angular/platform-browser';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render trigger with placeholder when no value', () => {
    fixture.componentRef.setInput('placeholder', 'Select...');
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger.nativeElement.textContent).toContain('Select...');
  });

  it('should show selected option label', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.componentRef.setInput('value', '1');
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger.nativeElement.textContent).toContain('Option 1');
  });

  it('should open dropdown on click', () => {
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    const dropdown = fixture.debugElement.query(By.css('.bt-select-dropdown'));
    expect(dropdown).toBeTruthy();
  });

  it('should emit valueChange when option selected', () => {
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const option = fixture.debugElement.queryAll(By.css('[role="option"]'))[0];
    option.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('1');
  });

  it('should close dropdown after selection in single mode', () => {
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    const option = fixture.debugElement.queryAll(By.css('[role="option"]'))[0];
    option.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should not close dropdown in multiple mode', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    const option = fixture.debugElement.queryAll(By.css('[role="option"]'))[0];
    option.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });

  it('should emit multiple values as comma-separated string', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const options = fixture.debugElement.queryAll(By.css('[role="option"]'));
    options[0].nativeElement.click();
    fixture.detectChanges();
    options[1].nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('1,2');
  });

  it('should show clear button when clearable and value exists', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', '1');
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    expect(clearBtn).toBeTruthy();
  });

  it('should emit empty value when clear clicked', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', '1');
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    clearBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
  });

  it('should filter options when searchable', () => {
    fixture.componentRef.setInput('searchable', true);
    fixture.componentRef.setInput('options', [
      { value: '1', label: 'Apple' },
      { value: '2', label: 'Banana' },
      { value: '3', label: 'Cherry' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
    searchInput.nativeElement.value = 'ap';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('[role="option"]'));
    expect(options.length).toBe(1);
    expect(options[0].nativeElement.textContent).toContain('Apple');
  });

  it('should render grouped options', () => {
    fixture.componentRef.setInput('groups', [
      { label: 'Fruits', options: [{ value: '1', label: 'Apple' }] },
      { label: 'Vegetables', options: [{ value: '2', label: 'Carrot' }] },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    const groupLabels = fixture.debugElement.queryAll(By.css('.text-xs.font-semibold'));
    expect(groupLabels.length).toBe(2);
    expect(groupLabels[0].nativeElement.textContent).toContain('Fruits');
    expect(groupLabels[1].nativeElement.textContent).toContain('Vegetables');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger.nativeElement.disabled).toBe(true);
  });

  it('should not open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('options', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });
});