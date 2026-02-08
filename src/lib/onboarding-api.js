import { supabase } from './supabase';

function db() {
  if (!supabase) throw new Error('Supabase not configured – set VITE_SUPABASE_ANON_KEY');
  return supabase;
}

function now() {
  return new Date().toISOString();
}

async function getCustomFields(clientId) {
  try {
    const { data, error } = await db()
      .from('clients')
      .select('customFields')
      .eq('id', clientId)
      .single();
    if (error) return null;
    return data?.customFields || null;
  } catch (err) {
    return null;
  }
}

async function updateClientSafe(clientId, payload, customFields) {
  const basePayload = { ...payload, updatedAt: now() };
  const withCustom = customFields ? { ...basePayload, customFields } : basePayload;

  let { data, error } = await db()
    .from('clients')
    .update(withCustom)
    .eq('id', clientId)
    .select()
    .single();

  if (!error) return data;

  const msg = String(error.message || '').toLowerCase();
  const customFieldIssue = msg.includes('customfields') || msg.includes('column') || msg.includes('schema cache');
  if (!customFieldIssue || !customFields) throw error;

  ({ data, error } = await db()
    .from('clients')
    .update(basePayload)
    .eq('id', clientId)
    .select()
    .single());

  if (error) throw error;
  return data;
}

// ── Demo User ──

