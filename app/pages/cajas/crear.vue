<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/cajas/">
        <Button label="Ver Todas" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear una caja registradora</h1>

    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos de la caja</h2>

        <div class="w-full">
          <FloatLabel>
            <label for="code">Código</label>
            <InputText id="code" name="code" type="text" class="w-full" />
          </FloatLabel>
          <Message
            v-if="$form.code?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.code.error?.message }}
          </Message>
        </div>

        <!-- <div class="w-full">
          <FloatLabel>
            <label for="employeeId">ID de empleado asignado</label>
            <InputText
              id="employeeId"
              name="employeeId"
              type="text"
              class="w-full"
            />
          </FloatLabel>
          <Message
            v-if="$form.employeeId?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.employeeId.error?.message }}
          </Message>
        </div> -->

        <div class="w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Bodega asignada</label
          >
          <div class="flex gap-2">
            <InputText
              class="w-full"
              :value="selectedWarehouse?.name || ''"
              readonly
              placeholder="Seleccionar bodega"
            />
            <Button
              icon="pi pi-search"
              @click="showWarehouseModal = true"
              outlined
            />
          </div>
          <Message
            v-if="!selectedWarehouse?.id && formTouched"
            severity="error"
            size="small"
            variant="simple"
          >
            La bodega es obligatoria
          </Message>
        </div>
      </div>

      <div class="pt-4">
        <Button
          type="submit"
          label="Crear"
          icon="pi pi-save"
          severity="secondary"
        />
      </div>
    </Form>

    <!-- Modal de selección de bodega -->
    <Dialog
      v-model:visible="showWarehouseModal"
      header="Seleccionar bodega"
      modal
    >
      <DataTable
        :value="warehouses"
        selectionMode="single"
        @rowSelect="onWarehouseSelect"
      >
        <Column field="name" header="Nombre" />
        <Column field="ubication" header="Ubicación" />
      </DataTable>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { FloatLabel } from "primevue";
import { toast } from "vue-sonner";
import { z } from "zod";
import Dialog from "primevue/dialog";
import { cretateCashRegister } from "~/lib/api/cash_register/cashRegister";
import {
  getAllWarehouses,
  type Warehouse,
} from "~/lib/api/warehouse/warehouse";
import type { CreateCashRegister } from "~/lib/api/cash_register/cashRegister";

const showWarehouseModal = ref(false);
const warehouses = ref<Warehouse[]>([]);
const selectedWarehouse = ref<Warehouse | null>(null);
const formTouched = ref(false);

const initialValues = reactive<CreateCashRegister>({
  code: "",
  active: true,
  warehouseId: "",
  employeeId: "",
});

const resolver = zodResolver(
  z.object({
    code: z.string().min(1, "El código es obligatorio"),
    employeeId: z.string().optional().or(z.literal("")), // permite string vacío como válido
  })
);

const onWarehouseSelect = (e: any) => {
  selectedWarehouse.value = e.data;
  initialValues.warehouseId = e.data.id;
  showWarehouseModal.value = false;
};

onMounted(async () => {
  warehouses.value = (
    await getAllWarehouses({
      id: null,
      name: null,
      ubication: null,
      active: true,
    })
  ).filter((w) => w.active);
});

const onFormSubmit = (e: any) => {
  formTouched.value = true;
  if (e.valid && selectedWarehouse.value?.id) {
    const payload: CreateCashRegister = {
      ...e.values,
      active: true,
      warehouseId: selectedWarehouse.value.id,
    };
    if (payload.employeeId && payload.employeeId.trim() === "") {
      payload.employeeId = null;
    }
    mutate(payload);
  } else if (!selectedWarehouse.value?.id) {
    toast.error("Debes seleccionar una bodega");
  }
};

const { mutate } = useMutation({
  mutation: (payload: CreateCashRegister) => cretateCashRegister(payload),
  onError(error) {
    toast.error("Error al crear la caja registradora", {
      description: error.message,
    });
  },
  onSuccess() {
    toast.success("Caja registradora creada correctamente");
    navigateTo("/cajas/");
  },
});
</script>
