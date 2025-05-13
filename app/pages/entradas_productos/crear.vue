<template>
  <div
    class="p-8 max-w-6xl mx-auto bg-white shadow-md rounded-2xl border border-gray-200"
  >
    <div class="mb-6">
      <h1 class="text-4xl font-bold mb-4">Nueva entrada de productos</h1>
      <router-link to="/entradas_productos/">
        <Button icon="pi pi-arrow-left" label="Regresar" text />
      </router-link>
    </div>

    <!-- Datos generales -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <FloatLabel>
        <label for="invoice">Número de factura</label>
        <InputText id="invoice" v-model="form.invoiceNumber" class="w-full" />
      </FloatLabel>

      <FloatLabel>
        <label for="date">Fecha</label>
        <InputText id="date" type="date" v-model="form.date" class="w-full" />
      </FloatLabel>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Proveedor</label
        >
        <Dropdown
          v-model="form.supplierId"
          :options="supplierOptions"
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccionar proveedor"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Bodega</label
        >
        <Dropdown
          v-model="form.warehouseId"
          :options="warehouseOptions"
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccionar bodega"
          class="w-full"
        />
      </div>
    </div>

    <!-- Detalles -->
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-2xl font-semibold">Detalles</h2>
      <Button
        icon="pi pi-plus"
        label="Agregar detalle"
        @click="showAddModal = true"
        outlined
      />
    </div>

    <DataTable :value="form.details" tableStyle="min-width: 100%">
      <Column header="Producto">
        <template #body="{ data }">
          <div>
            <p class="font-semibold">
              {{ productMap[data.productId]?.name || "—" }}
            </p>
            <p class="text-sm text-gray-500">
              Código: {{ productMap[data.productId]?.code }}
            </p>
          </div>
        </template>
      </Column>
      <Column header="Cantidad" field="quantity" />
      <Column header="Precio Unitario">
        <template #body="{ data }">Q{{ data.unitPrice.toFixed(2) }}</template>
      </Column>
      <Column header="Subtotal">
        <template #body="{ data }"
          >Q{{ (data.quantity * data.unitPrice).toFixed(2) }}</template
        >
      </Column>
      <Column header="Acciones">
        <template #body="{ index }">
          <Button icon="pi pi-pencil" text @click="editDetail(index)" />
          <Button
            icon="pi pi-trash"
            text
            severity="danger"
            @click="form.details.splice(index, 1)"
          />
        </template>
      </Column>
    </DataTable>

    <div class="text-right mt-4 text-xl">
      <strong>Total:</strong> Q{{ total.toFixed(2) }}
    </div>

    <!-- Confirmar -->
    <div class="pt-6">
      <Button
        label="Guardar entrada"
        icon="pi pi-save"
        severity="success"
        @click="confirmCreate"
      />
    </div>

    <!-- Modal agregar detalle -->
    <Dialog
      v-model:visible="showAddModal"
      header="Agregar producto"
      modal
      class="w-[90vw] max-w-3xl"
    >
      <div class="mb-4" v-if="!selectedProduct">
        <DataTable
          :value="productResults"
          :paginator="false"
          :loading="loadingProducts"
          selectionMode="single"
          @rowSelect="onSelectProduct"
        >
          <Column field="name" header="Nombre" />
          <Column field="code" header="Código" />
          <Column field="barCode" header="Cód. Barras" />
        </DataTable>
      </div>

      <div v-if="selectedProduct">
        <!-- Mostramos informacion del producto seleccionado -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">
            Nombre: {{ selectedProduct.name }}
          </h3>
          <p class="text-sm text-gray-500">
            Código: {{ selectedProduct.code }}
          </p>
          <p class="text-sm text-gray-500">
            Código de barras: {{ selectedProduct.barCode }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <FloatLabel>
            <label for="qty">Cantidad</label>
            <InputNumber
              id="qty"
              v-model="tempDetail.quantity"
              class="w-full"
              :min="1"
            />
          </FloatLabel>
          <FloatLabel>
            <label for="price">Precio Unitario</label>
            <InputNumber
              id="price"
              v-model="tempDetail.unitPrice"
              class="w-full"
              mode="currency"
              currency="GTQ"
            />
          </FloatLabel>
        </div>
      </div>

      <div class="text-right mt-4">
        <Button label="Agregar" icon="pi pi-check" @click="addOrUpdateDetail" />
      </div>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";
import { useConfirm } from "primevue/useconfirm";
import Dialog from "primevue/dialog";
import ConfirmDialog from "primevue/confirmdialog";
import { getAllWarehouses } from "~/lib/api/warehouse/warehouse";
import { getAllSuppliers } from "~/lib/api/supplier/supplier";
import { getAllProducts } from "~/lib/api/products/product";
import { getStates } from "~/lib/api/products/product";
import { createProductEntry } from "~/lib/api/product_entry/productEntry";
import type {
  CreateProducEntry,
  CreateProducEntryDetail,
} from "~/lib/api/product_entry/productEntry";
import type { Warehouse } from "~/lib/api/warehouse/warehouse";
import type { Supplier } from "~/lib/api/supplier/supplier";
import type { Product, StateProduct } from "~/lib/api/products/product";

const confirm = useConfirm();

const form = reactive<CreateProducEntry>({
  invoiceNumber: "",
  date: "",
  warehouseId: "",
  supplierId: "",
  details: [],
});

const total = computed(() =>
  form.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0)
);

