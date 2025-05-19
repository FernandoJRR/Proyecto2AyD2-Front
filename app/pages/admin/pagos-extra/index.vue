<template>
  <div class="m-6">
    <DataTable :value="state.data" tableStyle="min-width: 50rem" stripedRows
      :loading="asyncStatus == 'loading'">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Pagos/Descuentos Extras</span>
          <router-link to="/admin/pagos-extra/crear">
            <Button icon="pi pi-plus" rounded raised label="Crear Pago/Descuento" />
          </router-link>
        </div>
      </template>
      <Column header="Tipo">
        <template #body="slotProps">
          <template v-if="slotProps.data.type !== null">
            {{ `${slotProps.data.type.type}` }}
          </template>
        </template>
      </Column>
      <Column field="reason" header="Razon" />
      <Column header="Acciones">
        <template #body="slotProps">
          <div>
            <RouterLink :to="`/admin/pagos-extra/${slotProps.data.id}`">
              <Button label="Ver" severity="info" rounded text />
            </RouterLink>
          </div>
        </template>
      </Column>
      <template #footer> Hay en total {{ state.data ? (state.data as any[]).length : 0 }} extras. </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { getAllExtraPayments, type Employee } from '~/lib/api/admin/employee';

const { employee } = storeToRefs(useAuthStore())

const { state, asyncStatus } = useCustomQuery({
  key: ['pagos-extra'],
  query: () => getAllExtraPayments()
})

</script>
