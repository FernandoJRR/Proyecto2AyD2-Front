<template>
  <div class="p-8 max-w-4xl mx-auto">
    <!-- Encabezado y navegación -->
    <div class="mb-6">
      <router-link to="/bodegas/">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear una bodega</h1>

    <!-- Formulario principal -->
    <Form v-slot="$form" :initialValues="initialValues" :resolver="resolver" @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
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

      <!-- Botón de envío -->
      <div class="pt-4">
        <Button type="submit" label="Crear" icon="pi pi-save" severity="secondary" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { FloatLabel } from 'primevue'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { createWarehouse } from '~/lib/api/warehouse/warehouse'
import type { CreateWarehouse } from '~/lib/api/warehouse/warehouse'

const initialValues = reactive({
  name: '',
  ubication: ''
})

const resolver = zodResolver(
  z.object({
    name: z.string()
      .min(1, 'El nombre es obligatorio')
      .max(100, 'El nombre no puede exceder los 100 caracteres'),

    ubication: z.string()
      .min(1, 'La ubicación es obligatoria')
      .max(255, 'La ubicación no puede exceder los 255 caracteres')
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    const payload: CreateWarehouse = {
      name: e.values.name,
      ubication: e.values.ubication,
      active: true
    }
    mutate(payload)
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreateWarehouse) => createWarehouse(payload),
  onError(error) {
    toast.error('Ocurrió un error al crear la bodega', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('La bodega se ha creado correctamente')
    navigateTo('/bodegas/')
  }
})
</script>
