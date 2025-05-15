import type { Entity } from "../utils/entity";

const CURRENT_SCHEDULE_URI = "/v1/schedules";

export interface Schedule extends Entity {
    startTime:string;
    endTime:string;
}

export interface CreateSchedule {
    startTime:string;
    endTime:string;
}

export interface UpdateSchedule {
    startTime:string;
    endTime:string;
}


export const getScheduleById = async (id:string) => {
    const response = await $api<Schedule>(`${CURRENT_SCHEDULE_URI}/${id}`, {
        method: "GET"
    });
    return response;
}

export const getAllSchedules = async () => {
    const response = await $api<Schedule[]>(`${CURRENT_SCHEDULE_URI}`, {
        method: "GET"
    });

    
    return response;
}

export const createSchedule = async (data:CreateSchedule) => {
    const response = await $api<Schedule>(`${CURRENT_SCHEDULE_URI}`, {
        method: "POST",
        body: data,
    });
    return response;
}

export const updateSchedule = async (id:string, data:UpdateSchedule) => {
    const response = await $api<Schedule>(`${CURRENT_SCHEDULE_URI}/${id}`, {
        method: "PUT",
        body: data,
    });
    return response;
}

export const deleteSchedule = async (id:string) => {
    const response = await $api<Schedule>(`${CURRENT_SCHEDULE_URI}/${id}`, {
        method: "DELETE",
    });
    return response;
}