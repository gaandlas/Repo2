import { expect } from '@playwright/test';

interface UtagData {
    [key: string]: any;
  }
  
  export function checkCommonUtagData(utag: UtagData, expectedData: Partial<UtagData>) {
    for (const [key, value] of Object.entries(expectedData)) {
      if (value === null) {
        expect(utag[key]).not.toBe('');
      } else {
        expect(utag[key]).toBe(value);
      }
    }
  }
  
  export function checkLPBrandPageUtag(utag: UtagData, tealiumProfile: string) {
    const expectedData: Partial<UtagData> = {
      'page_type': 'landing-page',
      'partner_name': tealiumProfile,
      'site_type': 'Landing Page',
      'page_name': null,
      'is_conversion': 0,
      'is_landing_page': 1,
      'program_name': null,
      'page_category': 'Landing Page',
      'site_section': 'Landing Page',
    };
    checkCommonUtagData(utag, expectedData);
  }
  
  export function checkMicrositeBrandPageUtag(utag: UtagData, tealiumProfile: string) {
    const expectedData: Partial<UtagData> = {
      'page_type': 'content',
      'partner_name': tealiumProfile,
      'site_type': 'Microsite',
      'page_name': null,
      'is_conversion': 0,
      'is_landing_page': 0,
      'program_name': `${tealiumProfile}-brand`,
      'site_framework': 'tux',
    };
    checkCommonUtagData(utag, expectedData);
  
    if (utag['page_name'] === 'Request Information') {
      expect(utag['site_section']).not.toBe('');
      expect(utag['page_category']).not.toBe('');
    } else {
      expect(utag['site_section']).not.toBe('');
      expect(utag['page_category']).not.toBe('');
    }
  }
  
  export function checkLPThankYouPageUtag(utag: UtagData, tealiumProfile: string) {
    const expectedData: Partial<UtagData> = {
      'page_type': 'thankyou',
      'partner_name': tealiumProfile,
      'site_type': 'Landing Page',
      'is_conversion': 1,
      'is_landing_page': 1,
      'page_category': 'Landing Page',
      'site_section': 'Thank You',
    };
    checkCommonUtagData(utag, expectedData);
    expect(utag['page_name'].toLowerCase()).toContain('thank');
    expect(utag['program_name'].toLowerCase()).not.toBe(`${tealiumProfile}-brand`);
  }
  
  export function checkMicrositeThankYouPageUtag(utag: UtagData, tealiumProfile: string) {
    const expectedData: Partial<UtagData> = {
      'page_type': 'thankyou',
      'partner_name': tealiumProfile,
      'site_type': 'Microsite',
      'page_name': 'Thank You',
      'is_conversion': 1,
      'is_landing_page': 0,
      'site_framework': 'tux',
      'site_section': 'Thank You',
      'page_category': 'Thank You',
    };
    checkCommonUtagData(utag, expectedData);
    expect(utag['program_name']).not.toBe(`${tealiumProfile}-brand`);
    expect(utag).toHaveProperty('program_uuid');
    expect(utag).toHaveProperty('dl_uid');
  }