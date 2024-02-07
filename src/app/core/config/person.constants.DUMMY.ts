import { IOrganization } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IOrganization';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';

export const LOGO_URL = './assets/print/organization-300.png';
export const ORGANIZATION: IOrganization = {
  resourceType: 'Organization',
  name: 'YOUR ORGANIZATION',
  address: [
    {
      use: 'work',
      line: ['2010 No Name Road'],
      city: 'Vancouver',
      state: 'British Columbia',
      country: 'Canada',
    },
  ],
  telecom: [
    {
      use: 'mobile',
      system: 'phone',
      value: '+1 (604) 111-1111',
    },
    {
      use: 'work',
      system: 'email',
      value: 'peter@silie.com',
    },
    {
      use: 'work',
      system: 'url',
      value: 'silie.com',
    },
  ],
};

export const PRACTITIONER: IPractitioner = {
  resourceType: 'Practitioner',
  name: [
    {
      family: 'PETER',
      given: ['SILIE'],
    },
  ],
  identifier: [
    {
      type: { text: 'GOVERNING BODY' },
      value: '007',
    },
  ],
};
