/*
PDFmake uses points (pt) for dimensions
Letter size is 612 x 792 points
*/

import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { format, parseISO } from 'date-fns';
import {
  CanvasElement,
  Content,
  CustomTableLayout,
  DynamicContent,
  Margins,
  PageOrientation,
  PageSize,
  Style,
  StyleDictionary,
} from 'pdfmake/interfaces';
import { ORGANIZATION, PRACTITIONER } from '@core/config/person.constants';
import { getAge, getName } from '@core/utils/fhir/person-functions';
import { TextSection } from '@models/pdf-make.model';

const page = {
  width: 612,
  height: 792,
  margin: {
    horizontal: 60,
  },
};
const font = {
  size: {
    small: 6,
    regular: 8,
    h1: 14,
    h2: 10,
  },
  lineHeight: {
    min: 1,
    med: 1.2,
  },
};
export const color = {
  light: '#BFBFBF',
  medium: '#7F7F7F',
  dark: '#4B4B4B',
};

export const section = {
  margin: {
    regular: [0, 0, 0, 0] as Margins,
    section: [0, 16, 0, 8] as Margins,
    h1: [-13, 16, 0, 0] as Margins,
    h1FirstInSection: [-13, 8, 0, 0] as Margins,
    h2: [0, 8, 0, 0] as Margins,
    h2FirstInSection: [0, 0, 0, 0] as Margins,
    table: [0, 8, 0, 8] as Margins,
    tableFirst: [0, 0, 0, 8] as Margins,
  },
};

export const pageSize: PageSize = 'LETTER';
export const pageOrientation: PageOrientation = 'portrait';
export const pageMargins: Margins = [
  page.margin.horizontal,
  140,
  page.margin.horizontal,
  75,
];

export const basicTableLayout: CustomTableLayout = {
  hLineWidth: (i, node) =>
    i === node.table.headerRows || i === (node.table?.headerRows ?? 0) - 1
      ? 0.5
      : 0,
  vLineWidth: () => 0,
  hLineColor: color.medium,
  paddingLeft: (i) => (i === 0 ? 0 : 8),
  paddingRight: () => 0,
  defaultBorder: true,
};
export const footerTableLayout: CustomTableLayout = {
  hLineWidth: (i) => (i === 1 ? 0.5 : 0),
  vLineWidth: () => 0,
  hLineColor: color.medium,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  defaultBorder: true,
};

export const defaultStyle: Style = {
  fontSize: font.size.regular,
  lineHeight: font.lineHeight.med,
};

export const styles: StyleDictionary = {
  header: {
    margin: [page.margin.horizontal, 20, page.margin.horizontal, 8],
    color: color.medium,
  },
  headerPatientDemographics: {
    margin: [page.margin.horizontal, 4],
    lineHeight: font.lineHeight.min,
  },
  footer: {
    margin: [page.margin.horizontal, 8, page.margin.horizontal, 8],
    color: color.medium,
  },
  end: {
    alignment: 'right',
  },
  center: {
    alignment: 'center',
  },
  small: {
    fontSize: font.size.small,
    lineHeight: font.lineHeight.min,
  },
  regular: {
    fontSize: font.size.regular,
  },
  italic: {
    italics: true,
  },
  paragraph: {
    lineHeight: font.lineHeight.med,
  },
  bold: {
    bold: true,
  },
  lightColor: {
    color: color.light,
  },
  h1: {
    fontSize: font.size.h1,
    bold: true,
  },
  h2: {
    fontSize: font.size.h2,
    bold: true,
  },
  section: {
    fontSize: font.size.h2,
    bold: true,
    color: '#FFFFFF',
    lineHeight: font.lineHeight.min,
    alignment: 'center',
  },
  tableHeader: {
    margin: [0, 2, 0, 0],
    bold: true,
  },
  tableRow: {
    margin: [0, 2, 0, 0],
  },
};

export const horizontalLine: CanvasElement[] = [
  {
    type: 'line',
    x1: 0,
    y1: 0,
    x2: page.width,
    y2: 0,
    lineWidth: 0.5,
    lineCap: 'round',
    lineColor: color.light,
  },
];

export const header = (
  image: string,
  patient: IPatient,
): DynamicContent | Content => {
  const content: DynamicContent | Content = [
    {
      columns: [
        { width: 'auto', stack: [{ image, fit: [56, 56] }] },
        {
          width: '*',
          text: [
            { text: `${ORGANIZATION.name}\n`, style: 'bold' },
            {
              text: [
                `${PRACTITIONER.name?.[0].given?.[0]} ${PRACTITIONER.name?.[0].family} `,
                `(${PRACTITIONER.identifier?.[0]?.type?.text} ${PRACTITIONER.identifier?.[0].value})\n`,
              ],
            },
            ...(ORGANIZATION.telecom
              ? ORGANIZATION.telecom.map((t) => `${t.value}\n`)
              : []),
          ],
        },
        { width: 'auto', text: format(new Date(), 'MMM do, y'), style: 'end' },
      ],
      columnGap: 8,
      style: ['header', 'paragraph'],
    },
    { canvas: horizontalLine },
    {
      text: patientString(patient),
      style: ['headerPatientDemographics', 'end'],
    },
    //{ canvas: horizontalLine },
  ];
  return content;
};

export const footer: DynamicContent = (currentPage, pageCount) => [
  {
    layout: 'footerTableLayout',
    table: {
      widths: ['*'],
      heights: [40, 20],
      body: [
        [''],
        [
          {
            text: `Page ${currentPage} of ${pageCount}`,
            style: ['footer', 'end'],
          },
        ],
      ],
    },
  },
];

const patientString = (patient: IPatient): TextSection => [
  { text: `Patient:`, style: 'bold' },
  ` Name: ${getName(patient)}`,
  ` • Birthdate: ${format(parseISO(patient.birthDate || ''), 'MMM do, y')}`,
  ` (${getAge(patient)} yo)`,
  ` • Sex (assigned at birth): ${patient.gender}`,
];
