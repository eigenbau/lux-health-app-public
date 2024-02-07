import { Injectable } from '@angular/core';
import { format, formatDistance, parseISO } from 'date-fns';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  Content,
  ContentStack,
  ContentTable,
  ContentText,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { combineLatest, firstValueFrom, map } from 'rxjs';
import { LOGO_URL } from '@core/config/person.constants';
import { FileSystemService } from '@core/file-system/file-system.service';
import { PatientCarePlanStateService } from '@core/state/patient-care-plan-state.service';
import { PatientConditionStateService } from '@core/state/patient-condition-state.service';
import { PatientGoalStateService } from '@core/state/patient-goal-state.service';
import { PatientStateService } from '@core/state/patient-state.service';
import { arrayHasValue } from '@core/utils/object-functions';
import {
  formatBodySite,
  getGoalTitle,
  getReferencedResource,
} from '@core/utils/fhir/resource-functions';

import {
  basicTableLayout,
  color,
  defaultStyle,
  footer,
  footerTableLayout,
  header,
  pageMargins,
  pageOrientation,
  pageSize,
  section,
  styles,
} from './../configs/pdf-make-config';
import { getInitials } from '@core/utils/fhir/person-functions';
import { PatientObservationStateService } from '@core/state/patient-observation-state.service';
import {
  buildCategories,
  getTimeOfObservation,
} from '@core/utils/fhir/observation-functions';
import { ObservationBundle } from '@models/observation.model';
import { PatientProcedureStateService } from '@core/state/patient-procedure-state.service';

