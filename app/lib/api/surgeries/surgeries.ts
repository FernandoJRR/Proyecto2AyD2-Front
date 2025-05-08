import type { Entity } from "../utils/entity";

const CURRENT_SURGERY_URI = "/v1/surgeries";

export interface SurgeryTypeResponseDTO extends Entity {
  type: string;
  description: string;
  specialistPayment: number;
  hospitalCost: number;
  surgeryCost: number;
}

export interface CreateSurgeryTypeRequest {
  type: string;
  description: string;
  specialistPayment: number;
  hospitalCost: number;
  surgeryCost: number;
}

export interface SurgeryEmployeeResponseDTO {
  surgeryId: string;
  employeeId?: string | null;
  specialistEmployeeId?: string | null;
  employeeName: string | null;
  employeeLastName: string | null;
  specialistPayment: number;
}

export interface SurgeryResponseDTO extends Entity {
  consultId: string;
  hospitalCost: number;
  surgeryCost: number;
  performedDate: string;
  surgeryType: SurgeryTypeResponseDTO;
  surgeryEmployees: SurgeryEmployeeResponseDTO[];
}

export interface CreateSurgeryRequestDTO {
  consultId: string;
  surgeryTypeId: string;
  asignedDoctorId: string;
  isSpecialist: boolean;
}

export interface AddDeleteEmployeeSurgeryDTO {
  surgeryId: string;
  doctorId: string;
  isSpecialist: boolean;
}

export interface UpdateSurgeryTypeRequestDTO {
  type: string | null;
  description: string | null;
  specialistPayment: number | null;
  hospitalCost: number | null;
  surgeryCost: number | null;
}

export interface DeleteSurgeryResponseDTO {
  surgeryId: string;
  message: string;
  success: boolean;
}

export const getSurgeriesTypes = async (query: string | null) => {
  let url = `${CURRENT_SURGERY_URI}/types/all`;
  if (query) {
    url = `${url}?query=${query}`;
  }
  const response = await $api<SurgeryTypeResponseDTO[]>(url);
  return response;
};

export const updateSurgeryType = async (
  id: string,
  data: UpdateSurgeryTypeRequestDTO
) => {
  const response = await $api<SurgeryTypeResponseDTO>(
    `${CURRENT_SURGERY_URI}/types/update/${id}`,
    {
      method: "PATCH",
      body: data,
    }
  );
  return response;
};

export const createSurgeryType = async (data: CreateSurgeryTypeRequest) => {
  const response = await $api<SurgeryTypeResponseDTO>(
    `${CURRENT_SURGERY_URI}/types/create`,
    {
      method: "POST",
      body: data,
    }
  );
  return response;
};

export const getSurgeryType = async (id: string) => {
  const response = await $api<SurgeryTypeResponseDTO>(
    `${CURRENT_SURGERY_URI}/types/${id}`
  );
  return response;
};

export const getAllSurgeries = async () => {
  const response = await $api<SurgeryResponseDTO[]>(
    `${CURRENT_SURGERY_URI}/all`
  );
  return response;
};

export const createSurgery = async (data: CreateSurgeryRequestDTO) => {
  const response = await $api<SurgeryResponseDTO>(
    `${CURRENT_SURGERY_URI}/create`,
    {
      method: "POST",
      body: data,
    }
  );
  return response;
};

export const deleteSurgery = async (id: string) => {
  const response = await $api<DeleteSurgeryResponseDTO>(
    `${CURRENT_SURGERY_URI}/${id}`,
    {
      method: "DELETE",
    }
  );
  return response;
};

export const markAsCompletedSurgery = async (id: string) => {
  const response = await $api<SurgeryResponseDTO>(
    `${CURRENT_SURGERY_URI}/mark-performed/${id}`,
    {
      method: "POST",
    }
  );
  return response;
};

export const getSurgery = async (id: string) => {
  const response = await $api<SurgeryResponseDTO>(
    `${CURRENT_SURGERY_URI}/${id}`
  );
  return response;
};

export const addDoctorSurgery = async (data: AddDeleteEmployeeSurgeryDTO) => {
  const response = await $api<SurgeryEmployeeResponseDTO>(
    `${CURRENT_SURGERY_URI}/add-employee`,
    {
      method: "POST",
      body: data,
    }
  );
  return response;
};

export const deleteDoctorSurgery = async (
  data: AddDeleteEmployeeSurgeryDTO
) => {
  const response = await $api<SurgeryEmployeeResponseDTO>(
    `${CURRENT_SURGERY_URI}/remove-employee`,
    {
      method: "DELETE",
      body: data,
    }
  );
  return response;
};

export const getAllSugeryEmployees = async (surgeryId: string) => {
  const response = await $api<SurgeryEmployeeResponseDTO[]>(
    `${CURRENT_SURGERY_URI}/surgery-employees/${surgeryId}`
  );
  return response;
};

export const getSurgeriesbyConsultId = async (consultId: string) => {
  const response = await $api<SurgeryResponseDTO[]>(
    `${CURRENT_SURGERY_URI}/consult/${consultId}`
  );
  return response;
};
