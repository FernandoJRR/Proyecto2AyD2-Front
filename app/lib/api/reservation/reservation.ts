import type { Entity } from "../utils/entity";

const CURRENT_RESERVATION_URI = "/v1/reservations";

export interface Reservation extends Entity {
    startTime:string;
    endTime:string;
    date:string;
    userId:string;
    online:boolean;
    paid:boolean;
    cancelled:boolean;
}

export interface SpecReservation {
    userId:string|null;
    startTime:string|null;
    endTime:string|null;
    date:string|null;
    online:boolean|null;
    paid:boolean|null;
    cancelled:boolean|null;
}

interface CreateReservation {
    startTime:string;
    endTime:string;
    date:string;
    userId:string;
    online:boolean;
}

export const createReservation = async (data:CreateReservation) => {
    const response = await $api<Reservation>(`${CURRENT_RESERVATION_URI}`, {
        method: "POST",
        body: data,
    });
    return response;
}

export const cancelReservation = async (id:string) => {
    const response = await $api<Reservation>(`${CURRENT_RESERVATION_URI}/cancel/${id}`, {
        method: "PATCH",
    });
    return response;
}

export const payReservation = async (id:string) => {
    const response = await $api<Reservation>(`${CURRENT_RESERVATION_URI}/pay/${id}`, {
        method: "PATCH",
    });
    return response;
}

export const getReservationById = async (id:string) => {
    const response = await $api<Reservation>(`${CURRENT_RESERVATION_URI}/${id}`, {
        method: "GET"
    });
    return response;
}

export const getAllReservations = async (spec:SpecReservation) => {
    const response = await $api<Reservation[]>(`${CURRENT_RESERVATION_URI}/all${genParams(spec)}`, {
        method: "GET"
    });
    return response;
}

export const deleteReservation = async (id:string) => {
    const response = await $api<Reservation>(`${CURRENT_RESERVATION_URI}/${id}`, {
        method: "DELETE"
    });
    return response;
}