import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { By } from '@angular/platform-browser';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render trigger with placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Select...');
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger.nativeElement.textContent).toContain('Select...');
  });

  it('should open on click', fakeAsync(() => {
    fixture.componentRef.setInput('items', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    const menu = fixture.debugElement.query(By.css('[role="listbox"]'));
    expect(menu).toBeTruthy();
  });

  it('should close on escape', fakeAsync(() => {
    fixture.componentRef.setInput('items', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    tick();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should select item', fakeAsync(() => {
    fixture.componentRef.setInput('items', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');
    const items = fixture.debugElement.queryAll(By.css('[role="option"]'));
    items[0].nativeElement.click();
    tick();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('1');
    expect(component.isOpen()).toBe(false);
  });

  it('should show clear button when clearable', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', '1');
    fixture.componentRef.setInput('items', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    expect(clearBtn).toBeTruthy();
  });

  it('should emit empty when clear clicked', () => {
    fixture.componentRef.setInput('clearable', true);
    fixture.componentRef.setInput('value', '1');
    fixture.componentRef.setInput('items', [{ value: '1', label: 'Option 1' }]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const clearBtn = fixture.debugElement.query(By.css('button[aria-label*="Clear"]'));
    clearBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('');
  });

  it('should filter items when searchable', fakeAsync(() => {
    fixture.componentRef.setInput('searchable', true);
    fixture.componentRef.setInput('items', [
      { value: '1', label: 'Apple' },
      { value: '2', label: 'Banana' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
    searchInput.nativeElement.value = 'ap';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    tick();
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('[role="option"]'));
    expect(options.length).toBe(1);
    expect(options[0].nativeElement.textContent).toContain('Apple');
  });

  it('should support multiple selection', fakeAsync(() => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('items', [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();

    spyOn(component.valueChange, 'emit');
    const options = fixture.debugElement.queryAll(By.css('[role="option"]'));
    options[0].nativeElement.click();
    tick();
    fixture.detectChanges();
    options[1].nativeElement.click();
    tick();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('1,2');
  });

  it('should show disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    expect(trigger.nativeElement.disabled).toBe(true);
  });

  it('should render divider', fakeAsync(() => {
    fixture.componentRef.setInput('items', [
      { value: '1', label: 'Option 1' },
      { divider: true },
      { value: '2', label: 'Option 2' },
    ]);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.css('button'));
    trigger.nativeElement.click();
    tick();
    fixture.detectChanges();
    const divider = fixture.debugElement.query(By.css('.border-t'));
    expect(divider).toBeTruthy();
  });
});