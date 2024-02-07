import { BundleEntry } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/bundleEntry';
import { PersonLink } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/personLink';
import { Resource } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/resource';
import { IBundle } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IBundle';
import { IEncounter } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IEncounter';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { PersonBundle } from '@models/person-bundle.model';
import { PersonList } from '@models/person-list.model';
import { environment } from 'src/environments/environment';
import { arrayHasValue, isObject } from '../object-functions';
import { getName } from './person-functions';
import { getReferencedResource } from './resource-functions';
import { Person } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/person';
import { Practitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/practitioner';
import { Patient } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/patient';
import { RelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/relatedPerson';
import { de } from 'date-fns/locale';
import { addDays, formatISO, parseISO } from 'date-fns';
import { HumanName } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/humanName';
import { IResource } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IResource';

export const convertFhirBundleToPersonBundle = (
  bundle: IBundle,
): PersonBundle => {
  if (!bundle || !bundle.entry || bundle.total === 0) {
    throw new Error('The IBundle is empty.');
  }

  const personBundle: PersonBundle = {
    person: bundle.entry?.find(
      (entry) => entry.resource?.resourceType === 'Person',
    )?.resource as IPerson,
  };

  bundle.entry.forEach((entry) => {
    const type = entry.resource?.resourceType;
    if (type === 'Patient') {
      personBundle.patient = entry.resource;
    }
    if (type === 'Practitioner') {
      personBundle.practitioner = entry.resource;
    }
    if (type === 'RelatedPerson') {
      if (!('relatedPerson' in personBundle)) {
        personBundle.relatedPerson = [];
      }
      personBundle.relatedPerson?.push(entry.resource as IRelatedPerson);
    }
  });
  return personBundle;
};

export const convertPersonBundleToFhirBundle = (
  personBundle: PersonBundle,
): IBundle => {
  if (!personBundle) {
    throw new Error('The PersonBundle is empty.');
  }
  const personBundleArray = personBundleToArray(personBundle);
  const entry: BundleEntry[] = [];
  const link: PersonLink[] = [];

  personBundleArray.forEach((resource, i) => {
    const resourceWithPersonDataAdded = {
      ...resource,
      name: personBundle.person.name,
      gender: personBundle.person.gender,
      address: personBundle.person?.address,
      telecom: personBundle.person?.telecom,
    } as Person | Patient | RelatedPerson | Practitioner;
    const bundleEntry = buildBundleEntry(resourceWithPersonDataAdded, i);
    if (resource.resourceType !== 'Person' && bundleEntry.fullUrl) {
      link.push(buildPersonLink(bundleEntry.fullUrl));
    }
    entry.push(bundleEntry);
  });

  // add link[] to person resource
  if (!arrayHasValue(link)) {
    throw new Error(
      'A Person resource requires child resources of Patient | RelatedPerson[] | Practitioner',
    );
  }
  const personIndex = entry.findIndex(
    (bundleEntry) => bundleEntry.resource?.resourceType === 'Person',
  );
  (entry[personIndex].resource as IPerson).link = [...link];

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry,
  };
};

export const convertResourcesToFhirBundle = (
  resources: Resource | Resource[],
): IBundle => {
  const entry: BundleEntry[] = [];
  const resourceArray: Resource[] = Array.isArray(resources)
    ? [...resources]
    : [resources];
  resourceArray.forEach((resource, i) =>
    entry.push(buildBundleEntry(resource, i)),
  );

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry,
  };
};

export const convertBundleEntryToPersonList = (
  entry: BundleEntry[] | undefined,
): PersonList => {
  if (!entry) {
    return [];
  }

  const entryArray: IBundle['entry'] = entry
    ? entry.filter((e) => e.resource?.resourceType !== 'Person')
    : [];

  const rootPersonResourceArray: IBundle['entry'] = entry
    ? entry.filter((e) => e.resource?.resourceType === 'Person')
    : [];

  const entryWithRootPersonId = addRootPersonIdToEntry(
    entryArray,
    rootPersonResourceArray,
  );

  const uniqueEntryWithRootPersonId = removeDuplicateEntries(
    entryWithRootPersonId,
  );
  return uniqueEntryWithRootPersonId;
};

