import { Component, AfterContentInit, Injector, forwardRef, Output, EventEmitter, Input } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ComponentUtils } from 'src/app/shared/services/component-utils';

@Component({
    selector: 'app-pool-form',
    templateUrl: './pool-form.component.html',
    styleUrls: ['./pool-form.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR, 
        useExisting: forwardRef(() => PoolFormComponent),
        multi: true     
    }]
})
export class PoolFormComponent implements ControlValueAccessor, AfterContentInit {

    @Input() poolForm: FormGroup;
    @Output() deletePoolOut: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() addParticipantOut: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Input() isSpeaker: Boolean = false;
    @Input() isJudge: Boolean = false;
    @Input() votesRecord: { [codeParticipant: string]: number } = {};

    constructor(
        private componentUtils: ComponentUtils,
        private injector: Injector,
        private formBuilder: FormBuilder,
    ) {}

    ngAfterContentInit() {
        if (!this.poolForm) {
            this.poolForm = this.componentUtils.getFormGroup(this.injector);
        }
    }

    propagateChange = (_: any) => {};

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched() {}

    writeValue(value: string): void {}

    setDisabledState?(isDisabled: boolean): void {}

    addParticipant() {
        this.addParticipantOut.emit(true);
    }

    deletePool() {
        this.deletePoolOut.emit(true);
    }

    deleteParticipant(i: number) {
        (this.poolForm.get('participants') as FormArray).controls.splice(i, 1);
    }

    get disabled(): boolean {
        return this.poolForm.disabled;
    }

    get participants(): FormArray {
        const array = this.poolForm.get('participants') as FormArray;
        return array;
    }

    valueChange(event: Event, id: string) {
        const value: number = (event.target as HTMLInputElement).value as any as number;
        if (value > 100) {
            this.votesRecord[id] = 100;
        } else if (value < 0) {
            this.votesRecord[id] = 0;
        } else if ((value * 100) % 1 !== 0) {
            this.votesRecord[id] = Math.floor(value * 100) / 100 ? Math.floor(value * 100) / 100 : 0;
        }
    }
};
