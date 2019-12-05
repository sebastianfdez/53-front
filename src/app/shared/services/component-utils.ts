import {
    Injectable, Injector, Type
} from '@angular/core';
import { ControlContainer, FormControl, FormControlName, FormGroupDirective, FormGroupName, FormGroup } from '@angular/forms';
import { SnackBarService } from './snack-bar.service';

@Injectable()
export class ComponentUtils {

    constructor(
        private snackBarService: SnackBarService,
    ) {
    }

    getFormControl(injector: Injector, test: boolean): FormControl {
        const formControl = injector.get(FormControl, null);
        if (formControl) {
            return formControl;
        } else {
            const controlContainer = injector.get<ControlContainer>(ControlContainer as Type<ControlContainer>);
            const formControlNameDir = injector.get(FormControlName, null);
            if (formControlNameDir && controlContainer instanceof FormGroupDirective) {
                return controlContainer.getControl(formControlNameDir);
            } else if (formControlNameDir && (controlContainer as FormGroupName)) {
                return ((controlContainer.control as FormGroup).controls[formControlNameDir.name] as FormControl);
            } else {
                const fc = new FormControl('');
                fc.disable();
                return fc;
            }
        }
    }

    getFormGroup(injector: Injector): FormGroup {
        const formGroupName: FormGroupName = injector.get<FormGroupName>(FormGroupName, null);
        return formGroupName ? formGroupName.control : new FormGroup({});
    }

    isObjectEmpty(obj: any) {
      Object.keys(obj).forEach((key) => {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      });
      return true;
    }

    validateEmail(email: string) {
      // tslint:disable-next-line: max-line-length
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    // Copy text to clipboard
    copyText(val: string) {
      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = val;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
      this.snackBarService.showMessage('Lien copié dans le presse-papiers');
    }
}
