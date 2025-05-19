<template>
  <div class="m-6 ml-12">
    <router-link to="/admin/pagos-extra">
      <Button label="Ver Todos" icon="pi pi-arrow-left" text />
    </router-link>

    <div v-if="state.status === 'pending'" class="mt-6">
      Cargando...
    </div>

    <div v-else-if="state.status === 'error'" class="mt-6">
      Ocurrió un error al cargar el pago extra.
    </div>

    <div v-else class="mt-6 flex flex-col gap-6">
      <div>
        <h1 class="text-3xl font-bold mb-4">Detalle de Pago Extra</h1>

        <div class="flex flex-col gap-2 text-lg">
          <p><span class="font-semibold">Tipo:</span> {{ state.data.type.type }}</p>
          <p><span class="font-semibold">Monto:</span> Q{{ state.data.amount.toFixed(2) }}</p>
          <p><span class="font-semibold">Descripción:</span> {{ state.data.description }}</p>
          <p><span class="font-semibold">Razón:</span> {{ state.data.reason ?? 'No especificada' }}</p>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mb-2">Empleados Asignados</h2>

        <DataTable :value="state.data.employees" tableStyle="min-width: 30rem" stripedRows>
          <Column header="Nombre Completo">
            <template #body="{ data }">
              {{ data.firstName }} {{ data.lastName }}
            </template>
          </Column>
          <Column header="Área">
            <template #body="{ data }">
              <Tag :value="data.employeeType.name" />
            </template>
          </Column>
          <Column header="Estado">
            <template #body="{ data }">
              <Tag :severity="data.desactivatedAt ? 'danger' : 'success'" :value="data.desactivatedAt ? 'Desactivado' : 'Activo'" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getExtraPaymentById } from '~/lib/api/admin/employee'
import { useRoute } from 'vue-router'

const route = useRoute()

const { state } = useCustomQuery({
  key: ['extra-payment', route.params.id as string],
  query: () => getExtraPaymentById(route.params.id as string),
})
</script>
