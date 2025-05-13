import type { Supplier } from "../supplier/supplier";
import type { Entity } from "../utils/entity";
import type { Warehouse } from "../warehouse/warehouse";

const CURRENT_PRODUCT_ENTRY = '/v1/product-entries';

export interface ProducEntryDetail extends Entity {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface ProducEntry extends Entity {
    invoiceNumber: string;
    date: string;
    warehouse: Warehouse;
    supplier: Supplier;
    details: ProducEntryDetail[];
}

export interface CreateProducEntryDetail {
    productId:string;
    quantity:number;
    unitPrice:number;
}

export interface CreateProducEntry {
    invoiceNumber:string;
    date:string;
    warehouseId:string;
    supplierId:string;
    details: CreateProducEntryDetail[];
}

export interface SpecProducEntry {
    invoiceNumber:string|null;
    id:string|null;
    warehouseId:string|null;
    supplierId:string|null;
    date:string|null;
}

export const getProductEntry = async (id:string) =>{
    const response = await $api<ProducEntry>(`${CURRENT_PRODUCT_ENTRY}/${id}`, {
        method: "GET"
    });
    return response;
}

export const getProductEntryByInvoiceNumber = async (invoiceNumber:string) =>{
    const response = await $api<ProducEntry>(`${CURRENT_PRODUCT_ENTRY}/invoice-number/${invoiceNumber}`, {
        method: "GET"
    });
    return response;
}

export const getAllProductEntries = async (spec: SpecProducEntry) => {
    const response = await $api<ProducEntry[]>(`${CURRENT_PRODUCT_ENTRY}/all${genParams(spec)}`, {
        method: "GET"
    });
    return response;
}

export const createProductEntry = async (data: CreateProducEntry) => {
    const response = await $api<ProducEntry>(`${CURRENT_PRODUCT_ENTRY}`, {
        method: "POST",
        body: data,
    });
    return response;
}