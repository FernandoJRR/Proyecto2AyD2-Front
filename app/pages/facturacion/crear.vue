<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/facturas/">
        <Button label="Ver Todas" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear factura</h1>

    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos de la factura</h2>

        <FloatLabel>
          <label for="clientDocument">Documento del cliente</label>
          <InputText id="clientDocument" name="clientDocument" type="text" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.clientDocument?.invalid" severity="error" size="small" variant="simple">
          {{ $form.clientDocument.error?.message }}
        </Message>

        <FloatLabel>
          <label for="paymentMethod">Método de pago</label>
          <Dropdown
            id="paymentMethod"
            name="paymentMethod"
            :options="paymentOptions"
            optionLabel="name"
            optionValue="paymentMethod"
            placeholder="Seleccionar método de pago"
            class="w-full"
          />
        </FloatLabel>
        <Message v-if="$form.paymentMethod?.invalid" severity="error" size="small" variant="simple">
          {{ $form.paymentMethod.error?.message }}
        </Message>

        <h2 class="text-2xl font-semibold pt-4">Detalles</h2>
        <div class="grid md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ítem</label>
            <Dropdown
              v-model="tempDetail.itemId"
              :options="itemOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar ítem"
              class="w-full"
              @change="updateItemType"
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

        <DataTable :value="form.details" class="mt-6" tableStyle="min-width: 100%">
          <Column header="Ítem">
            <template #body="{ data }">
              {{ itemMap[data.itemId]?.name ?? '—' }}
            </template>
          </Column>
          <Column header="Cantidad" field="quantity" />
          <Column header="Precio unitario">
            <template #body="{ data }">
              Q{{ data.unitPrice.toFixed(2) }}
            </template>
          </Column>
          <Column header="Total">
            <template #body="{ data }">
              Q{{ (data.unitPrice * data.quantity).toFixed(2) }}
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="{ index }">
              <Button icon="pi pi-trash" text severity="danger" @click="form.details.splice(index, 1)" />
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="text-right text-lg font-semibold mt-4">
        Total: Q{{ form.details.reduce((sum, d) => sum + d.quantity * d.unitPrice, 0).toFixed(2) }}
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
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { createInvoice, getPaymentMethods } from '~/lib/api/invoices/invoice'
import { getAllProducts, getStates } from '~/lib/api/products/product'
import { getAllPackages } from '~/lib/api/package/package'
import type { CreateInvoice, CreateInvoiceDetail, PaymentMethod } from '~/lib/api/invoices/invoice'

const paymentOptions = ref<PaymentMethod[]>([])
const itemOptions = ref<{ id: string; name: string; price: number; itemType: string }[]>([])
const itemMap = ref<Record<string, { name: string; price: number; itemType: string }>>({})

const tempDetail = reactive<CreateInvoiceDetail>({
  itemId: '',
  itemName: '',
  itemType: '',
  quantity: 1,
  unitPrice: 0,
})

const form = reactive<CreateInvoice>({
  paymentMethod: '',
  clientDocument: '',
  details: []
})

const initialValues = form

onMounted(async () => {
  paymentOptions.value = await getPaymentMethods()
  const statesProducts = await getStates();
  const activeState = statesProducts.find((state) => state.name === "Activo");

  const products = await getAllProducts({
    id: null,
    name: null,
    code: null,
    barCode: null,
    type: null,
    state: activeState?.id || null
  });
  const allPackages = await getAllPackages();
  //Filtramos los paquetes activos
  const packages = allPackages.filter(p => p.active);
  
  const formattedItems = [
    ...products.map(p => ({ id: p.id, name: p.name, price: Number(p.price), itemType: 'PRODUCT' })),
    ...packages.filter(p => p.active).map(p => ({ id: p.id, name: p.name, price: Number(p.price), itemType: 'PACKAGE' }))
  ]

  itemOptions.value = formattedItems
  itemMap.value = Object.fromEntries(formattedItems.map(i => [i.id, i]))
})

const resolver = zodResolver(
  z.object({
    paymentMethod: z.string().min(1, 'Debe seleccionar un método de pago'),
    clientDocument: z.string().min(1, 'Debe ingresar un documento'),
  })
)

const updateItemType = () => {
  const item = itemMap.value[tempDetail.itemId]
  if (item) {
    tempDetail.itemName = item.name
    tempDetail.itemType = item.itemType
    tempDetail.unitPrice = item.price
  }
}

const addDetail = () => {
  if (!tempDetail.itemId || tempDetail.quantity < 1) {
    toast.warning('Seleccione un ítem y cantidad válida')
    return
  }
  form.details.push({ 
    ...tempDetail, 
    total: tempDetail.quantity * tempDetail.unitPrice, 
    id: crypto.randomUUID() 
  })
  tempDetail.itemId = ''
  tempDetail.itemName = ''
  tempDetail.itemType = ''
  tempDetail.quantity = 1
  tempDetail.unitPrice = 0
}

const onFormSubmit = (e: any) => {
  if (e.valid && form.details.length > 0) {
    // mutate({ ...e.values, details: [...form.details] })
  } else {
    toast.error('Debe completar todos los campos y agregar al menos un detalle')
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreateInvoice) => createInvoice(payload),
  onError(error) {
    toast.error('Error al crear la factura', { description: error.message })
  },
  onSuccess() {
    toast.success('Factura creada correctamente')
    navigateTo('/facturas/')
  }
})
</script>
