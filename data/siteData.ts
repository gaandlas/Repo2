// siteData.ts
import fs from 'fs';
import path from 'path';

export interface SiteInfo {
  '\ufeffPartner': string; // This is a special character that appears in the CSV file
  PantheonMachineName: string;
  TealiumProfile: string;
  SiteType: 'Microsite' | 'LP';
  FormType: string;
  GravityForm: string;
  RURLSubdomain: string;
  RURL: string;
  URL: string;
  utm: string;
  SingleProgramURL: string;
  Affurl: string;
  AffUtm: string;
  AffSubdomain: string;
  UUID: string;
  Notes: string;
}

// Load the JSON file
const jsonFilePath = path.resolve(__dirname, '../site_info.json');
export const siteData: SiteInfo[] = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Simple helper function
export function forEachSite(callback: (site: SiteInfo) => void): void {
  siteData.forEach(callback);
}

