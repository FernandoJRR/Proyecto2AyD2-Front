<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/productos/">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear un producto</h1>

    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos del producto</h2>

        <FloatLabel>
          <label for="name">Nombre</label>
          <InputText id="name" name="name" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>

        <FloatLabel>
          <label for="code">Código</label>
          <InputText id="code" name="code" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.code?.invalid" severity="error" size="small" variant="simple">
          {{ $form.code.error?.message }}
        </Message>

        <FloatLabel>
          <label for="barCode">Código de barras</label>
          <InputText id="barCode" name="barCode" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.barCode?.invalid" severity="error" size="small" variant="simple">
          {{ $form.barCode.error?.message }}
        </Message>

        <FloatLabel>
          <label for="price">Precio</label>
          <InputNumber id="price" name="price" class="w-full" :min="0" :minFractionDigits="2" />
        </FloatLabel>
        <Message v-if="$form.price?.invalid" severity="error" size="small" variant="simple">
          {{ $form.price.error?.message }}
        </Message>

        <FloatLabel>
          <label for="type">Tipo</label>
          <Dropdown
            id="type"
            name="type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar tipo"
            class="w-full"
          />
        </FloatLabel>
        <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple">
          {{ $form.type.error?.message }}
        </Message>

        <FloatLabel>
          <label for="state">Estado</label>
          <Dropdown
            id="state"
            name="state"
            :options="stateOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar estado"
            class="w-full"
          />
        </FloatLabel>
        <Message v-if="$form.state?.invalid" severity="error" size="small" variant="simple">
          {{ $form.state.error?.message }}
        </Message>
      </div>

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
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import { createProduct, getTypes, getStates } from '~/lib/api/products/product'
import type { CreateProduct, StateProduct, TypeProduct } from '~/lib/api/products/product'

const typeOptions = ref<{ label: string; value: string }[]>([])
const stateOptions = ref<{ label: string; value: string }[]>([])

onMounted(async () => {
  const types = await getTypes()
  const states = await getStates()

  typeOptions.value = types.map((t: TypeProduct) => ({ label: t.name, value: t.id }))
  stateOptions.value = states.map((s: StateProduct) => ({ label: s.name, value: s.id }))
})

const initialValues = reactive<CreateProduct>({
  name: '',
  code: '',
  barCode: '',
  price: 1,
  type: '',
  state: ''
})

const resolver = zodResolver(
  z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100),
    code: z.string().min(1, 'El código es obligatorio').max(50),
    barCode: z.string().min(1, 'El código de barras es obligatorio').max(50),
    price: z.number().min(1, 'El precio debe ser mayor a 0'),
    type: z.string().min(1, 'Debe seleccionar un tipo'),
    state: z.string().min(1, 'Debe seleccionar un estado')
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    mutate(e.values)
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreateProduct) => createProduct(payload),
  onError(error) {
    toast.error('Ocurrió un error al crear el producto', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('El producto se ha creado correctamente')
    navigateTo('/productos/')
  }
})
</script>
