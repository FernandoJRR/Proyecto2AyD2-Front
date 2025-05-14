<template>
  <div class="m-6">
    <DataTable
      :value="state.data as any[]"
      tableStyle="min-width: 60rem"
      stripedRows
      :loading="asyncStatus === 'loading'"
      filterDisplay="row"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Entradas de productos</span>
          <router-link to="/entradas_productos/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Factura" field="invoiceNumber">
        <template #filter>
          <InputText
            v-model="spec.invoiceNumber"
            placeholder="Filtrar por factura"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.invoiceNumber ?? 'error' }}
        </template>
      </Column>

      <Column header="Bodega" field="warehouse.name">
        <template #filter>
          <Dropdown
            v-model="spec.warehouseId"
            :options="warehouseOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar bodega"
            class="w-full"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.warehouse?.name ?? 'error' }}
        </template>
      </Column>

      <Column header="Proveedor" field="supplier.name">
        <template #filter>
          <Dropdown
            v-model="spec.supplierId"
            :options="supplierOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar proveedor"
            class="w-full"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.supplier?.name ?? 'error' }}
        </template>
      </Column>

      <Column header="Fecha" field="date">
        <template #filter>
          <InputText
            v-model="spec.date"
            placeholder="AAAA-MM-DD"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.date }}
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="{ data }">
          <RouterLink :to="`/entradas_productos/ver/${data.id}`">
            <Button label="Ver" icon="pi pi-eye" severity="info" rounded text />
          </RouterLink>
        </template>
      </Column>

      <template #footer>
        Total: {{ state.data?.length || 0 }} entradas.
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { RouterLink } from "vue-router";
import {
  getAllProductEntries,
  type ProducEntry,
  type SpecProducEntry
} from "~/lib/api/product_entry/productEntry";
import { getAllWarehouses, type Warehouse } from "~/lib/api/warehouse/warehouse";
import { getAllSuppliers, type Supplier } from "~/lib/api/supplier/supplier";

const spec = reactive<SpecProducEntry>({
  id: null,
  invoiceNumber: null,
  warehouseId: null,
  supplierId: null,
  date: null
});

const warehouseOptions = ref<{ label: string; value: string | null }[]>([]);
const supplierOptions = ref<{ label: string; value: string | null }[]>([]);

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllProductEntries", spec],
  query: () => getAllProductEntries(spec)
});

onMounted(async () => {
  const [warehouses, suppliers] = await Promise.all([
    getAllWarehouses({ id: null, name: null, ubication: null, active: null }),
    getAllSuppliers({
      name: null, address: null, taxRegime: null, active: null,
      nit: null
    })
  ]);

  warehouseOptions.value = [
    { label: "Todas", value: null },
    ...warehouses.map((w: Warehouse) => ({ label: w.name, value: w.id }))
  ];

  supplierOptions.value = [
    { label: "Todos", value: null },
    ...suppliers.map((s: Supplier) => ({ label: s.name, value: s.id }))
  ];
});
</script>
