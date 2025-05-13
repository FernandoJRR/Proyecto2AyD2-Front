<template>
  <div class="m-6">
    <DataTable
      :value="state.data as any[]"
      tableStyle="min-width: 50rem"
      stripedRows
      :loading="asyncStatus == 'loading'"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Bodegas</span>
          <!--Bton de mas-->
          <router-link to="/bodegas/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>
      <Column header="Id">
        <template #body="slotProps">
          <template v-if="slotProps.data.id !== null">
            {{ `${slotProps.data.id}` }}
          </template>
          <template v-else>
            {{ `error` }}
          </template>
        </template>
      </Column>

      <Column header="Nombre">
        <template #body="slotProps">
          <template v-if="slotProps.data.name !== null">
            {{ `${slotProps.data.name}` }}
          </template>
          <template v-else>
            {{ `error` }}
          </template>
        </template>
      </Column>

      <Column header="Ubicación">
        <template #body="slotProps">
          <template v-if="slotProps.data.ubication !== null">
            {{ `${slotProps.data.ubication}` }}
          </template>
          <template v-else>
            {{ `error` }}
          </template>
        </template>
      </Column>

      <Column header="Activa">
        <template #body="slotProps">
          <Tag :value="slotProps.data.active" />
        </template>
      </Column>

      <!--Botones de acciones-->
      <Column header="Acciones">
        <template #body="slotProps">
          <RouterLink :to="`/bodegas/${slotProps.data.id}`">
            <Button label="Editar" severity="info" rounded text />
          </RouterLink>
          <Button
            v-if="slotProps.data.name !== null"
            label="Cambiar Estado"
            severity="danger"
            rounded
            text
            @click="
              toggleAvailability(slotProps.data.id, slotProps.data)
            "
          />
        </template>
      </Column>
      <template #footer>
        Hay en total
        {{ state.data ? (state.data as any[]).length : 0 }} bodegas.
      </template>
    </DataTable>
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>
<!--Controlador-->
<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { RouterLink } from "vue-router";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { toast } from "vue-sonner";
import {
  getAllWarehouses,
  type SpecWarehouse,
  type Warehouse,
} from "~/lib/api/warehouse/warehouse";
import { toogleWarehouse } from "~/lib/api/warehouse/warehouse";
//este es el controlador de caches de las queries de pinia colada
const queryCache = useQueryCache();
//esto es la constante que usa vue para manejar sus dialogs
const confirm = useConfirm();

const specWarehouse = reactive({
  id: null,
  name: null,
  active: null,
  ubication: null,
} as SpecWarehouse);

const { state, asyncStatus } = useCustomQuery({
  key: ["getAllWarehouses"],
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
      toast.warning(
        "Operación cancelada. No se modificó el estado de la bodega."
      );
    },
  });
};

const { mutate } = useMutation({
  mutation: (id: string) => toogleWarehouse(id),
  onError(error) {
    console.log(error);
    console.log(error.cause);
    toast.error(
      "Ocurrió un error al cambiar el estado de disponibilidad de la bodega",
      {
        description: `${error.message}`,
      }
    );
  },
  onSuccess() {
    toast.success(
      "Estado de disponibilidad de la bodega actualizado correctamente."
    );
    queryCache.invalidateQueries({ key: ["getAllWarehouses"] });
  },
});
</script>
