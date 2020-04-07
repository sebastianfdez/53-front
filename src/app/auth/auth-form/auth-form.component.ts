/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Component, AfterContentInit, Injector, forwardRef, Input,
} from '@angular/core';
import { FormGroup, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentUtils } from '../../shared/services/component-utils';

@Component({
    selector: 'app-auth-form',
    templateUrl: './auth-form.component.html',
    styleUrls: ['./auth-form.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            // eslint-disable-next-line no-use-before-define
            useExisting: forwardRef(() => AuthFormComponent),
        },
    ],
})
export class AuthFormComponent implements ControlValueAccessor, AfterContentInit {
    @Input() authFormGroup: FormGroup;

    @Input() types: string[] = [];

    minDate = new Date();

    constructor(
        private injector: Injector,
        private componentUtils: ComponentUtils,
    ) { }

    ngAfterContentInit() {
        if (!this.authFormGroup) {
            this.authFormGroup = (
                this.componentUtils
                    .getFormGroup(this.injector).controls.projectMainInfo as FormGroup
            );
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
