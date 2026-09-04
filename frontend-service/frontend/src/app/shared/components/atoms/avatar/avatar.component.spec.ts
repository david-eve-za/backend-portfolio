import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';
import { By } from '@angular/platform-browser';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render image when src provided', () => {
    fixture.componentRef.setInput('src', '/avatar.png');
    fixture.componentRef.setInput('alt', 'User');
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('/avatar.png');
  });

  it('should render initials when no src', () => {
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    const fallback = fixture.debugElement.query(By.css('div > div'));
    expect(fallback.nativeElement.textContent).toContain('JD');
  });

  it('should show question mark when no name', () => {
    fixture.detectChanges();
    const fallback = fixture.debugElement.query(By.css('div > div'));
    expect(fallback.nativeElement.textContent).toContain('?');
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('div'));
    expect(avatar.nativeElement.classList).toContain('w-12');
  });

  it('should show status indicator when status provided', () => {
    fixture.componentRef.setInput('status', 'online');
    fixture.detectChanges();
    const status = fixture.debugElement.query(By.css('span'));
    expect(status).toBeTruthy();
    expect(status.nativeElement.classList).toContain('bg-success');
  });

  it('should hide status when none', () => {
    fixture.componentRef.setInput('status', 'none');
    fixture.detectChanges();
    const status = fixture.debugElement.query(By.css('span'));
    expect(status).toBeFalsy();
  });

  it('should apply status size based on avatar size', () => {
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('status', 'online');
    fixture.detectChanges();
    const status = fixture.debugElement.query(By.css('span'));
    expect(status.nativeElement.classList).toContain('w-4');
  });

  it('should generate background color from name', () => {
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    expect(component.bgColor()).toMatch(/^hsl\(/);
  });

  it('should apply square shape when specified', () => {
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('div'));
    expect(avatar.nativeElement.classList).toContain('rounded-md');
  });

  it('should apply circle shape by default', () => {
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('div'));
    expect(avatar.nativeElement.classList).toContain('rounded-full');
  });
});