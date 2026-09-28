// ============================================
// Language Store — Bilingual English & Gujarati (ગુજરાતી)
// Designed for Gujarat Roads & Buildings Dept native staff & elderly citizens
// ============================================

import { create } from 'zustand';

export const GUJARATI_TRANSLATIONS = {
  // Navigation & Sections
  'Dashboard': 'ડેશબોર્ડ',
  'Asset GIS Map': 'જીઆઇએસ નકશો',
  'Analytics & KPIs': 'વિશ્લેષણ અને આંકડા',
  'Assets Directory': 'મ્યુનિસિપલ અસ્કયામતો',
  'Work Orders': 'કાર્ય આદેશો / સમારકામ',
  'Field Inspections': 'ક્ષેત્રીય નિરીક્ષણ',
  'Officer Rank': 'અધિકારી ક્રમાંક (લીડરબોર્ડ)',
  'Engineers & Staff': 'ઇજનેરી સ્ટાફ ડિરેક્ટરી',
  'Officer Profile': 'અધિકારી પ્રોફાઇલ',
  'System Settings': 'સિસ્ટમ સેટિંગ્સ',
  'Overview': 'વિહંગાવલોકન',
  'RnB Operations': 'માર્ગ અને મકાન કામગીરી',
  'Department': 'વિભાગ',
  'Preferences': 'પસંદગીઓ',
  'Sign Out': 'સાઇન આઉટ',
  'Spotlight': 'શોધ',
  'Dark': 'ડાર્ક મોડ',
  'Light': 'લાઇટ મોડ',

  // Asset Categories
  'ROAD': 'માર્ગ અને હાઇવે',
  'BRIDGE': 'પુલ અને ફ્લાયઓવર',
  'BUILDING': 'સરકારી ઇમારત',
  'STREETLIGHT': 'સ્ટ્રીટલાઇટ',
  'WATER_PIPELINE': 'પાણીની પાઇપલાઇન',
  'DRAIN': 'ગટર અને ડ્રેનેજ',
  'FOOTPATH': 'ફૂટપાથ અને પેવમેન્ટ',

  // Asset Statuses
  'PLANNED': 'આયોજિત',
  'PROCURED': 'મંજૂર / ખરીદેલ',
  'INSTALLED': 'સ્થાપિત',
  'ACTIVE': 'કાર્યરત',
  'UNDER_MAINTENANCE': 'જાળવણી / સમારકામ હેઠળ',
  'DECOMMISSIONED': 'બિનઉપયોગી',
  'DISPOSED': 'નિકાલ કરેલ',

  // Condition Ratings
  'EXCELLENT': 'ઉત્કૃષ્ટ',
  'GOOD': 'સારું',
  'FAIR': 'સામાન્ય',
  'POOR': 'નબળું',
  'CRITICAL': 'અતિ જોખમી',

  // Common UI Terms
  'Search': 'શોધો...',
  'All Municipal Zones': 'તમામ મ્યુનિસિપલ ઝોન',
  'Live Asset Telemetry': 'લાઇવ અસ્કયામત વિગતો',
  'Asset Details': 'અસ્કયામત વિગતો',
  'Capital Valuation': 'કુલ મૂલ્યાંકન',
  'Current Book Value': 'વર્તમાન મૂલ્ય',
  'Health Condition Index': 'માળખાકીય સ્વાસ્થ્ય સૂચકાંક',
  'Inspect Complete Profile & Audit': 'સંપૂર્ણ પ્રોફાઇલ અને ઓડિટ જુઓ',
  'Open in Google Maps': 'ગૂગલ મેપ્સમાં જુઓ',
  'Notifications': 'સૂચનાઓ',
  'Mark all read': 'બધા વાંચેલા ચિહ્નિત કરો',
  'No notifications right now': 'હાલમાં કોઈ સૂચના નથી',
  'Total Maintained Assets': 'કુલ મ્યુનિસિપલ અસ્કયામતો',
  'Critical Condition Assets': 'ગંભીર સ્થિતિની અસ્કયામતો',
  'Active Work Orders': 'સક્રિય કાર્ય આદેશો',
  'Field Inspections (Month)': 'આ મહિનાના ક્ષેત્રીય નિરીક્ષણો',
  'Standard Streets': 'સામાન્ય નકશો',
  'Satellite Aerial': 'સેટેલાઇટ વ્યૂ',
  'Locate Me': 'મારું સ્થાન',
  'Filters': 'ફિલ્ટર્સ',
  'Gujarat Roads & Buildings Department': 'માર્ગ અને મકાન વિભાગ, ગુજરાત સરકાર',
  'InfraVault Gujarat': 'ઇન્ફ્રાવોલ્ટ ગુજરાત',
};

const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('infravault_lang') || 'en',

  setLanguage: (lang) => {
    localStorage.setItem('infravault_lang', lang);
    set({ language: lang });
  },

  toggleLanguage: () => {
    const nextLang = get().language === 'en' ? 'gu' : 'en';
    localStorage.setItem('infravault_lang', nextLang);
    set({ language: nextLang });
  },

  // Translation helper function
  t: (key, fallback = '') => {
    const currentLang = get().language;
    if (currentLang === 'gu' && GUJARATI_TRANSLATIONS[key]) {
      return GUJARATI_TRANSLATIONS[key];
    }
    return fallback || key;
  },
}));

export default useLanguageStore;
