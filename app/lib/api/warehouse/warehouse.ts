import type { Entity } from "../utils/entity";

const CURRENT_WAREHOUSE_URI = "/v1/warehouses";

export interface Warehouse extends Entity {
  name: string;
  ubication: string;
  active: Boolean;
}

export interface UpdateWarehouse {
  name: string;
  ubication: string;
  active: Boolean;
}

export interface CreateWarehouse {
  name: string;
  ubication: string;
  active: Boolean;
}

export interface SpecWarehouse {
  id: string | null;
  name: string | null;
  ubication: string | null;
  active: boolean | null;
}

export const getWarehouseById = async (id: string) => {
  const response = await $api<Warehouse>(`${CURRENT_WAREHOUSE_URI}/${id}`, {
    method: "GET",
  });
  return response;
}

export const createWarehouse = async (data: CreateWarehouse) => {
  const response = await $api<Warehouse>(`${CURRENT_WAREHOUSE_URI}`, {
    method: "POST",
    body: data,
  });
  return response;
}


export const updateWarehouse = async (id: string, data: UpdateWarehouse) => {
  const response = await $api<Warehouse>(`${CURRENT_WAREHOUSE_URI}/${id}`, {
    method: "PUT",
    body: data,
  });
  return response;
}

export const toogleWarehouse = async (id: string) => {
  const response = await $api<Warehouse>(`${CURRENT_WAREHOUSE_URI}/${id}/toogle`, {
    method: "PATCH",
  });
  return response;
}

export const getAllWarehouses = async (spec: SpecWarehouse) => {
  const response = await $api<Warehouse[]>(`${CURRENT_WAREHOUSE_URI}/all${genParams(spec)}`, {
    method: "GET"
  });
  return response;
}