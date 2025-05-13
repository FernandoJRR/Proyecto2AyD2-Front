import type { Entity } from "../utils/entity";
import type { Warehouse } from "../warehouse/warehouse";

const CURRENT_STOK_URI = "/v1/stocks";

export interface Stock extends Entity {
    id:string;
    quantity:number;
    minimumStock:number;
    warehouse:Warehouse;
}

export interface UpdateMinStock {
    productId:string;
    warehouseId:string;
    minimumStock:string;
}


export const getStockByWarehouse = async (warehouseId:string) => {
    const response = await $api<Stock[]>(`${CURRENT_STOK_URI}/warehouse/${warehouseId}`, {
        method: "GET"
    });
    return response;
}

export const getAllProductsLowStock = async () => {
    const response = await $api<Stock[]>(`${CURRENT_STOK_URI}/low-stock`, {
        method: "GET"
    });
    return response;
}

export const getAllProductsLowStockByWarehouse = async (warehouseId:string) => {
    const response = await $api<Stock[]>(`${CURRENT_STOK_URI}/low-stock/warehouse/${warehouseId}`, {
        method: "GET"
    });
    return response;
}


export const updateMinStock = async (data:UpdateMinStock)=>{
    const response = await $api<Stock>(`${CURRENT_STOK_URI}/minimum-stock`, {
        method: "PATCH",
        body: data,
    });
    return response;
}