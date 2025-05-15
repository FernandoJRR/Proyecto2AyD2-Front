const CURRENT_REPORTS_URI = "/v1";

export async function getReservationReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  return await $api<any>(`${CURRENT_REPORTS_URI}/reservation-reports`, {
    body: params,
    method: "POST",
  });
}

export async function exportReservationReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  const response = await $api<any>(
    `${CURRENT_REPORTS_URI}/reservation-reports/export`,
    {
      body: params,
      method: "POST",
      responseType: "blob",
    }
  );

  const blob = new Blob([response], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}



/**
 * reprte de horas opulares en dos fechas
 */
export async function getPopularHoursBetweenDates(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  return await $api<any>(`${CURRENT_REPORTS_URI}/popular-hours-report`, {
    body: params,
    method: "POST",
  });
}


/**
 * exporta reprte de horas opulares en dos fechas
 */
export async function exportPopularHoursBetweenDates(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  const response = await $api<any>(
    `${CURRENT_REPORTS_URI}/popular-hours-report/export`,
    {
      body: params,
      method: "POST",
      responseType: "blob",
    }
  );

  const blob = new Blob([response], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}




export async function createReservationProfitReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  return await $api<any>(`${CURRENT_REPORTS_URI}/reservation-profit`, {
    body: params,
    method: "POST",
  });
}


export async function exportReservationProfitReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  const response = await $api<any>(
    `${CURRENT_REPORTS_URI}/reservation-profit/export`,
    {
      body: params,
      method: "POST",
      responseType: "blob",
    }
  );

  const blob = new Blob([response], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}




export async function createNotShowReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  return await $api<any>(`${CURRENT_REPORTS_URI}/reservation-not-show"`, {
    body: params,
    method: "POST",
  });
}



export async function exportNotShowReport(
  startDate?: Date | null,
  endDate?: Date | null
) {
  const params = {
    startDate: startDate ? startDate.toISOString().split("T")[0] : null,
    endDate: endDate ? endDate.toISOString().split("T")[0] : null,
  };
  const response = await $api<any>(
    `${CURRENT_REPORTS_URI}/reservation-not-show/export`,
    {
      body: params,
      method: "POST",
      responseType: "blob",
    }
  );

  const blob = new Blob([response], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

