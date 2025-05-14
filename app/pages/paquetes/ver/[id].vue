<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <router-link to="/paquetes/">
        <Button label="Volver" icon="pi pi-arrow-left" text />
      </router-link>
      <router-link :to="`/paquetes/${id}`">
        <Button icon="pi pi-pencil" label="Editar" outlined />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Detalle del paquete</h1>

    <div class="bg-white shadow-md rounded-2xl p-6 border border-gray-200 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-gray-500 text-sm mb-1">Nombre</h2>
          <p class="text-lg font-medium">{{ paquete?.name || '—' }}</p>
        </div>
        <div>
          <h2 class="text-gray-500 text-sm mb-1">Descripción</h2>
          <p class="text-lg font-medium">{{ paquete?.description || '—' }}</p>
        </div>
        <div>
          <h2 class="text-gray-500 text-sm mb-1">Precio</h2>
          <p class="text-lg font-medium">Q{{ paquete?.price.toFixed(2) }}</p>
        </div>
        <div>
          <h2 class="text-gray-500 text-sm mb-1">Estado</h2>
          <Tag :value="paquete?.active ? 'Activo' : 'Inactivo'" :severity="paquete?.active ? 'success' : 'danger'" />
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mt-4 mb-2">Productos incluidos</h2>
        <DataTable :value="paquete?.packageDetail" tableStyle="min-width: 100%">
          <Column header="Producto">
            <template #body="{ data }">
              {{ data.product.name }}
            </template>
          </Column>
          <Column header="Código">
            <template #body="{ data }">
              {{ data.product.code }}
            </template>
          </Column>
          <Column header="Cantidad" field="quantity" />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getPackageById, type Package } from '~/lib/api/package/package'

const route = useRoute()
const id = route.params.id as string

const paquete = ref<Package | null>(null)

onMounted(async () => {
  paquete.value = await getPackageById(id)
})
</script>
