<template>
  <div class="m-6">
    <h1 class="text-2xl font-bold mb-4">Stock por Bodega</h1>

    <div class="mb-4">
      <Dropdown
        v-model="selectedWarehouseId"
        :options="warehouseOptions"
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccionar bodega"
        class="w-full md:w-64"
        @change="refetchStock"
      />
    </div>

    <DataTable
      :value="stockData"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 60rem"
    >
      <Column header="Producto">
        <template #body="{ data }">
          {{ productMap[data.productId]?.name ?? '—' }}
        </template>
      </Column>
      <Column field="warehouse.name" header="Bodega" />
      <Column field="quantity" header="Stock actual" />
      <Column field="minimumStock" header="Stock mínimo" />
      <Column header="Acciones">
        <template #body="{ data }">
          <Button 
            icon="pi pi-pencil" 
            label="Editar mínimo" 
            text 
            @click="editStockMin(data)" 
          />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" modal header="Editar stock mínimo">
      <div class="flex flex-col gap-4">
        <span>Bodega: {{ selectedStock?.warehouse.name }}</span>
        <InputNumber v-model="newMinimumStock" class="w-full" :min="0" />
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" text @click="showDialog = false" />
          <Button label="Guardar" icon="pi pi-save" @click="saveMinimumStock" />
        </div>
      </div>
    </Dialog>

    <h2 class="text-2xl font-bold mt-10 mb-4">Productos con stock bajo</h2>
    <DataTable
      :value="lowStockData"
      :loading="loadingLowStock"
      stripedRows
      tableStyle="min-width: 60rem"
    >
      <Column header="Producto">
        <template #body="{ data }">
          {{ productMap[data.productId]?.name ?? '—' }}
        </template>
      </Column>
      <Column field="warehouse.name" header="Bodega" />
      <Column field="quantity" header="Stock actual" />
      <Column field="minimumStock" header="Stock mínimo" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import { toast } from 'vue-sonner';
import { getAllWarehouses, type Warehouse } from '~/lib/api/warehouse/warehouse';
import { 
  getStockByWarehouse, 
  updateMinStock, 
  getAllProductsLowStock, 
  type Stock 
} from '~/lib/api/stock/stock';
import { getPrductsByIds, type Product } from '~/lib/api/products/product';

const selectedWarehouseId = ref<string | null>(null);
const warehouseOptions = ref<Warehouse[]>([]);
const stockData = ref<Stock[]>([]);
const lowStockData = ref<Stock[]>([]);
const loading = ref(false);
const loadingLowStock = ref(false);
const productMap = ref<Record<string, Product>>({});

const showDialog = ref(false);
const selectedStock = ref<Stock | null>(null);
const newMinimumStock = ref<number>(0);

onMounted(async () => {
  warehouseOptions.value = (
    await getAllWarehouses({ id: null, name: null, ubication: null, active: true })
  ).filter(w => w.active);

  await fetchLowStock();
});

const refetchStock = async () => {
  if (!selectedWarehouseId.value) return;
  loading.value = true;
  try {
    const data = await getStockByWarehouse(selectedWarehouseId.value);
    stockData.value = data;
    await loadProductInfo([...data, ...lowStockData.value]);
  } catch (error: any) {
    console.error('Error cargando stock:', error);
  } finally {
    loading.value = false;
  }
};

const fetchLowStock = async () => {
  loadingLowStock.value = true;
  try {
    const data = await getAllProductsLowStock();
    lowStockData.value = data;
    await loadProductInfo([...data, ...stockData.value]);
  } catch (error: any) {
    toast.error('Error al obtener productos con bajo stock', { description: error.message });
  } finally {
    loadingLowStock.value = false;
  }
};

const loadProductInfo = async (stocks: Stock[]) => {
  const uniqueIds = [...new Set(stocks.map(s => s.productId))];
  const products = await getPrductsByIds(uniqueIds);
  productMap.value = Object.fromEntries(products.map(p => [p.id, p]));
};

const editStockMin = (stock: Stock) => {
  selectedStock.value = stock;
  newMinimumStock.value = stock.minimumStock;
  showDialog.value = true;
};

const saveMinimumStock = async () => {
  if (!selectedStock.value) return;
  try {
    await updateMinStock({
      productId: selectedStock.value.productId,
      warehouseId: selectedStock.value.warehouse.id,
      minimumStock: newMinimumStock.value.toString()
    });
    toast.success('Stock mínimo actualizado');
    showDialog.value = false;
    refetchStock();
    fetchLowStock();
  } catch (error: any) {
    toast.error('Error al actualizar', { description: error.message });
  }
};
</script>