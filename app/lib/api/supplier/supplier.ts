import type { Entity } from "../utils/entity";

const CURRENT_STOCK_URI = "/v1/suppliers";

export interface Supplier extends Entity{
    id:string;
    nit:string;
    name:string;
    taxRegime:number;
    address:string;
    active:boolean; 
}

export interface CreateSupplier {
    nit:string;
    name:string;
    taxRegime:number;
    address:string;
    active:boolean; 
}

export interface SpecSupplier {
    nit:string|null;
    name:string|null;
    taxRegime:number|null;
    address:string|null;
    active:boolean|null;
}

export interface UpdateSupplier {
    nit:string;
    name:string;
    taxRegime:number;
    address:string;
    active:boolean;
}

export const getSupplierById = async (id:string) => {
    const response = await $api<Supplier>(`${CURRENT_STOCK_URI}/${id}`, {
        method: "GET"
    });
    return response;
}

export const createSupplier = async (data:CreateSupplier) => {
    const response = await $api<Supplier>(`${CURRENT_STOCK_URI}`, {
        method: "POST",
        body: data,
    });
    return response;
}

export const updateSupplier = async (id:string, data:UpdateSupplier) => {
    const response = await $api<Supplier>(`${CURRENT_STOCK_URI}/${id}`, {
        method: "PUT",
        body: data,
    });
    return response;
}

export const toogleSupplier = async (id:string) => {
    const response = await $api<Supplier>(`${CURRENT_STOCK_URI}/${id}/toogle`, {
        method: "PATCH",
    });
    return response;
}

export const getAllSuppliers = async (data:SpecSupplier) => {
    const response = await $api<Supplier[]>(`${CURRENT_STOCK_URI}/all${genParams(data)}`, {
        method: "GET"
    });
    return response;
}