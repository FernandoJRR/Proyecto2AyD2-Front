const CURRENT_CONFIGURATIONS_URI = "/v1/config";

export interface ParameterResponse {
  parameterKey: string
  value: string
  name: string
}

export interface PeriodPayload {
  beginDate: Date,
  endDate: Date
}

export interface CreateVacationsPayload {
  periods: PeriodPayload[]
}

export interface UpdateNITPayload {
  nit: string
}
export interface UpdateNamePayload {
  newName: string
}
export interface UpdateRegimePayload {
  newRegime: string
}

export async function getNit() {
  return await $api<ParameterResponse>(
    `${CURRENT_CONFIGURATIONS_URI}/nit`
  );
}

export async function getName() {
  return await $api<ParameterResponse>(
    `${CURRENT_CONFIGURATIONS_URI}/nombre`
  );
}

export async function getRegime() {
  return await $api<ParameterResponse>(
    `${CURRENT_CONFIGURATIONS_URI}/regimen`
  );
}

export async function updateNIT(data: UpdateNITPayload) {
  return await $api<ParameterResponse>(`${CURRENT_CONFIGURATIONS_URI}/nit`, {
    method: "PATCH",
    body: data
  });
}
export async function updateName(data: UpdateNamePayload) {
  return await $api<ParameterResponse>(`${CURRENT_CONFIGURATIONS_URI}/nombre`, {
    method: "PATCH",
    body: data
  });
}
export async function updateRegime(data: UpdateRegimePayload) {
  return await $api<ParameterResponse>(`${CURRENT_CONFIGURATIONS_URI}/regimen`, {
    method: "PATCH",
    body: data
  });
}
