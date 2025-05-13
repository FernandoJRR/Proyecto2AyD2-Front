<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/reservaciones/">
        <Button label="Ver Todas" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear una reservación</h1>

    <div class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos de la reservación</h2>

        <FloatLabel>
          <label for="date">Fecha</label>
          <InputText id="date" v-model="form.date" type="date" class="w-full" />
        </FloatLabel>

        <FloatLabel>
          <label for="userId">Usuario</label>
          <InputText id="userId" v-model="form.userId" type="text" class="w-full" />
        </FloatLabel>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <Dropdown
            v-model="form.online"
            :options="modalidadOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar modalidad"
            class="w-full"
            @change="loadSchedules"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Horario</label>
          <Dropdown
            v-model="selectedSchedule"
            :options="scheduleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar horario"
            class="w-full"
          />
        </div>
      </div>

      <div class="pt-4">
        <Button
          label="Crear"
          icon="pi pi-save"
          severity="secondary"
          @click="onFormSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import { createReservation } from "~/lib/api/reservation/reservation";
import {
  getAllOnlineStatus,
  type Schedule,
} from "~/lib/api/schedules/schedule";
import type { CreateReservation } from "~/lib/api/reservation/reservation";

const form = reactive<CreateReservation>({
  date: "",
  userId: "",
  online: true,
  startTime: "",
  endTime: ""
});

const selectedSchedule = ref<Schedule | null>(null);
const scheduleOptions = ref<{ label: string; value: Schedule }[]>([]);

const modalidadOptions = ref([
  { label: "Virtual", value: true },
  { label: "Presencial", value: false },
]);

const loadSchedules = async (event: { value: boolean }) => {
  const schedules = await getAllOnlineStatus(event.value);
  scheduleOptions.value = schedules.map((s: Schedule) => ({
    label: `${s.startTime} - ${s.endTime}`,
    value: s,
  }));
};

const onFormSubmit = async () => {
  if (!form.date || !form.userId || !selectedSchedule.value) {
    toast.error("Debe completar todos los campos");
    return;
  }

  const { startTime, endTime } = selectedSchedule.value;

  const payload: CreateReservation = {
    ...form,
    startTime,
    endTime,
  };

  try {
    await createReservation(payload);
    toast.success("Reservación creada correctamente");
    navigateTo("/reservaciones/");
  } catch (error: any) {
    toast.error("Error al crear la reservación", {
      description: error.message,
    });
  }
};
</script>
