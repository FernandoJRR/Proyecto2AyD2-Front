<template>
  <div class="m-6">
    <DataTable
      :value="state.data as any[]"
      tableStyle="min-width: 50rem"
      stripedRows
      :loading="asyncStatus === 'loading'"
      filterDisplay="row"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Cajas Registradoras</span>
          <router-link to="/cajas/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Código" field="code">
        <template #filter>
          <InputText
            v-model="specCashRegister.code"
            placeholder="Filtrar por código"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.code ?? 'error' }}
        </template>
      </Column>

      <Column header="Bodega" field="warehouse.name">
        <template #filter>
          <InputText
            v-model="warehouseFilter"
            placeholder="Filtrar por bodega"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.warehouse?.name ?? 'Sin asignar' }}
        </template>
      </Column>

      <Column header="Activa" field="active">
        <template #filter>
          <Dropdown
            v-model="specCashRegister.active"
            :options="activeOptions"
            placeholder="Filtrar estado"
            class="w-full"
            optionLabel="label"
            optionValue="value"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          <Tag :value="data.active ? 'Sí' : 'No'" />
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="{ data }">
          <RouterLink :to="`/cajas/${data.id}`">
            <Button label="Editar" severity="info" rounded text />
          </RouterLink>
          <Button
            label="Cambiar Estado"
            severity="danger"
            rounded
            text
            @click="toggleAvailability(data.id, data)"
          />
        </template>
      </Column>

      <template #footer>
        Hay en total {{ state.data?.length || 0 }} cajas.
      </template>
    </DataTable>
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { RouterLink } from "vue-router";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { toast } from "vue-sonner";
import {
  getAllCashRegisters,
  toogleCashRegister,
  type CashRegister,
  type SpecCashRegister
} from "~/lib/api/cash_register/cashRegister"; // Ajusta el path si es diferente

const queryCache = useQueryCache();
const confirm = useConfirm();

const specCashRegister = reactive<SpecCashRegister>({
  id: null,
  code: null,
  employeeId: null,
  warehouseId: null,
  active: null
});

// Se usa para filtrar por nombre de la bodega manualmente en frontend
const warehouseFilter = ref('');

const activeOptions = [
  { label: "Todos", value: null },
  { label: "Activa", value: true },
  { label: "No activa", value: false },
];

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllCashRegisters", specCashRegister],
  query: async () => {
    const data = await getAllCashRegisters(specCashRegister);
    return warehouseFilter.value
      ? data.filter(d =>
          d.warehouse?.name?.toLowerCase().includes(warehouseFilter.value.toLowerCase())
        )
      : data;
  },
});

const toggleAvailability = (id: string, object: CashRegister) => {
  confirm.require({
    message: `¿Estás seguro de que deseas cambiar el estado de la caja "${object.code}"?`,
    header: "Confirmación",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancelar",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Cambiar estado",
      severity: "warning",
      icon: "pi pi-refresh",
    },
    accept: () => {
      mutate(id);
    },
    reject: () => {
      toast.warning("Operación cancelada. No se modificó el estado de la caja.");
    },
  });
};

const { mutate } = useMutation({
  mutation: (id: string) => toogleCashRegister(id),
  onError(error) {
    toast.error("Ocurrió un error al cambiar el estado de la caja", {
      description: `${error.message}`,
    });
  },
  onSuccess() {
    toast.success("Estado de la caja actualizado correctamente.");
    queryCache.invalidateQueries({ key: ["getAllCashRegisters"] });
  },
});
</script>
