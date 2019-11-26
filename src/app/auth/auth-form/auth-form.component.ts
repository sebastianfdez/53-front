import { Component, OnInit, AfterContentInit, Injector, forwardRef, Input } from '@angular/core';
import { ComponentUtils } from '../../shared/services/component-utils';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AuthFormComponent),
    }
  ]
})
export class AuthFormComponent implements ControlValueAccessor, OnInit, AfterContentInit {

  @Input() authFormGroup: FormGroup;
  @Input() types: string[] = [];

  constructor(
    private injector: Injector,
    private componentUtils: ComponentUtils,
  ) { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    if (!this.authFormGroup) {
      this.authFormGroup = (this.componentUtils.getFormGroup(this.injector).controls.projectMainInfo as FormGroup);
    }
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  writeValue(value: string): void {}

  setDisabledState?(isDisabled: boolean): void {}

}
