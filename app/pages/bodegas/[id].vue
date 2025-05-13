<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/bodegas/">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>
    <h1 class="text-4xl font-bold mb-6">Editar una bodega</h1>

    <Form
      v-slot="$form"
      v-if="isWarehouseReady"
      :initialValues="formInitialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos de la bodega</h2>

        <div class="w-full">
          <FloatLabel>
            <label for="name">Nombre de la bodega</label>
            <InputText id="name" name="name" type="text" class="w-full" />
          </FloatLabel>
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
            {{ $form.name.error?.message }}
          </Message>
        </div>

        <div class="w-full">
          <FloatLabel>
            <label for="ubication">Ubicación</label>
            <InputText id="ubication" name="ubication" type="text" class="w-full" />
          </FloatLabel>
          <Message v-if="$form.ubication?.invalid" severity="error" size="small" variant="simple">
            {{ $form.ubication.error?.message }}
          </Message>
        </div>
      </div>

      <div class="pt-4">
        <Button type="submit" label="Editar" icon="pi pi-pencil" severity="secondary" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { FloatLabel } from 'primevue'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { useRoute } from 'vue-router'
import { getWarehouseById, updateWarehouse } from '~/lib/api/warehouse/warehouse'
import type { UpdateWarehouse, Warehouse } from '~/lib/api/warehouse/warehouse'

const queryCache = useQueryCache()
const warehouseId = useRoute().params.id as string

const formInitialValues = ref({
  name: '',
  ubication: ''
})
const isWarehouseReady = ref(false)

const { data: foundedWarehouse } = useCustomQuery<Warehouse>({
  key: ['getWarehouseById', warehouseId],
  query: () => getWarehouseById(warehouseId)
})

watch(
  () => foundedWarehouse.value,
  (data) => {
    if (data) {
      formInitialValues.value = {
        name: data.name,
        ubication: data.ubication
      }
      isWarehouseReady.value = true
    }
  },
  { immediate: true }
)

const resolver = zodResolver(
  z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100),
    ubication: z.string().min(1, 'La ubicación es obligatoria').max(255)
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    const payload: UpdateWarehouse = {
      name: e.values.name,
      ubication: e.values.ubication,
      active: true
    }
    mutate(payload)
  }
}

const { mutate } = useMutation({
  mutation: (payload: UpdateWarehouse) => updateWarehouse(warehouseId, payload),
  onError(error) {
    toast.error('Ocurrió un error al editar la bodega', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('La bodega se ha editado correctamente')
    queryCache.invalidateQueries({ key: ['getWarehouseById'] })
    queryCache.invalidateQueries({ key: ['getAllWarehouses'] })
    navigateTo('/bodegas/')
  }
})
</script>
