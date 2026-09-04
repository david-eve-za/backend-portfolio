import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { LucideIconData } from 'lucide-angular';
import { By } from '@angular/platform-browser';

const mockIcon: LucideIconData = {
  name: 'test',
  attrs: { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' },
  tags: [],
  paths: ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5'],
};

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('img', mockIcon);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render lucide-icon with provided img', () => {
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon).toBeTruthy();
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 32);
    fixture.detectChanges();
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.classList).toContain('h-8');
    expect(lucideIcon.nativeElement.classList).toContain('w-8');
  });

  it('should apply spin animation', () => {
    fixture.componentRef.setInput('spin', true);
    fixture.detectChanges();
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.classList).toContain('animate-spin');
  });

  it('should apply pulse animation', () => {
    fixture.componentRef.setInput('pulse', true);
    fixture.detectChanges();
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.classList).toContain('animate-pulse');
  });

  it('should apply custom class', () => {
    fixture.componentRef.setInput('class', 'custom-class');
    fixture.detectChanges();
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.classList).toContain('custom-class');
  });

  it('should have aria-hidden', () => {
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have stroke-width 2', () => {
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.getAttribute('stroke-width')).toBe('2');
  });

  it('should have stroke-linecap round', () => {
    const lucideIcon = fixture.debugElement.query(By.css('lucide-icon'));
    expect(lucideIcon.nativeElement.getAttribute('stroke-linecap')).toBe('round');
  });
});