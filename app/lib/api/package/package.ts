import { b } from "vitest/dist/chunks/suite.d.FvehnV49.js";
import type { Product } from "../products/product";
import type { Entity } from "../utils/entity";

const CURRENT_PACKAGE_URI = "/v1/packages";

export interface PackageDetail extends Entity {
    product:Product;
    quantity:number;
}

export interface Package extends Entity {
    name:string;
    description:string;
    price:number;
    active:boolean;
    packageDetail:PackageDetail[];
}

export interface CreatePackageDetail {
    product:string;
    quantity:number;
}

export interface CreatePackage {
    name:string;
    description:string;
    price:number;
    details:CreatePackageDetail[];
    active:boolean;
}


export const createPackage = async (data: CreatePackage) => {
    const response = await $api<Package>(`${CURRENT_PACKAGE_URI}`, {
        method: "POST",
        body: data,
    });
    return response;
}

export const updatePackage = async (id: string, data: CreatePackage) => {
    const response = await $api<Package>(`${CURRENT_PACKAGE_URI}/${id}`, {
        method: "PATCH",
        body: data,
    });
    return response;
}

export const getPackageById = async (id: string) => {
    const response = await $api<Package>(`${CURRENT_PACKAGE_URI}/${id}`, {
        method: "GET",
    });
    return response;
}

export const getAllPackages = async () => {
    const response = await $api<Package[]>(`${CURRENT_PACKAGE_URI}`, {
        method: "GET",
    });
    return response;
}