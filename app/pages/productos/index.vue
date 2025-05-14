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
          <span class="text-xl font-bold">Productos</span>
          <router-link to="/productos/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Nombre" field="name">
        <template #filter>
          <InputText v-model="specProduct.name" class="w-full" placeholder="Filtrar por nombre" @input="refetch()" />
        </template>
        <template #body="{ data }">{{ data.name ?? 'error' }}</template>
      </Column>

      <Column header="Código" field="code">
        <template #filter>
          <InputText v-model="specProduct.code" class="w-full" placeholder="Filtrar por código" @input="refetch()" />
        </template>
        <template #body="{ data }">{{ data.code ?? 'error' }}</template>
      </Column>

      <Column header="Código de barras" field="barCode">
        <template #filter>
          <InputText
            v-model="specProduct.barCode"
            class="w-full"
            placeholder="Filtrar por código de barras"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">{{ data.barCode ?? 'error' }}</template>
      </Column>

      <Column header="Tipo" field="type">
        <template #filter>
          <Dropdown
            v-model="specProduct.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por tipo"
            class="w-full"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ getLabelByValue(typeOptions, data.type) }}
        </template>
      </Column>

      <Column header="Estado" field="state">
        <template #filter>
          <Dropdown
            v-model="specProduct.state"
            :options="stateOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por estado"
            class="w-full"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ getLabelByValue(stateOptions, data.state) }}
        </template>
      </Column>

      <Column header="Precio" field="price">
        <template #body="{ data }">Q{{ data.price?.toFixed(2) ?? 'error' }}</template>
      </Column>

      <Column header="Acciones">
        <template #body="{ data }">
          <RouterLink :to="`/productos/${data.id}`">
            <Button label="Editar" severity="info" rounded text />
          </RouterLink>
        </template>
      </Column>

      <template #footer>
        Hay en total {{ state.data?.length || 0 }} productos.
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
  getAllProducts,
  deleteProduct,
  getTypes,
  getStates,
  type Product,
  type SpecProduct,
  type StateProduct,
  type TypeProduct
} from "~/lib/api/products/product";

const queryCache = useQueryCache();
const confirm = useConfirm();

const specProduct = reactive<SpecProduct>({
  id: null,
  name: null,
  code: null,
  barCode: null,
  type: null,
  state: null
});

const stateOptions = ref<{ label: string; value: string | null }[]>([]);
const typeOptions = ref<{ label: string; value: string | null }[]>([]);

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllProducts", specProduct],
  query: () => getAllProducts(specProduct)
});

onMounted(async () => {
  const types = await getTypes();
  const states = await getStates();

  typeOptions.value = [
    { label: "Todos", value: null },
    ...types.map((t: TypeProduct) => ({
      label: t.name,
      value: t.id
    }))
  ];

  stateOptions.value = [
    { label: "Todos", value: null },
    ...states.map((s: StateProduct) => ({
      label: s.name,
      value: s.id
    }))
  ];
});

const getLabelByValue = (options: { label: string; value: string | null }[], value: string | null) => {
  return options.find(opt => opt.value === value)?.label || value || '—';
};

const confirmDelete = (id: string, name: string) => {
  confirm.require({
    message: `¿Estás seguro de eliminar el producto "${name}"?`,
    header: "Confirmación",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancelar",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Eliminar",
      severity: "danger",
      icon: "pi pi-trash"
    },
    accept: () => {
      mutate(id);
    },
    reject: () => {
      toast.warning("Operación cancelada. No se eliminó el producto.");
    }
  });
};

const { mutate } = useMutation({
  mutation: (id: string) => deleteProduct(id),
  onError(error) {
    toast.error("Error al eliminar el producto", {
      description: error.message
    });
  },
  onSuccess(response) {
    toast.success("Producto eliminado correctamente");
    queryCache.invalidateQueries({ key: ["getAllProducts"] });
  }
});
</script>
