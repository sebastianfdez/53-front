import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { MinimalMaterialModule } from '../shared/minimal-material.module';

@NgModule({
    imports: [
        CommonModule,
        MinimalMaterialModule,
        RouterModule,
    ],
    declarations: [
        LanguageSelectorComponent,
    ],
    exports: [
        LanguageSelectorComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LanguagesModule {}