export async function createDemoUser() {
  const timestamp = Date.now();
  const email = `demo-${timestamp}@test.com`;

  const { data, error } = await db()
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
      email,
      passwordHash: 'demo-no-auth',
      companyName: '',
      salesReps: 1,
      onboardingStep: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Onboarding Client ──

export async function createOnboardingClient({ email }) {
  const { data, error } = await db()
    .from('clients')
    .insert({
      id: crypto.randomUUID(),
      email,
      passwordHash: 'supabase-auth',
      companyName: '',
      salesReps: 1,
      onboardingStep: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Step 1: Company Details ──

export async function saveCompanyDetails(clientId, { companyName, salesReps, industry, employees, companyTypes }) {
  const existingCustom = await getCustomFields(clientId);

  const customFields = {
    ...(existingCustom || {}),
    companyProfile: {
      companyTypes: companyTypes || [],
      employees: employees || null,
    },
  };

  return updateClientSafe(
    clientId,
    {
      companyName,
      salesReps: parseInt(salesReps) || 1,
      industry,
      onboardingStep: 1,
    },
    customFields
  );
}

// ── Step 2: Funnel Template ──

const FUNNEL_TEMPLATES = {
  b2c_classic: {
    name: 'B2C Classic',
    stages: [
      { id: 'stage-1', name: 'לידים חדשים', position: 0, color: '#DAFD68' },
      { id: 'stage-2', name: 'שיחה ראשונה', position: 1, color: '#c8ec55' },
      { id: 'stage-3', name: 'הצעת מחיר', position: 2, color: '#a8d840' },
      { id: 'stage-4', name: 'עסקה סגורה', position: 3, color: '#6b8e6e' },
    ],
  },
  call_center: {
    name: 'Call Center',
    stages: [
      { id: 'stage-1', name: 'שיחות נכנסות', position: 0, color: '#DAFD68' },
      { id: 'stage-2', name: 'מעוניין', position: 1, color: '#c8ec55' },
      { id: 'stage-3', name: 'נשלח הצעה', position: 2, color: '#a8d840' },
      { id: 'stage-4', name: 'סגירה', position: 3, color: '#6b8e6e' },
    ],
  },
  custom: {
    name: 'Custom',
    stages: [
      { id: 'stage-1', name: 'שלב 1', position: 0, color: '#DAFD68' },
      { id: 'stage-2', name: 'שלב 2', position: 1, color: '#c8ec55' },
      { id: 'stage-3', name: 'שלב 3', position: 2, color: '#6b8e6e' },
    ],
  },
};

export async function saveFunnelTemplate(clientId, templateType) {
  const template = FUNNEL_TEMPLATES[templateType];
  if (!template) throw new Error('Invalid template type');

  const { data: existing } = await db()
    .from('funnels')
    .select('id')
    .eq('clientId', clientId)
    .single();

  if (existing) {
    const { data, error } = await db()
      .from('funnels')
      .update({
        name: template.name,
        templateType,
        stages: template.stages,
        updatedAt: now(),
      })
      .eq('clientId', clientId)
      .select()
      .single();
    if (error) throw error;

    await db().from('clients').update({ onboardingStep: 2, updatedAt: now() }).eq('id', clientId);
    return data;
  }

  const { data, error } = await db()
    .from('funnels')
    .insert({
      id: crypto.randomUUID(),
      clientId,
      name: template.name,
      templateType,
      stages: template.stages,
      createdAt: now(),
      updatedAt: now(),
    })
    .select()
    .single();

  if (error) throw error;
  await db().from('clients').update({ onboardingStep: 2, updatedAt: now() }).eq('id', clientId);
  return data;
}

export { FUNNEL_TEMPLATES };

// ── Step 3: Data Source ──

export async function skipDataConnection(clientId) {
  const { error } = await db()
    .from('clients')
    .update({ onboardingStep: 3, updatedAt: now() })
    .eq('id', clientId);

  if (error) throw error;
}

export async function saveDataSource(clientId, { sheetUrl, fieldMapping }) {
  const { data: existing } = await db()
    .from('data_sources')
    .select('id')
    .eq('clientId', clientId)
    .single();

  const ts = now();

  if (existing) {
    const { data, error } = await db()
      .from('data_sources')
      .update({
        type: 'google_sheets',
        sheetUrl,
        fieldMapping: fieldMapping || {},
        syncEnabled: true,
        syncFrequency: 15,
        updatedAt: ts,
      })
      .eq('clientId', clientId)
      .select()
      .single();
    if (error) throw error;
    await db().from('clients').update({ onboardingStep: 3, updatedAt: ts }).eq('id', clientId);
    return data;
  }

  const { data, error } = await db()
    .from('data_sources')
    .insert({
      id: crypto.randomUUID(),
      clientId,
      type: 'google_sheets',
      sheetUrl,
      fieldMapping: fieldMapping || {},
      syncEnabled: true,
      syncFrequency: 15,
      createdAt: ts,
      updatedAt: ts,
    })
    .select()
    .single();

  if (error) throw error;
  await db().from('clients').update({ onboardingStep: 3, updatedAt: ts }).eq('id', clientId);
  return data;
}

// ── Step 2: Focus Areas ──

export async function saveFocusAreas(clientId, focusAreas) {
  const existingCustom = await getCustomFields(clientId);

  const customFields = {
    ...(existingCustom || {}),
    focusAreas: focusAreas || [],
  };
  return updateClientSafe(clientId, {}, customFields);
}

// ── Step 4: Contact Details + Complete ──

export async function saveContactDetails(clientId, contactDetails = {}) {
  const existingCustom = await getCustomFields(clientId);

  const customFields = {
    ...(existingCustom || {}),
    contact: contactDetails,
  };
  const data = await updateClientSafe(
    clientId,
    { onboardingStep: 4 },
    customFields
  );

  const { data: existing } = await db()
    .from('data_sources')
    .select('id')
    .eq('clientId', clientId)
    .single();

  const ts = now();

  if (!existing) {
    const { error: insertError } = await db()
      .from('data_sources')
      .insert({
        id: crypto.randomUUID(),
        clientId,
        type: 'demo',
        sheetName: 'Demo',
        sheetUrl: null,
        fieldMapping: {},
        syncEnabled: false,
        syncFrequency: 0,
        createdAt: ts,
        updatedAt: ts,
      });

    if (insertError) throw insertError;
  }

  return data;
}

// ── Step 4: Complete Onboarding ──

export async function completeOnboarding(clientId) {
  const { error } = await db()
    .from('clients')
    .update({ onboardingStep: 4, updatedAt: now() })
    .eq('id', clientId);

  if (error) throw error;
}

// ── Get client data ──

export async function getClient(clientId) {
  const { data, error } = await db()
    .from('clients')
    .select('*, funnel:funnels(*), dataSource:data_sources(*)')
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}
