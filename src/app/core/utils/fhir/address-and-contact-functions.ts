import { HttpParams } from '@angular/common/http';
import { Address } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/address';
import { ContactPoint } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/contactPoint';

export const buildKeyContactLink = (
  system: ContactPoint.SystemEnum,
  telecom: Array<ContactPoint> | undefined,
): string => {
  if (!system || !telecom) {
    return '';
  }
  if (system === 'sms' && telecom.find((t) => t.system)) {
    // return sms over phone -> mobile
    const smsContact = telecom.find((t) => t.system === 'sms');
    const phoneMobileContact = telecom.find(
      (t) => t.system === 'phone' && t.use === 'mobile',
    );
    const sms = smsContact ? smsContact.value : phoneMobileContact?.value;
    return sms ? `sms:${sms}` : '';
  }
  if (system === 'phone') {
    // Try to find a phone contact with 'mobile' use first
    const mobilePhoneContact = telecom.find(
      (t) => t.system === 'phone' && t.use === 'mobile',
    );

    // Try to find any phone contact
    const anyPhoneContact = telecom.find((t) => t.system === 'phone');

    // Use the value of the found contact, prioritise mobile phone
    const phone = mobilePhoneContact?.value || anyPhoneContact?.value;

    return phone ? `tel:${phone}` : '';
  }
  if (system === 'email') {
    // return email
    const emailContact = telecom.find((t) => t.system === 'email');

    return emailContact ? `mailto:${emailContact.value}` : '';
  }
  return '';
};

export const telecomIcon = (
  system: ContactPoint.SystemEnum | undefined | null,
): string =>
  system === 'email'
    ? 'send'
    : system === 'fax'
      ? 'document'
      : system === 'pager'
        ? 'alarm'
        : system === 'phone'
          ? 'call'
          : system === 'sms'
            ? 'chatbubble'
            : system === 'url'
              ? 'link'
              : 'ellipsis-horizontal';

export const buildTelecomLink = (contactPoint: ContactPoint): string => {
  const telecomLink =
    contactPoint.system === 'email'
      ? `mailto:${contactPoint.value}`
      : contactPoint.system?.match(/^(pager|phone)$/)
        ? `tel:${contactPoint.value}`
        : contactPoint.system === 'sms'
          ? `sms:${contactPoint.value}`
          : contactPoint.system === 'url'
            ? contactPoint.value
            : contactPoint.system === 'fax'
              ? ''
              : '';
  return telecomLink ? telecomLink : '';
};

export const formatAddress = (address: Address): string[] => {
  const addressLines = [];
  // lines
  address.line?.forEach((line) => {
    addressLines.push(line);
  });
  // city, state
  if (address.city !== '' && address.state !== '') {
    addressLines.push(`${address.city}, ${address.state}`);
  }
  if (address.city !== '' && !address.state) {
    addressLines.push(address.city);
  }
  if (!address.city && address.state !== '') {
    addressLines.push(address.state);
  }
  // postal code, country
  if (address.postalCode !== '' && address.country !== '') {
    addressLines.push(`${address.postalCode}, ${address.country}`);
  }
  if (address.postalCode !== '' && !address.country) {
    addressLines.push(address.postalCode);
  }
  if (!address.postalCode && address.country !== '') {
    addressLines.push(address.country);
  }
  return addressLines.filter((i): i is string => i !== undefined);
};

export const buildAddressMapLink = (address: Address): string => {
  const googleMapRoot = 'https://www.google.com/maps/search/';

  const addressLines = [];

  address.line?.forEach((line) => {
    addressLines.push(line);
  });
  if (address.city !== '') {
    addressLines.push(address.city);
  }
  if (address.state !== '') {
    addressLines.push(address.state);
  }

  const params = new HttpParams()
    .set('api', 1)
    .set('query', addressLines.join('+'));
  return `${googleMapRoot}?${params.toString()}`;
};

export const addressIcon = (addressUse: Address['use']): string =>
  addressUse === 'billing'
    ? 'card'
    : addressUse === 'home'
      ? 'home'
      : addressUse === 'old'
        ? 'ban'
        : addressUse === 'temp'
          ? 'timer'
          : addressUse === 'work'
            ? 'briefcase'
            : 'ellipsis-horizontal';