export const removeDuplicateEntries = (entry: PersonList): PersonList =>
  entry.reduce((acc: PersonList, current) => {
    const x = acc.find(
      (item) =>
        item.rootPersonResourceId === current.rootPersonResourceId &&
        current.rootPersonResourceId !== '',
    );
    if (!x) {
      return acc.concat([current]);
    }
    return acc;
  }, []);

export const convertEncounterBundle = (entry: BundleEntry[]): IEncounter[] => {
  if (!arrayHasValue(entry)) {
    return [];
  }

  const encounterArray = entry
    .filter((e) => e.search?.mode === 'match')
    .map((e) => e.resource as IEncounter);
  const includesArray = entry
    .filter((e) => e.search?.mode === 'include')
    .map((e) => e.resource as IPatient);

  const encounters = encounterArray.map((e) => {
    const subjectReference = e.subject?.reference;
    const patient = getReferencedResource(subjectReference, includesArray);
    return {
      ...e,
      subject: {
        reference: e.subject?.reference,
        display: getName(patient),
      },
    };
  });

  return encounters;
};

export const deidentifyBundle = (bundle: IBundle): IBundle => {
  const modifiedBundle = { ...bundle };
  if (!isObject(modifiedBundle)) {
    throw new Error('The bundle is not an object');
  }
  if (!arrayHasValue(modifiedBundle.entry)) {
    throw new Error('The bundle has no entries');
  }
  const entry = modifiedBundle.entry.map((e) => {
    return { ...e, resource: deidentifyResource(e.resource), fullUrl: '' };
  });
  return { ...modifiedBundle, entry, link: [] };
};

// Private methods
const deidentifyResource = (resource: Resource | undefined): Resource => {
  if (!resource) {
    throw new Error('The resource is empty');
  }
  if (!('resourceType' in resource)) {
    throw new Error('The resource has no resourceType');
  }
  if (
    resource.resourceType !== 'Person' &&
    resource.resourceType !== 'Patient' &&
    resource.resourceType !== 'RelatedPerson' &&
    resource.resourceType !== 'Practitioner'
  ) {
    return { ...resource };
  }
  const modifiedName = convertNameToInitials(resource);
  const modifiedBirthDate = randomizeBirthDate(modifiedName);
  const removedIdentifiers = removeIdentifyingKeys(modifiedBirthDate);

  return removedIdentifiers as Resource;
};

const removeIdentifyingKeys = (
  resource: IPerson | IPatient | IRelatedPerson | IPractitioner,
): IPerson | IPatient | IRelatedPerson | IPractitioner => {
  if (!resource) {
    throw new Error('The resource is empty');
  }
  const deidentifiedResource = { ...resource };
  // Shared keys
  if (deidentifiedResource.identifier) {
    delete deidentifiedResource.identifier;
  }
  if ('telecom' in deidentifiedResource) {
    delete deidentifiedResource.telecom;
  }
  if (deidentifiedResource.address) {
    delete deidentifiedResource.address;
  }
  if (deidentifiedResource.photo) {
    delete deidentifiedResource.photo;
  }
  if (deidentifiedResource.text) {
    delete deidentifiedResource.text;
  }
  // Patient specific keys
  if (deidentifiedResource.resourceType === 'Patient') {
    if ((deidentifiedResource as IPatient).contact) {
      delete (deidentifiedResource as IPatient).contact;
    }
  }
  // RelatedPerson specific keys
  if (deidentifiedResource.resourceType === 'RelatedPerson') {
    if ((deidentifiedResource as IRelatedPerson).patient) {
      if ((deidentifiedResource as IRelatedPerson).patient?.display) {
        delete (deidentifiedResource as IRelatedPerson).patient?.display;
      }
      if ((deidentifiedResource as IRelatedPerson).patient?.extension) {
        delete (deidentifiedResource as IRelatedPerson).patient?.extension;
      }
      if ((deidentifiedResource as IRelatedPerson).patient?.identifier) {
        delete (deidentifiedResource as IRelatedPerson).patient?.identifier;
      }
      if ((deidentifiedResource as IRelatedPerson).patient?.type) {
        delete (deidentifiedResource as IRelatedPerson).patient?.type;
      }
    }
  }
  return deidentifiedResource;
};

