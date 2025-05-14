<template>
  <div class="p-8 max-w-5xl mx-auto bg-white shadow-md rounded-2xl border border-gray-200">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold mb-2">Factura de entrada</h1>
        <p class="text-gray-500">Código: <strong>{{ entry?.id }}</strong></p>
        <p class="text-gray-500">Fecha: <strong>{{ entry?.date }}</strong></p>
      </div>
      <router-link to="/entradas_productos/">
        <Button label="Regresar" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <h2 class="text-lg font-semibold mb-1">Proveedor</h2>
        <p><strong>{{ entry?.supplier.name }}</strong></p>
        <p class="text-sm text-gray-500">NIT: {{ entry?.supplier.nit }}</p>
        <p class="text-sm text-gray-500">Dirección: {{ entry?.supplier.address }}</p>
      </div>
      <div>
        <h2 class="text-lg font-semibold mb-1">Bodega</h2>
        <p><strong>{{ entry?.warehouse.name }}</strong></p>
        <p class="text-sm text-gray-500">Ubicación: {{ entry?.warehouse.ubication }}</p>
      </div>
    </div>

    <DataTable :value="entry?.details" tableStyle="min-width: 100%">
      <Column header="Producto">
        <template #body="{ data }">
          <div>
            <p class="font-semibold">{{ productMap[data.productId]?.name || 'Cargando...' }}</p>
            <p class="text-xs text-gray-500">Código: {{ productMap[data.productId]?.code }}</p>
            <p class="text-xs text-gray-500">Código barras: {{ productMap[data.productId]?.barCode }}</p>
          </div>
        </template>
      </Column>
      <Column header="Cantidad">
        <template #body="{ data }">{{ data.quantity }}</template>
      </Column>
      <Column header="Precio Unitario">
        <template #body="{ data }">Q{{ data.unitPrice.toFixed(2) }}</template>
      </Column>
      <Column header="Subtotal">
        <template #body="{ data }">Q{{ (data.quantity * data.unitPrice).toFixed(2) }}</template>
      </Column>
    </DataTable>

    <div class="text-right mt-6 text-lg">
      <strong>Total:</strong>
      Q{{ total.toFixed(2) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getProductEntry } from '~/lib/api/product_entry/productEntry'
import { getPrductsByIds } from '~/lib/api/products/product'
import type { ProducEntry } from '~/lib/api/product_entry/productEntry'
import type { Product } from '~/lib/api/products/product'

const entry = ref<ProducEntry | null>(null)
const productMap = ref<Record<string, Product>>({})
const route = useRoute()
const entryId = route.params.id as string

const total = computed(() => {
  return entry.value?.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0) || 0
})

onMounted(async () => {
  entry.value = await getProductEntry(entryId)

  const productIds = entry.value?.details.map(d => d.productId) ?? []
  if (productIds.length > 0) {
    const products = await getPrductsByIds(productIds)
    productMap.value = Object.fromEntries(products.map(p => [p.id, p]))
  }
})
</script>
