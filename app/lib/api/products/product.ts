import type { Entity } from "../utils/entity";

const CURRENT_PRODUCT_URI = "/v1/products";

export interface Product extends Entity {
  name: String;
  code: String;
  barCode: String;
  price: Number;
  type: String;
  state: String;
  createdAt: String;
}

export interface CreateProduct {
  name: String;
  code: String;
  barCode: String;
  price: Number;
  type: String;
  state: String;
}

export interface UpdateProduct {
  name: String;
  code: String;
  barCode: String;
  price: Number;
  type: String;
  state: String;
}

export interface DeleteProduct {
  deletedProductId: string;
  isDeleted: boolean;
  message: string;
}

export interface SpecProduct {
  id: string | null;
  name: string | null;
  code: string | null;
  barCode: string | null;
  type: string | null;
  state: string | null;
}

export interface StateProduct extends Entity {
  name: String;
}

export interface TypeProduct extends Entity {
  name: String;
}

export const createProduct = async (data: CreateProduct) => {
  const response = await $api<Product>(`${CURRENT_PRODUCT_URI}`, {
    method: "POST",
    body: data,
  });
  return response;
};

export const getAllProducts = async (data: SpecProduct|null) => {
    const response = await $api<Product[]>(`${CURRENT_PRODUCT_URI}/all${genParams(data)}`);
    return response;
}

export const updateProduct = async (data: UpdateProduct, id: string) => {
  const response = await $api<Product>(`${CURRENT_PRODUCT_URI}/${id}`, {
    method: "PUT",
    body: data,
  });
  return response;
};

export const deleteProduct = async (id: string) => {
  const response = await $api<DeleteProduct>(`${CURRENT_PRODUCT_URI}/${id}`, {
    method: "DELETE",
  });
  return response;
};

export const getProduct = async (id: string) => {
  const response = await $api<Product>(`${CURRENT_PRODUCT_URI}/${id}`, {
    method: "GET",
  });
  return response;
};

export const getStates = async () => {
  const response = await $api<StateProduct[]>(`${CURRENT_PRODUCT_URI}/states`, {
    method: "GET",
  });
  return response;
};

export const getTypes = async () => {
  const response = await $api<TypeProduct[]>(`${CURRENT_PRODUCT_URI}/types`, {
    method: "GET",
  });
  return response;
};
