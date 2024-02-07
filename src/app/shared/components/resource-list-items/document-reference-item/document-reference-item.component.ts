import { Component, Input } from '@angular/core';
import { IDocumentReference } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IDocumentReference';
import { getFileTypeIcon } from '@core/utils/fhir/resource-functions';
import { FileUrlPipe } from '@pipes/file-url/file-url.pipe';
import { NgIf, AsyncPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-document-reference-item',
  templateUrl: './document-reference-item.component.html',
  standalone: true,
  imports: [
    IonicModule,
    ExpandableDirective,
    RouterLink,
    NgIf,
    AsyncPipe,
    TitleCasePipe,
    FileUrlPipe,
  ],
})
export class DocumentReferenceItemComponent {
  @Input({ required: true }) documentReference!: IDocumentReference;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;

  public get fileTypeIcon(): string {
    return getFileTypeIcon(
      this.documentReference.content[0].attachment.contentType || '',
    );
  }
}
