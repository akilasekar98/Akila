export interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  officialTitle: string;
  overallStatus: string;
  phase: string;
  studyType: string;
  conditions: string;
  interventions: string;
  sponsor: string;
  startDate: string;
  completionDate: string;
  enrollment: string;
  briefSummary: string;
  locations: string;
  eligibilityCriteria: string;
  primaryOutcomes: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  lastUpdateDate: string;
  url: string;
}

interface ApiStudy {
  protocolSection?: {
    identificationModule?: {
      nctId?: string;
      briefTitle?: string;
      officialTitle?: string;
    };
    statusModule?: {
      overallStatus?: string;
      startDateStruct?: { date?: string };
      completionDateStruct?: { date?: string };
      lastUpdatePostDateStruct?: { date?: string };
    };
    designModule?: {
      phases?: string[];
      studyType?: string;
      enrollmentInfo?: { count?: number };
    };
    conditionsModule?: {
      conditions?: string[];
    };
    armsInterventionsModule?: {
      interventions?: Array<{ interventionType?: string; name?: string }>;
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: { name?: string };
    };
    descriptionModule?: {
      briefSummary?: string;
    };
    contactsLocationsModule?: {
      centralContacts?: Array<{
        name?: string;
        phone?: string;
        email?: string;
      }>;
      locations?: Array<{
        facility?: string;
        city?: string;
        state?: string;
        country?: string;
      }>;
    };
    eligibilityModule?: {
      eligibilityCriteria?: string;
    };
    outcomesModule?: {
      primaryOutcomes?: Array<{ measure?: string }>;
    };
  };
}

export async function searchClinicalTrials(
  searchTerm: string,
  pageSize: number = 50
): Promise<ClinicalTrial[]> {
  const params = new URLSearchParams({
    'query.term': searchTerm,
    pageSize: pageSize.toString(),
    format: 'json',
    fields: [
      'NCTId',
      'BriefTitle',
      'OfficialTitle',
      'OverallStatus',
      'Phase',
      'StudyType',
      'Condition',
      'InterventionType',
      'InterventionName',
      'LeadSponsorName',
      'StartDate',
      'CompletionDate',
      'EnrollmentCount',
      'BriefSummary',
      'LocationFacility',
      'LocationCity',
      'LocationState',
      'LocationCountry',
      'EligibilityCriteria',
      'PrimaryOutcomeMeasure',
      'CentralContactName',
      'CentralContactPhone',
      'CentralContactEMail',
      'LastUpdatePostDate',
    ].join('|'),
  });

  const response = await fetch(
    `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const studies: ApiStudy[] = data.studies ?? [];

  return studies.map((study) => {
    const p = study.protocolSection ?? {};
    const id = p.identificationModule ?? {};
    const status = p.statusModule ?? {};
    const design = p.designModule ?? {};
    const conditions = p.conditionsModule ?? {};
    const arms = p.armsInterventionsModule ?? {};
    const sponsor = p.sponsorCollaboratorsModule ?? {};
    const desc = p.descriptionModule ?? {};
    const contacts = p.contactsLocationsModule ?? {};
    const eligibility = p.eligibilityModule ?? {};
    const outcomes = p.outcomesModule ?? {};

    const nctId = id.nctId ?? '';

    const interventionList = (arms.interventions ?? [])
      .map((i) => `${i.interventionType ?? ''}: ${i.name ?? ''}`)
      .join('; ');

    const locationList = (contacts.locations ?? [])
      .map((l) => [l.facility, l.city, l.state, l.country].filter(Boolean).join(', '))
      .join('; ');

    const primaryOutcomeList = (outcomes.primaryOutcomes ?? [])
      .map((o) => o.measure ?? '')
      .join('; ');

    const firstContact = contacts.centralContacts?.[0] ?? {};

    return {
      nctId,
      briefTitle: id.briefTitle ?? '',
      officialTitle: id.officialTitle ?? '',
      overallStatus: status.overallStatus ?? '',
      phase: (design.phases ?? []).join(', '),
      studyType: design.studyType ?? '',
      conditions: (conditions.conditions ?? []).join('; '),
      interventions: interventionList,
      sponsor: sponsor.leadSponsor?.name ?? '',
      startDate: status.startDateStruct?.date ?? '',
      completionDate: status.completionDateStruct?.date ?? '',
      enrollment: design.enrollmentInfo?.count?.toString() ?? '',
      briefSummary: desc.briefSummary ?? '',
      locations: locationList,
      eligibilityCriteria: eligibility.eligibilityCriteria ?? '',
      primaryOutcomes: primaryOutcomeList,
      contactName: firstContact.name ?? '',
      contactPhone: firstContact.phone ?? '',
      contactEmail: firstContact.email ?? '',
      lastUpdateDate: status.lastUpdatePostDateStruct?.date ?? '',
      url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : '',
    };
  });
}
