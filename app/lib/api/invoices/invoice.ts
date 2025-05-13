import type { Entity } from "../utils/entity";

const CURRENT_INVOICE_URI = "/v1/invoices";

export interface InvoiceDetail extends Entity{
    itemId:string;
    itemName:string;
    itemType:string;
    quantity:number;
    unitPrice:number;
    total:number;
}

export interface Invoice extends Entity{
    paymentMethod:string;
    subtotal:number;
    tax:number;
    total:number;
    clientDocument:string;
    details:InvoiceDetail[];
}

export interface CreateInvoiceDetail {
    itemId:string;
    itemName:string;
    itemType:string;
    quantity:number;
    unitPrice:number;
}

export interface CreateInvoice {
    paymentMethod:string;
    clientDocument:string;
    details:InvoiceDetail[];
}

export interface SpecInvoice {
    paymentMethod:string|null;
    clientDocument:string|null;
}

export interface ItemType{
    itemType:string;
    name:string;
}

export interface PaymentMethod{
    paymentMethod:string;
    name:string;
}

export const createInvoice = async (data: CreateInvoice) =>{
    const response = await $api<Invoice>(`${CURRENT_INVOICE_URI}`, {
        method: "POST",
        body: data,
    });
    return response;
}

export const getInvoice = async (id: string) => {
    const response = await $api<Invoice>(`${CURRENT_INVOICE_URI}/${id}`, {
        method: "GET",
    });
    return response;
}

export const getInvoiceByClientDocument = async (clientDocument: string) => {
    const response = await $api<Invoice[]>(`${CURRENT_INVOICE_URI}/client/${clientDocument}`, {
        method: "GET",
    });
    return response;
}


export const getAllInvoices = async (data: SpecInvoice) => {
    const response = await $api<Invoice[]>(`${CURRENT_INVOICE_URI}/all${genParams(data)}`, {
        method: "GET",
    });
    return response;
}

export const getItemTypes = async () => {
    const response = await $api<ItemType[]>(`${CURRENT_INVOICE_URI}/item-types`, {
        method: "GET",
    });
    return response;
}

export const getPaymentMethods = async () => {
    const response = await $api<PaymentMethod[]>(`${CURRENT_INVOICE_URI}/payment-methods`, {
        method: "GET",
    });
    return response;
}