const warehouseOptions = ref<Warehouse[]>([]);
const supplierOptions = ref<Supplier[]>([]);
const productResults = ref<Product[]>([]);
const productMap = ref<Record<string, Product>>({});

const selectedProduct = ref<Product | null>(null);
const showAddModal = ref(false);
const loadingProducts = ref(false);
const editIndex = ref<number | null>(null);
const stateOptions = ref<StateProduct[]>([]);

const tempDetail = reactive<CreateProducEntryDetail>({
  productId: "",
  quantity: 1,
  unitPrice: 0,
});

onMounted(async () => {
  warehouseOptions.value = await getAllWarehouses({
    id: null,
    name: null,
    ubication: null,
    active: true,
  });
  supplierOptions.value = await getAllSuppliers({
    name: null,
    address: null,
    taxRegime: null,
    active: true,
    nit: null,
  });
  stateOptions.value = await getStates();
  await loadProducts();
});

const loadProducts = async () => {
  loadingProducts.value = true;
  console.log(stateOptions.value);
  //Obtengo la opcion que tenga el name 'Activo'
  const activeState = stateOptions.value.find((s) => s.name === "Activo");
  console.log(activeState);
  let estado = activeState?.id ? activeState.id : null;
  const data = await getAllProducts({
    id: null,
    name: null,
    code: null,
    barCode: null,
    type: null,
    state: estado,
  });
  productResults.value = data;
  productMap.value = Object.fromEntries(
    productResults.value.map((p) => [p.id, p])
  );
  loadingProducts.value = false;
};

const onSelectProduct = ({ data }: { data: Product }) => {
  selectedProduct.value = data;
  tempDetail.productId = data.id;
  tempDetail.quantity = 1;
  tempDetail.unitPrice = data.price as number;
};

const addOrUpdateDetail = () => {
  if (!selectedProduct.value) return;

  if (editIndex.value !== null) {
    form.details[editIndex.value] = { ...tempDetail };
    editIndex.value = null;
  } else {
    form.details.push({ ...tempDetail });
  }

  selectedProduct.value = null;
  showAddModal.value = false;
};

const editDetail = (index: number) => {
  const detail = form.details[index];
  const product = productMap.value[detail.productId];
  if (!product) return;

  tempDetail.productId = detail.productId;
  tempDetail.quantity = detail.quantity;
  tempDetail.unitPrice = detail.unitPrice;
  selectedProduct.value = product;
  editIndex.value = index;
  showAddModal.value = true;
};

const confirmCreate = () => {
  confirm.require({
    message: "¿Está seguro de guardar esta entrada?",
    header: "Confirmar creación",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Sí, guardar",
    rejectLabel: "Cancelar",
    accept: async () => {
      try {
        await createProductEntry(form);
        toast.success("Entrada creada correctamente");
        navigateTo("/entradas_productos/");
      } catch (error: any) {
        toast.error("Error al guardar la entrada", {
          description: error.message,
        });
      }
    },
  });
};
</script>
