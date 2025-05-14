<template>
  <div class="m-6 ml-12">
    <router-link to="/admin/personal">
      <Button label="Ver Todos" icon="pi pi-arrow-left" text />
    </router-link>
    <div v-if="state.status === 'pending'" class="flex flex-col">
      Cargando...
    </div>
    <div v-else-if="state.status === 'error'">
      Ocurrio un error inesperado
    </div>
    <div v-else class="grid grid-cols-2 mt-4">
      <div class="flex flex-col gap-4">
        <div class="flex flex-row gap-4">
          <h1 class="text-3xl font-semibold">{{ `${state.data.employee.firstName} ${state.data.employee.lastName}` }}
          </h1>
          <Tag :value="state.data.employee.employeeType.name" />
        </div>
        <div class="flex flex-row gap-x-2 text-lg">
          <p class="font-medium">Salario Actual:</p>
          <p class="font-semibold">Q.{{ state.data.employee.salary }}</p>
        </div>
        <h1 class="text-xl font-semibold">Descuentos</h1>
        <div class="flex flex-row gap-6">
          <div class="flex flex-row h-6 gap-4">
            <p class="font-medium">IGSS</p>
            <Tag :severity="state.data.employee.igssPercentage ? 'success' : 'danger'">
              {{ state.data.employee.igssPercentage ? `${state.data.employee.igssPercentage}%` : 'No Aplica' }}</Tag>
          </div>
          <div class="flex flex-row h-6 gap-4">
            <p class="font-medium">IRTRA</p>
            <Tag :severity="state.data.employee.irtraPercentage ? 'success' : 'danger'">
              {{ state.data.employee.irtraPercentage ? `${state.data.employee.irtraPercentage}%` : 'No Aplica' }}
            </Tag>
          </div>
        </div>
        <div>
          <p class="text-3xl font-medium mb-4">Caja Asignada</p>
          <Tag severity="warn">
          {{ cashRegister.status === "error"
            ? "No se encontro una Caja Registradora asignada"
            : `Asignada la caja ${cashRegister.data?.code}`
          }}
          </Tag>
          <template v-if="availableCashRegisters.status !== 'error'">
            {{ availableCashRegisters.data }}
            <p class="text-xl font-medium mb-2 mt-2">Asignar Nueva Caja</p>
            <Select v-model="selectedCashRegister" :options="availableCashRegisters.data" optionLabel="code"
              placeholder="Selecciona una caja registradora" class="w-full md:w-56" />
            <Button class="ml-2" label="Asignar" @click="submitChangeCashRegister" />
          </template>
        </div>
      </div>
      <div>
        <div class="flex flex-row">
          <DataTable dataKey="id" :value="state.data.histories">
            <template #header>
              <div class="flex justify-start">
                <p class="text-3xl font-medium mb-4">Historial</p>
              </div>
            </template>
            <template #loading> Cargando historial del empleado. </template>
            <Column field="commentary" header="Tipo" style="min-width: 12rem">
              <template #body="{ data }">
                <Tag severity="secondary">
                  {{ data.historyType.type }}
                </Tag>
              </template>
            </Column>
            <Column header="Comentario" style="min-width: 12rem">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <p class="text-lg font-medium">
                    {{ data.historyType.type === "Aumento Salarial" || data.historyType.type === "Disminucion Salarial"
                      ? `Salario modificado a Q.${data.commentary}` : data.commentary }}
                  </p>
                </div>
              </template>
            </Column>
            <Column header="Fecha" style="min-width: 14rem">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <Tag rounded>
                    {{ data.historyDate }}
                  </Tag>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Select } from 'primevue';
import { toast } from 'vue-sonner';
import { getEmployeeById } from '~/lib/api/admin/employee';
import { getAllCashRegisters, getCashRegisterByEmployeeId, updateCashRegister, type CashRegister, type UpdateCashRegister } from '~/lib/api/cash_register/cashRegister';
import { useQueryCache } from '@pinia/colada'

const queryCache = useQueryCache()

const { state } = useCustomQuery({
  key: ['usuario', useRoute().params.id as string],
  query: () => getEmployeeById(useRoute().params.id as string).then((res) => {
    return {
      employee: res.employeeResponseDTO,
      histories: res.employeeHistories,
      vacations: res.vacations
    }
  })
})

const selectedCashRegister = ref<CashRegister>()

const { state: cashRegister } = useCustomQuery({
  key: ['caja-empleado', useRoute().params.id as string],
  query: () => getCashRegisterByEmployeeId(useRoute().params.id as string)
})

const { state: availableCashRegisters } = useCustomQuery({
  key: ['cajas-registradoras-disponibles'],
  query: () => getAllCashRegisters({ id: null, employeeId: null, code: null, active: true, warehouseId: null })
    .then((r) => r.filter((current) => current.employeeId === null))
})

const { mutate: changeEmployeeCashRegister } = useMutation({
  mutation: async (updateData: UpdateCashRegister) => {
    if (cashRegister.value.status === 'error') {
      //Si el empleado no tiene asignada una caja registradora simplemente se le asigna una
      return updateCashRegister(selectedCashRegister.value?.id ?? "", updateData)
    } else {
      //Si ya tenia asignada una se tiene que desasignar primero esa y luego se asigna la nueva
      await updateCashRegister(selectedCashRegister.value?.id ?? "", {
        code: cashRegister.value.data?.code ?? "",
        employeeId: "",
        active: cashRegister.value.data?.active ?? true,
        warehouseId: cashRegister.value.data?.warehouse.id ?? ""
      })

      return updateCashRegister(selectedCashRegister.value?.id ?? "", updateData)
    }
  },
  onError(error) {
    toast.error('Ocurrió un error al actualizar la caja registradora.', {
      description: error
    })
  },
  onSuccess() {
    toast.success('Caja asignada exitosamente')
    queryCache.invalidateQueries({
      key: ['cajas-registradoras-disponibles'],
      exact: true,
    });
    queryCache.invalidateQueries({
      key: ['caja-empleado', useRoute().params.id as string],
      exact: true,
    });
  }
})

const selectedYear = ref<number | null>(null);

const submitChangeCashRegister = () => {
  if (selectedCashRegister.value) {
    const caja = selectedCashRegister.value
    const payload: UpdateCashRegister = {
      code: caja.code,
      warehouseId: caja.warehouse.id,
      active: caja.active,
      employeeId: useRoute().params.id as string
    }

    changeEmployeeCashRegister(payload)
  } else {
    toast.warning("Selecciona una caja registradora")
  }
}

const availableYears = computed(() => {
  return state.value.data?.vacations
    ? Object.keys(state.value.data.vacations).map((key) => Number(key))
    : [];
});

const filteredVacations = computed(() => {
  if (selectedYear.value && state.value.data?.vacations && state.value.data.vacations[selectedYear.value]) {
    return state.value.data.vacations[selectedYear.value];
  }
  return [];
});

watch(
  availableYears,
  (newYears) => {
    if (!selectedYear.value && newYears.length > 0) {
      selectedYear.value = newYears[0];
    }
  },
  { immediate: true }
);
</script>
