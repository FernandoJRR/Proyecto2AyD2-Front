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
          <span class="text-xl font-bold">Proveedores</span>
          <router-link to="/proveedores/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Nombre" field="name">
        <template #filter>
          <InputText
            v-model="specSupplier.name"
            placeholder="Filtrar por nombre"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.name ?? 'error' }}
        </template>
      </Column>

      <Column header="Dirección" field="address">
        <template #filter>
          <InputText
            v-model="specSupplier.address"
            placeholder="Filtrar por dirección"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.address ?? 'error' }}
        </template>
      </Column>

      <Column header="Activa" field="active">
        <template #filter>
          <Dropdown
            v-model="specSupplier.active"
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
          <RouterLink :to="`/proveedores/${data.id}`">
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
        Hay en total {{ state.data?.length || 0 }} proveedores.
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
  getAllSuppliers,
  toogleSupplier,
  type Supplier,
  type SpecSupplier
} from "~/lib/api/supplier/supplier"; // Asegúrate que este path es correcto

const queryCache = useQueryCache();
const confirm = useConfirm();

const specSupplier = reactive<SpecSupplier>({
  nit: null,
  name: null,
  address: null,
  taxRegime: null,
  active: null,
});

const activeOptions = [
  { label: "Todos", value: null },
  { label: "Activa", value: true },
  { label: "No activa", value: false },
];

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllSuppliers", specSupplier],
  query: () => getAllSuppliers(specSupplier),
});

const toggleAvailability = (id: string, object: Supplier) => {
  confirm.require({
    message: `¿Estás seguro de que deseas cambiar el estado del proveedor "${object.name}"?`,
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
      toast.warning("Operación cancelada. No se modificó el estado del proveedor.");
    },
  });
};

const { mutate } = useMutation({
  mutation: (id: string) => toogleSupplier(id),
  onError(error) {
    toast.error("Ocurrió un error al cambiar el estado del proveedor", {
      description: `${error.message}`,
    });
  },
  onSuccess() {
    toast.success("Estado del proveedor actualizado correctamente.");
    queryCache.invalidateQueries({ key: ["getAllSuppliers"] });
  },
});
</script>
