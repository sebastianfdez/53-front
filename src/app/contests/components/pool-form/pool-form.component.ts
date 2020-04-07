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
    }],
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
        this.participants.insert(
            this.participants.length,
            this.formBuilder.group({
                name: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
                id: '',
                votes: [],
                club: this.formBuilder.control('', Validators.required),
                lastName: this.formBuilder.control('', Validators.required),
                licence: this.formBuilder.control('', Validators.required),
            }),
        );
        this.propagateChange(this.poolForm.value);
        this.poolForm.updateValueAndValidity();
    }

    deletePool() {
        this.deletePoolOut.emit(true);
    }

    deleteParticipant(i: number) {
        (this.poolForm.get('participants') as FormArray).removeAt(i);
    }

    get disabled(): boolean {
        return this.poolForm.disabled;
    }

    get participants(): FormArray {
        const array = this.poolForm.get('participants') as FormArray;
        return array;
    }
};