const vfs = pdfFonts.pdfMake.vfs;
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  public pdfObject!: pdfMake.TCreatedPdf;

  constructor(
    private fileSystem: FileSystemService,
    private patientState: PatientStateService,
    private patientConditionState: PatientConditionStateService,
    private patientProcedureState: PatientProcedureStateService,
    private patientCarePlanState: PatientCarePlanStateService,
    private patientGoalState: PatientGoalStateService,
    private patientObservationState: PatientObservationStateService,
  ) {}

  // Public methods
  public async createPdf(bodyText: string = ''): Promise<void> {
    const logo = await this.fileSystem.loadLocalAssetToBase64(LOGO_URL);
    const patient = await firstValueFrom(this.patientState.patient$);
    if (!patient) {
      throw new Error('Unable to get a valid IPatient value');
    }
    const content = await this.getContent(bodyText);

    const fileName = await this.buildPdfFileName();

    const docDefinition: TDocumentDefinitions = {
      pageSize,
      pageOrientation,
      pageMargins,
      header: header(logo, patient),
      content,
      footer,
      styles,
      defaultStyle,
    };

    this.pdfObject = pdfMake.createPdf(
      docDefinition,
      { basicTableLayout, footerTableLayout },
      undefined,
      vfs,
    );
    this.pdfObject.download(fileName);
  }

  // Private methods
  private async getContent(bodyText: string = ''): Promise<Content> {
    const body: Content = bodyText
      ? [{ text: bodyText, margin: section.margin.regular }]
      : '';

    const conditions = await this.buildConditionSectionContent();
    const procedures = await this.buildProceduresSectionContent();
    const carePlan = await this.buildCarePlanSectionContent();
    const carePlanGoals = await this.buildCarePlanGoalsSectionContent();
    const carePlanActivities =
      await this.buildCarePlanActivitiesSectionContent();
    const observations = await this.buildObservationSectionContent();

    const content: Content = [
      body,
      conditions,
      procedures,
      carePlan,
      carePlanGoals,
      carePlanActivities,
      observations,
    ];

    return content;
  }

  // Content section methods
  // - Conditions
  private async buildConditionSectionContent(): Promise<Content> {
    const conditions = await firstValueFrom(
      this.patientConditionState.conditionList$,
    );
    if (!conditions) {
      return [];
    }
    const conditionText: ContentText[] = conditions.map((c) => {
      const code = c.code?.coding?.[0].display;
      const clinicalStatus = `Clinical status: ${c.clinicalStatus?.coding?.[0].display}`;
      const verificationStatus = `Verification status: ${c.verificationStatus?.coding?.[0].display}`;
      const bodySite = !arrayHasValue(c?.bodySite)
        ? ''
        : c.bodySite?.[0].coding?.[0].display;
      const onset = c?.onsetDateTime
        ? `Onset: ${format(parseISO(c.onsetDateTime), 'MMM d, y')}`
        : '';
      const abatement = c?.abatementDateTime
        ? `Abatement: ${format(parseISO(c.abatementDateTime), 'MMM d, y')}`
        : '';
      const note = !arrayHasValue(c?.note) ? '' : c.note?.[0].text;

      const title = [code, bodySite, note].filter(Boolean).join(' • ');
      const details = [clinicalStatus, verificationStatus, onset, abatement]
        .filter(Boolean)
        .join(' • ');

      return this.buildLineItem(title, details);
    });

    return [
      {
        stack: [this.buildDividerHeader('Problem list')],
        margin: section.margin.section,
      },
      { ul: [...conditionText] },
    ];
  }

  // - Procedures (Historical)
  private async buildProceduresSectionContent(): Promise<Content> {
    const procedures = await firstValueFrom(
      this.patientProcedureState.historicalProcedures$,
    );
    const procedureText: ContentText[] = procedures?.map((p) => {
      const code = p.code?.coding?.[0].display;
      const date = p?.performedPeriod?.start
        ? `Performed: ${format(
            parseISO(p?.performedPeriod?.start.toString()),
            'MMM d, y',
          )}`
        : '';
      const bodySite = !arrayHasValue(p?.bodySite)
        ? ''
        : p.bodySite?.[0].coding?.[0].display;
      const category = `Category: ${p?.category?.coding?.[0]?.display}`;
      const note = !arrayHasValue(p?.note) ? '' : p.note?.[0].text;

      const title = [code, bodySite].filter(Boolean).join(' • ');
      const details = [date, category, note].filter(Boolean).join(' • ');
      return this.buildLineItem(title, details);
    });

    return procedures?.length > 0
      ? [
          {
            stack: [this.buildDividerHeader('Historical Procedures')],
            margin: section.margin.section,
          },
          { ul: [...procedureText] },
        ]
      : '';
  }

  // - Care plan
  private async buildCarePlanSectionContent(): Promise<Content> {
    const carePlan = await firstValueFrom(this.patientCarePlanState.carePlan$);
    const title =
      carePlan.status === 'draft' ? 'Care plan - Draft' : 'Care plan';
    const status = `Status: ${carePlan.status}`;
    const start = `Start: ${format(
      parseISO(carePlan?.period?.start?.toString() || ''),
      'MMM d, y',
    )}`;
    const end = `End: ${format(
      parseISO(carePlan?.period?.end?.toString() || ''),
      'MMM d, y',
    )}`;
    const duration = `Duration: ${formatDistance(
      parseISO(carePlan?.period?.start?.toString() || ''),
      parseISO(carePlan?.period?.end?.toString() || ''),
    )}`;
    const paragraph = [status, start, end, duration].join(' • ');
    return [
      {
        stack: [this.buildDividerHeader(title)],
        margin: section.margin.section,
      },
      paragraph,
    ];
  }

  private async buildCarePlanGoalsSectionContent(): Promise<Content> {
    const referencedGoals = await firstValueFrom(
      combineLatest([
        this.patientCarePlanState.goalReferencesFromAllActivities$,
        this.patientGoalState.goalList$,
      ]).pipe(
        map(([references, goals]) =>
          references.map((r) => getReferencedResource(r.reference, goals)),
        ),
      ),
    );

    const goalText: ContentText[] = referencedGoals.map((goal) => {
      const lifecycleStatus = `Lifecycle: ${goal?.lifecycleStatus}`;
      const achievementStatus = goal?.achievementStatus
        ? `Achievement status: ${goal?.achievementStatus?.coding?.[0]?.display}`
        : '';
      const note = !arrayHasValue(goal?.note) ? '' : goal?.note?.[0].text;

      const title = getGoalTitle(goal);
      const details = [lifecycleStatus, achievementStatus, note]
        .filter(Boolean)
        .join(' • ');
      return this.buildLineItem(title, details);
    });

    return [
      {
        text: '# Goals',
        style: 'h1',
        margin: section.margin.h1,
      },
      { ul: [...goalText], margin: section.margin.regular },
    ];
  }

  private async buildCarePlanActivitiesSectionContent(): Promise<Content> {
    const activities = await firstValueFrom(
      this.patientCarePlanState.carePlan$.pipe(
        map((carePlan) => carePlan.activity),
      ),
    );
    const goalList = await firstValueFrom(this.patientGoalState.goalList$);

    const activityText: ContentText[] =
      activities?.map((activity) => {
        const title = activity.detail?.code?.coding?.[0].display;
        const description = activity?.detail?.description;
        const status = `Status: ${activity.detail?.status}`;
        const goals = `Goals: ${(activity?.detail?.goal || [])
          .map((g) =>
            getGoalTitle(getReferencedResource(g.reference, goalList)),
          )
          .join(', ')}`;

        const details = [description, status, goals]
          .filter(Boolean)
          .join(' • ');
        return this.buildLineItem(title || '', details);
      }) || [];

    return [
      {
        text: '# Activities',
        style: 'h1',
        margin: section.margin.h1,
      },
      { ul: [...activityText], margin: section.margin.regular },
    ];
  }

  // - Observation
  private async buildObservationSectionContent(): Promise<Content> {
    const observationList = await firstValueFrom(
      this.patientObservationState.observationBundleList$,
    );
    const observationBundlesByCategories = buildCategories(observationList);

    const categoryContent = observationBundlesByCategories.map(
      (observationBundles, i) => {
        const category = observationBundles.code?.coding?.[0].display;
        const observationBundleContentArray =
          observationBundles?.observations?.map((bundle, index) =>
            this.buildObservationBundleContent(bundle, index),
          ) || [];

        const content: Content = [
          {
            text: `# ${category}`,
            style: 'h1',
            margin:
              i === 0 ? section.margin.h1FirstInSection : section.margin.h1,
          },
          ...observationBundleContentArray,
        ];
        return content;
      },
    );

    return [
      {
        stack: [this.buildDividerHeader('Observations')],
        margin: section.margin.section,
      },
      ...categoryContent,
    ];
  }

  private buildObservationBundleContent(
    bundle: ObservationBundle,
    index = 0,
  ): ContentStack {
    if (
      !bundle.values ||
      bundle.values.length === 0 ||
      !bundle.observations ||
      bundle.observations.length === 0
    ) {
      throw new Error('No bundle.values or bundle.observations available');
    }
    const limit = 6;
    const dates = bundle.observations.map((o) =>
      parseISO(getTimeOfObservation(o)).getTime(),
    );
    const recentDates = dates?.slice(0, limit) || [];
    const moreDates: TableCell[] =
      dates && dates.length > recentDates.length
        ? [
            {
              text: `~\nShowing only ${limit} most recent findings. There are ${dates.length} findings in total.`,
              colSpan: bundle.values.length + 2,
              style: ['center', 'italic', 'lightColor'],
            },
            ...bundle.values.map(() => ''),
            '',
          ]
        : [];

    // FIXME: Observation series is found by datetime stamp
    // This is an ambiguous solution, prone to error
    // If 2+ entries have the same timestamp, the first will be selected

    // Table rows
    const tableRows: TableCell[][] = recentDates.map((d) => [
      { text: format(d, 'MMM d, y'), style: ['tableRow'] },
      // 'Notes' col
      {
        text:
          (bundle.observations
            ? bundle.observations.find(
                (o) => parseISO(getTimeOfObservation(o)).getTime() === d,
              )
            : { note: [] }
          )?.note?.[0]?.text || '-',
        style: ['tableRow'],
      },
      // 'Value' cols
      ...(bundle.values
        ? bundle.values.map((vg) => ({
            text:
              vg.series.find(({ datetime = '' }) => +datetime === d)?.value ||
              '-',
            style: vg.type === 'number' ? ['end', 'tableRow'] : ['tableRow'],
          }))
        : []),
    ]);

    // NOTE: Be sure to match number of cols for all rows
    const table: ContentTable = {
      table: {
        dontBreakRows: true,
        headerRows: 2,
        widths: [
          80, // 'Dates' col
          'auto', // 'Notes' col
          ...bundle.values.map((_, i, v) =>
            i === 0 || v.length === 1 ? '*' : 'auto',
          ),
        ],
        body: [
          // Table title row
          [
            {
              text: bundle.code?.coding?.[0].display,

              style: 'h2',
              colSpan: bundle.values.length + 2, // +2 to account for 'Date' and 'Notes' cols
            },
            ...bundle.values.map(() => ''),
            '',
          ],
          // Table col header row
          [
            { text: 'Date', style: ['tableHeader'] },
            { text: 'Notes', style: ['tableHeader'] },
            ...bundle.values.map((v) =>
              v?.type === 'number'
                ? {
                    text: `${[v.codeDisplay, formatBodySite(v?.bodySite || '')]
                      .filter(Boolean)
                      .join(' • ')} (${v.unit})`,
                    style: ['end', 'tableHeader'],
                  }
                : { text: 'Findings', style: ['tableHeader'] },
            ),
          ],
          // Table content rows
          ...tableRows,
        ],
      },
      layout: 'basicTableLayout',
      margin: index > 0 ? section.margin.table : section.margin.tableFirst,
    };

    if (moreDates) {
      table.table.body.push(moreDates);
    }

    return { unbreakable: true, stack: [table] };
  }

  // General build methods
  private async buildPdfFileName(): Promise<string> {
    const patient = await firstValueFrom(this.patientState.patient$);
    const initials = getInitials({
      firstname: patient?.name?.[0].given?.[0],
      lastname: patient?.name?.[0].family,
    });
    const date = format(new Date(), 'yyyy-MM-dd');
    return `${initials}-care-plan-${date}.pdf`;
  }

  private buildLineItem(title: string, details: string): ContentText {
    return {
      text: [
        { text: `${title}: `, style: 'bold' },
        { text: details, style: 'regular' },
      ],
    };
  }

  private buildDividerHeader(text: string): ContentTable {
    return {
      table: {
        widths: ['*'],
        body: [[{ text: text.toUpperCase(), style: 'section' }]],
      },
      layout: 'noBorders',
      fillColor: color.medium,
    };
  }
}
