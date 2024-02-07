import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { ReportService } from './services/report.service';
import { FormControlPipe } from '@pipes/form-control/form-control.pipe';

@Component({
  selector: 'app-patient-care-plan-report-modal',
  templateUrl: './patient-care-plan-report-modal.page.html',
  styles: [
    `
      .md ion-textarea {
        padding-inline-start: 16px;
        padding-inline-end: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, FormControlPipe],
})
export class PatientCarePlanReportModalPage {
  public pdfObject!: pdfMake.TCreatedPdf;
  public form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private reportService: ReportService,
    public modalController: ModalController,
  ) {
    this.form = this.fb.group({
      body: [''],
    });
  }

  // Public methods
  public dowloadPdf(): void {
    this.reportService.createPdf(this.form.value.body);
    // this.modalController.dismiss();
  }
}
