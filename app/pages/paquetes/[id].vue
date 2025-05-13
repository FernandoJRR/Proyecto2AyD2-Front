<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/paquetes/">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Editar paquete</h1>

    <Form
      v-if="isPackageReady"
      v-slot="$form"
      :initialValues="formInitialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos del paquete</h2>

        <FloatLabel>
          <label for="name">Nombre</label>
          <InputText id="name" name="name" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>

        <FloatLabel>
          <label for="description">Descripción</label>
          <InputText id="description" name="description" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
          {{ $form.description.error?.message }}
        </Message>

        <FloatLabel>
          <label for="price">Precio</label>
          <InputNumber id="price" name="price" class="w-full" :min="0" :minFractionDigits="2" />
        </FloatLabel>
        <Message v-if="$form.price?.invalid" severity="error" size="small" variant="simple">
          {{ $form.price.error?.message }}
        </Message>

        <h2 class="text-2xl font-semibold pt-4">Detalles del paquete</h2>

        <div class="grid md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <Dropdown
              v-model="tempDetail.product"
              :options="productOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar producto"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <InputNumber v-model="tempDetail.quantity" class="w-full" :min="1" />
          </div>
          <div class="md:col-span-2 text-right">
            <Button label="Agregar detalle" icon="pi pi-plus" outlined @click="addDetail" />
          </div>
        </div>

        <Message
          v-if="formTouched && form.packageDetail.length === 0"
          severity="error"
          size="small"
          variant="simple"
        >
          Debe agregar al menos un producto
        </Message>

        <DataTable :value="form.packageDetail" class="mt-6" tableStyle="min-width: 100%">
          <Column header="Producto">
            <template #body="{ data }">
              {{ productMap[data.product]?.name ?? '—' }}
            </template>
          </Column>
          <Column header="Cantidad" field="quantity" />
          <Column header="Acciones">
            <template #body="{ index }">
              <Button icon="pi pi-trash" text severity="danger" @click="form.packageDetail.splice(index, 1)" />
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="pt-4">
        <Button type="submit" label="Guardar cambios" icon="pi pi-save" severity="secondary" />
      </div>
    </Form>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { FloatLabel } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { getPackageById, updatePackage } from '~/lib/api/package/package'
import { getAllProducts, getStates, type Product } from '~/lib/api/products/product'
import type { CreatePackageDetail, CreatePackage } from '~/lib/api/package/package'

const route = useRoute()
const confirm = useConfirm()
const id = route.params.id as string

const formTouched = ref(false)
const isPackageReady = ref(false)

const productOptions = ref<Product[]>([])
const productMap = ref<Record<string, Product>>({})

const tempDetail = reactive<CreatePackageDetail>({
  product: '',
  quantity: 1
})

const form = reactive<CreatePackage>({
  name: '',
  description: '',
  price: 0,
  packageDetail: [],
  active: true
})

const formInitialValues = ref({
  name: '',
  description: '',
  price: 0,
  active: true
})

onMounted(async () => {
  const stateProducts = await getStates();
  //Obtenemos el estdo que tenga name "Activo"
  const activeState = stateProducts.find((state) => state.name === "Activo");
  const products = await getAllProducts({
    id: null, name: null, code: null, barCode: null, type: null, state: activeState?.id || null
  })
  productOptions.value = products
  productMap.value = Object.fromEntries(products.map(p => [p.id, p]))

  const data = await getPackageById(id)
  formInitialValues.value = {
    name: data.name,
    description: data.description,
    price: data.price,
    active: data.active
  }

  form.packageDetail = data.packageDetail.map(d => ({
    product: d.product.id,
    quantity: d.quantity
  }))

  isPackageReady.value = true
})

const resolver = zodResolver(
  z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    price: z.number().min(0.01, 'El precio debe ser mayor a 0')
  })
)

const addDetail = () => {
  if (!tempDetail.product || tempDetail.quantity < 1) {
    toast.warning('Seleccione un producto y cantidad válida')
    return
  }

  form.packageDetail.push({ ...tempDetail })
  tempDetail.product = ''
  tempDetail.quantity = 1
}

const onFormSubmit = (e: any) => {
  formTouched.value = true

  if (e.valid && form.packageDetail.length > 0) {
    const payload: CreatePackage = {
      ...e.values,
      packageDetail: [...form.packageDetail],
      active: true
    }

    confirm.require({
      message: '¿Desea guardar los cambios del paquete?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, guardar',
      rejectLabel: 'Cancelar',
      accept: () => mutate(payload),
      reject: () => toast.warning('Cambios cancelados')
    })
  } else if (form.packageDetail.length === 0) {
    toast.error('Debes agregar al menos un producto')
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreatePackage) => updatePackage(id, payload),
  onError(error) {
    toast.error('Error al actualizar el paquete', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('Paquete actualizado correctamente')
    navigateTo('/paquetes/')
  }
})
</script>