const randomizeBirthDate = (
  resource: IPerson | IPatient | IRelatedPerson | IPractitioner,
): IPerson | IPatient | IRelatedPerson | IPractitioner => {
  const modifiedResource = { ...resource };
  if (modifiedResource.birthDate) {
    modifiedResource.birthDate = formatISO(
      addDays(
        new Date(modifiedResource.birthDate),
        Math.floor(Math.random() * 61) - 30, // random number between -30 and 30
      ),
      { representation: 'date' },
    );
  }
  return modifiedResource;
};

const convertNameToInitials = (
  resource: IPerson | IPatient | IRelatedPerson | IPractitioner,
): IPerson | IPatient | IRelatedPerson | IPractitioner => {
  const modifiedResource = { ...resource };

  if (!arrayHasValue(modifiedResource.name)) {
    return modifiedResource;
  }
  const initialsArray = modifiedResource.name.map((originalName) => {
    const name = { ...originalName };
    // Convert family name to initial
    if (name.family) {
      name.family = name.family.charAt(0) + '.';
    }

    // Convert given names to initials
    if (name.given) {
      name.given = name.given.map((givenName) => givenName.charAt(0) + '.');
    }

    return name;
  });
  return { ...modifiedResource, name: initialsArray };
};

const addRootPersonIdToEntry = (
  entryArray: IBundle['entry'],
  rootPersonResourceArray: IBundle['entry'],
): PersonList => {
  if (!entryArray || entryArray?.length < 1) {
    throw new Error("IBundle['entry'] is empty");
  }
  const peopleWithPersonId = entryArray.map((entry) => {
    const rootPersonResource = rootPersonResourceArray?.find((rootPerson) => {
      const person = rootPerson.resource as IPerson;
      return person.link?.find(
        (link) => link.target.reference?.endsWith(entry.resource?.id ?? ''),
      );
    });
    const rootPersonResourceId = rootPersonResource
      ? rootPersonResource.resource?.id
      : '';
    return { ...entry, rootPersonResourceId };
  });
  return peopleWithPersonId as PersonList;
};

const buildBundleEntry = (
  resource: Resource,
  resourceIndex: number,
): BundleEntry => {
  if (!('id' in resource)) {
    throw new Error(
      `A resource requires an 'id' key in order to build a bundle entry`,
    );
  }

  const resourceType = resource.resourceType;
  const resourceId = resource.id !== '' ? resource.id : null;
  const resourceUrl = resourceType + '-' + resourceIndex;
  const method = resourceId ? 'PUT' : 'POST';
  const url = resourceId ? `${resourceType}/${resourceId}` : resourceType;
  const entry = {
    fullUrl: `urn:uuid:${resourceUrl}`,
    resource,
    request: {
      method,
      url,
    },
  };
  // Delete empty id keys to prevent error in POST to fhir server
  if (!resourceId) {
    delete entry.resource.id;
  }
  return entry;
};

const buildPersonLink = (fullUrl: string): PersonLink => {
  const link = {
    target: {
      reference: fullUrl,
    },
  };
  return link;
};

const personBundleToArray = (
  personBundle: PersonBundle,
): (IPerson | IPatient | IPractitioner | IRelatedPerson)[] => {
  const array: (IPerson | IPatient | IPractitioner | IRelatedPerson)[] = [];
  for (const [key, value] of Object.entries(personBundle)) {
    if (key !== 'relatedPerson') {
      array.push(value);
    }
  }
  personBundle?.relatedPerson?.forEach((relatedPerson) =>
    array.push(relatedPerson),
  );
  return array;
};
