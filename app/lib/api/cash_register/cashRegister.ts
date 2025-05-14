import type { Entity } from "../utils/entity";
import type { Warehouse } from "../warehouse/warehouse";

const CURRENT_CASH_REGISTER_URI = "/v1/cash-registers";

export interface CashRegister extends Entity {
  code: string;
  employeeId: string;
  active: boolean;
  warehouse: Warehouse;
}

export interface CreateCashRegister {
  code: string;
  active: boolean;
  warehouseId: string;
  employeeId: string|null;
}

export interface SpecCashRegister {
  id: string|null;
  code: string|null;
  active: boolean|null;
  employeeId: string|null;
  warehouseId: string|null;
}

export interface UpdateCashRegister {
  code: string;
  active: boolean;
  employeeId: string | null;
  warehouseId: string;
}

export const getAllCashRegisters = async (spec: SpecCashRegister) => {
  const response = await $api<CashRegister[]>(`${CURRENT_CASH_REGISTER_URI}/all${genParams(spec)}`, {
    method: "GET"
  });
  return response;
}

export const getCashRegister = async (id: string) => {
  const response = await $api<CashRegister>(`${CURRENT_CASH_REGISTER_URI}/${id}`, {
    method: "GET"
  });
  return response;
}

export const cretateCashRegister = async (data: CreateCashRegister) => {
  const response = await $api<CashRegister>(`${CURRENT_CASH_REGISTER_URI}`, {
    method: "POST",
    body: data,
  });
  return response;
}

export const updateCashRegister = async (id: string, data: UpdateCashRegister) => {
  const response = await $api<CashRegister>(`${CURRENT_CASH_REGISTER_URI}/${id}`, {
    method: "PUT",
    body: data,
  });
  return response;
}

export const toogleCashRegister = async (id: string) => {
  const response = await $api<CashRegister>(`${CURRENT_CASH_REGISTER_URI}/${id}/toogle`, {
    method: "PATCH",
  });
  return response;
}

export const getCashRegisterByEmployeeId = async (employeeId:string) => {
  const response = await $api<CashRegister>(`${CURRENT_CASH_REGISTER_URI}/employee/${employeeId}`,{
    method:'GET'
  });
  return response;
}
