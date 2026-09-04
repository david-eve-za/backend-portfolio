import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { By } from '@angular/platform-browser';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tabs', () => {
    fixture.componentRef.setInput('tabs', [
      { id: '1', label: 'Tab 1' },
      { id: '2', label: 'Tab 2' },
    ]);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toContain('Tab 1');
    expect(buttons[1].nativeElement.textContent).toContain('Tab 2');
  });

  it('should show active tab', () => {
    fixture.componentRef.setInput('tabs', [
      { id: '1', label: 'Tab 1' },
      { id: '2', label: 'Tab 2' },
    ]);
    fixture.componentRef.setInput('value', '2');
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    expect(buttons[1].nativeElement.getAttribute('aria-selected')).toBe('true');
  });

  it('should emit valueChange on click', () => {
    fixture.componentRef.setInput('tabs', [
      { id: '1', label: 'Tab 1' },
      { id: '2', label: 'Tab 2' },
    ]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    buttons[1].nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).toHaveBeenCalledWith('2');
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('tabs', [
      { id: '1', label: 'Tab 1', disabled: true },
    ]);
    fixture.detectChanges();
    spyOn(component.valueChange, 'emit');
    const button = fixture.debugElement.query(By.css('[role="tab"]'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('should apply variant classes', () => {
    fixture.componentRef.setInput('variant', 'enclosed');
    fixture.componentRef.setInput('tabs', [{ id: '1', label: 'Tab 1' }]);
    fixture.detectChanges();
    const nav = fixture.debugElement.query(By.css('[role="tablist"]'));
    expect(nav.nativeElement.classList).toContain('bg-muted');
  });

  it('should apply orientation classes', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('tabs', [{ id: '1', label: 'Tab 1' }]);
    fixture.detectChanges();
    const nav = fixture.debugElement.query(By.css('[role="tablist"]'));
    expect(nav.nativeElement.classList).toContain('flex-col');
  });

  it('should show badge', () => {
    fixture.componentRef.setInput('tabs', [
      { id: '1', label: 'Tab 1', badge: 5 },
    ]);
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('.rounded-full'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('5');
  });

  it('should apply disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('tabs', [{ id: '1', label: 'Tab 1' }]);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('[role="tab"]'));
    expect(button.nativeElement.disabled).toBe(true);
    expect(button.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });
});