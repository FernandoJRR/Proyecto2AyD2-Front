<template>
  <div class="m-6 ml-12">
    <div class="mb-6">
      <router-link to="/admin/pagos-extra">
        <Button label="Ver Todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear Pago Extra</h1>
    <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="mt-8 flex justify-center">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex flex-row gap-4 mt-8">
          <div class="w-full">
            <template v-if="paymentTypes.status === 'success'">
              <FloatLabel>
                <label>Tipo de Extra</label>
                <Select name="type" v-model="selectedType" optionLabel="type" optionValue="id"
                  :options="paymentTypes.data" placeholder="Selecciona un tipo de usuario" fluid />
              </FloatLabel>
              <Message v-if="$form.type?.invalid" severity="error" size="small" variant="simple">{{
                $form.type.error?.message }}</Message>
            </template>
          </div>
        </div>
        <div class="flex flex-row gap-4 mt-8">
          <div class="w-full">
            <FloatLabel>
              <label>Descripcion</label>
              <Textarea name="description" type="text" fluid />
            </FloatLabel>
            <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">{{
              $form.description.error?.message }}</Message>
          </div>
        </div>
        <div class="flex flex-row mt-8">
          <div>
            <FloatLabel>
              <label>Monto</label>
              <InputNumber name="amount" :min="1" :minFractionDigits="2" :maxFractionDigits="2" mode="currency"
                currency="GTQ" placeholder="Salario" fluid />
            </FloatLabel>
            <Message v-if="$form.amount?.invalid" severity="error" size="small" variant="simple">{{
              $form.amount.error?.message }}</Message>
          </div>
        </div>
        <div class="flex flex-row gap-4 mt-8" v-if="selectedType">
          <div class="w-full">
            <FloatLabel>
              <label>Razón del {{ selectedTypeIsDiscount ? 'Descuento' : 'Pago' }}</label>
              <Select v-model="reason" :options="selectedTypeIsDiscount ? discountReasons : paymentReasons"
                optionLabel="label" optionValue="value" placeholder="Selecciona una razón" fluid />
            </FloatLabel>
          </div>
        </div>
        <Button type="submit" severity="secondary" label="Crear" icon="pi pi-save" />
      </div>
      <div class="m-6">
        <DataTable :value="availableEmployees" tableStyle="min-width: 30rem" stripedRows
          :loading="asyncStatus == 'loading'">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xl font-bold">Empleados</span>
            </div>
          </template>
          <Column header="Nombre Completo">
            <template #body="slotProps">
              <template v-if="slotProps.data.firstName !== null">
                {{ `${slotProps.data.firstName} ${slotProps.data.lastName}` }}
              </template>
              <template v-else>
                {{ `Admin` }}
              </template>
            </template>
          </Column>
          <Column header="Area">
            <template #body="slotProps">
              <Tag :value="slotProps.data.employeeType.name" />
              <Tag v-if="slotProps.data.desactivatedAt !== null" class="ml-2" value="Desactivado" severity="danger" />
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <Button label="Agregar" severity="info" rounded text
                @click="() => selectedEmployees.push(slotProps.data.id)" />
            </template>
          </Column>
          <template #footer> Hay en total {{ employeeState.data ? (employeeState.data as any[]).length : 0 }} usuarios.
          </template>
        </DataTable>
        <DataTable :value="selectedEmployeeObjects" tableStyle="min-width: 30rem" stripedRows class="mt-10">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-xl font-bold">Empleados Seleccionados</span>
            </div>
          </template>

          <Column header="Nombre Completo">
            <template #body="slotProps">
              {{ `${slotProps.data.firstName} ${slotProps.data.lastName}` }}
            </template>
          </Column>

          <Column header="Área">
            <template #body="slotProps">
              <Tag :value="slotProps.data.employeeType.name" />
            </template>
          </Column>

          <Column header="Acciones">
            <template #body="slotProps">
              <Button label="Quitar" severity="danger" rounded text
                @click="() => selectedEmployees.splice(selectedEmployees.indexOf(slotProps.data.id), 1)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </Form>
  </div>
</template>
<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { FloatLabel, InputNumber, Textarea } from 'primevue';
import { toast } from 'vue-sonner';
import { z } from 'zod';
import { createExtraPayment, getAllEmployees, type Employee, type ExtraPaymentPayload } from '~/lib/api/admin/employee';
import { getAllPaymentTypes } from '~/lib/api/admin/payment-type';

const initialValues = reactive({
  description: '',
  amount: 0,
  type: '',
});

const selectedType = ref('')
const selectedEmployees = ref<string[]>([])

const reason = ref('')

const discountReasons = [
  { label: 'Ausencias', value: 'Ausencias' },
  { label: 'Anticipos Salariales', value: 'Anticipos Salariales' },
  { label: 'Otros descuentos', value: 'Otros descuentos' }
]

const paymentReasons = [
  { label: 'Horas Extra', value: 'Horas Extra' },
  { label: 'Comisiones', value: 'Comisiones' },
  { label: 'Otras bonificaciones', value: 'Otras bonificaciones' }
]

const availableEmployees = computed(() => {
  if (employeeState.value.status === 'success' && Array.isArray(employeeState.value.data)) {
    return employeeState.value.data.filter((emp: any) => !selectedEmployees.value.includes(emp.id))
  }
  return []
})

const selectedEmployeeObjects = computed(() => {
  if (employeeState.value.status === 'success' && Array.isArray(employeeState.value.data)) {
    return employeeState.value.data.filter((emp: Employee) => selectedEmployees.value.includes(emp.id))
  }
  return []
})

const selectedTypeIsDiscount = computed(() => {
  const selected = paymentTypes.value.data?.find(t => t.id === selectedType.value)
  return selected?.type?.toLowerCase().includes('descuento') ?? false
})

const resolver = ref(zodResolver(
  z.object({
    description: z.string().min(1, 'La descripcion es obligatoria'),
    amount: z.number({ message: "El monto es obligatorio." }).min(1, 'El monto debe ser un numero positivo.'),
    type: z.string(),
  })
))

const onFormSubmit = (e: any) => {
  if (e.valid) {
    let payload: ExtraPaymentPayload = {
      description: e.values.description,
      amount: e.values.amount,
      paymentTypeId: e.values.type,
      employeesIds: selectedEmployees.value,
      reason: reason.value
    }

    mutate(payload)
  }
};

const { state: paymentTypes } = useCustomQuery({
  key: ['paymentsOptionTypes'],
  query: () => getAllPaymentTypes()
})

const { mutate } = useMutation({
  mutation: (extraPaymentData: ExtraPaymentPayload) => createExtraPayment(extraPaymentData),
  onError(error) {
    console.log(error)
    console.log(error.message)
    toast.error('Ocurrió un error al crear el extra', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('Extra creado correctamente')
    navigateTo('/admin/pagos-extra')
  }
})

const { state: employeeState, asyncStatus } = useCustomQuery({
  key: ['empleados-extra-payments'],
  query: () => getAllEmployees()
})

watch(
  () => paymentTypes.value.data,
  (data) => {
    if (data && data.length > 0) {
      selectedType.value = data[0].id;
      initialValues.type = data[0].id;
    }
  }, { immediate: true }
);
</script>
