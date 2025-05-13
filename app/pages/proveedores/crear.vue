<template>
  <div class="p-8 max-w-4xl mx-auto">
    <!-- Encabezado y navegación -->
    <div class="mb-6">
      <router-link to="/proveedores/">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear un proveedor</h1>

    <!-- Formulario principal -->
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos del proveedor</h2>

        <div class="w-full">
          <FloatLabel>
            <label for="nit">NIT</label>
            <InputText id="nit" name="nit" type="text" class="w-full" />
          </FloatLabel>
          <Message v-if="$form.nit?.invalid" severity="error" size="small" variant="simple">
            {{ $form.nit.error?.message }}
          </Message>
        </div>

        <div class="w-full">
          <FloatLabel>
            <label for="name">Nombre</label>
            <InputText id="name" name="name" type="text" class="w-full" />
          </FloatLabel>
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
            {{ $form.name.error?.message }}
          </Message>
        </div>

        <div class="w-full">
          <FloatLabel>
            <label for="address">Dirección</label>
            <InputText id="address" name="address" type="text" class="w-full" />
          </FloatLabel>
          <Message v-if="$form.address?.invalid" severity="error" size="small" variant="simple">
            {{ $form.address.error?.message }}
          </Message>
        </div>

        <div class="w-full">
          <FloatLabel>
            <label for="taxRegime">Régimen tributario</label>
            <Dropdown
              id="taxRegime"
              name="taxRegime"
              :options="taxOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              placeholder="Seleccione un régimen"
            />
          </FloatLabel>
          <Message v-if="$form.taxRegime?.invalid" severity="error" size="small" variant="simple">
            {{ $form.taxRegime.error?.message }}
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
import Dropdown from 'primevue/dropdown'
import { createSupplier } from '~/lib/api/supplier/supplier'
import type { CreateSupplier } from '~/lib/api/supplier/supplier'

const taxOptions = [
  { label: 'Pequeño contribuyente (5%)', value: 0.05 },
  { label: 'Régimen general (12%)', value: 0.12 }
]

const initialValues = reactive<CreateSupplier>({
  nit: '',
  name: '',
  address: '',
  taxRegime: 0.05,
  active: true
})

const resolver = zodResolver(
  z.object({
    nit: z.string()
      .min(1, 'El NIT es obligatorio')
      .max(50, 'El NIT no puede exceder los 50 caracteres'),

    name: z.string()
      .min(1, 'El nombre es obligatorio')
      .max(100, 'El nombre no puede exceder los 100 caracteres'),

    address: z.string()
      .min(1, 'La dirección es obligatoria')
      .max(255, 'La dirección no puede exceder los 255 caracteres'),

    taxRegime: z.union([
      z.literal(0.05),
      z.literal(0.12)
    ], {
      errorMap: () => ({ message: 'Debe seleccionar un régimen válido (5% o 12%)' })
    })
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    const payload: CreateSupplier = {
      ...e.values,
      active: true
    }
    mutate(payload)
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreateSupplier) => createSupplier(payload),
  onError(error) {
    toast.error('Ocurrió un error al crear el proveedor', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('El proveedor se ha creado correctamente')
    navigateTo('/proveedores/')
  }
})
</script>
