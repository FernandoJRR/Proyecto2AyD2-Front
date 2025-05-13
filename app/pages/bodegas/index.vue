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
          <span class="text-xl font-bold">Bodegas</span>
          <router-link to="/bodegas/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Nombre" field="name">
        <template #filter>
          <InputText
            v-model="specWarehouse.name"
            placeholder="Filtrar por nombre"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.name ?? 'error' }}
        </template>
      </Column>

      <Column header="Ubicación" field="ubication">
        <template #filter>
          <InputText
            v-model="specWarehouse.ubication"
            placeholder="Filtrar por ubicación"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.ubication ?? 'error' }}
        </template>
      </Column>

      <Column header="Activa" field="active">
        <template #filter>
          <Dropdown
            v-model="specWarehouse.active"
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
          <RouterLink :to="`/bodegas/${data.id}`">
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
        Hay en total {{ state.data?.length || 0 }} bodegas.
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
import { getAllWarehouses, type SpecWarehouse, type Warehouse } from "~/lib/api/warehouse/warehouse";
import { toogleWarehouse } from "~/lib/api/warehouse/warehouse";

const queryCache = useQueryCache();
const confirm = useConfirm();

const specWarehouse = reactive<SpecWarehouse>({
  id: null,
  name: null,
  active: null,
  ubication: null,
});

const activeOptions = [
  { label: "Todos", value: null },
  { label: "Activa", value: true },
  { label: "No activa", value: false },
];

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllWarehouses", specWarehouse],
  query: () => getAllWarehouses(specWarehouse),
});

const toggleAvailability = (id: string, object: Warehouse) => {
  confirm.require({
    message: `¿Estás seguro de que deseas cambiar el estado de disponibilidad de la bodega "${object.name}"?`,
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
      toast.warning("Operación cancelada. No se modificó el estado de la bodega.");
    },
  });
};

const { mutate } = useMutation({
  mutation: (id: string) => toogleWarehouse(id),
  onError(error) {
    toast.error("Ocurrió un error al cambiar el estado de disponibilidad de la bodega", {
      description: `${error.message}`,
    });
  },
  onSuccess() {
    toast.success("Estado de disponibilidad de la bodega actualizado correctamente.");
    queryCache.invalidateQueries({ key: ["getAllWarehouses"] });
  },
});
</script>
