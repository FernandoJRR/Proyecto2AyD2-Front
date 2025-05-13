<template>
  <div class="m-6">
    <DataTable
      :value="state.data as any[]"
      tableStyle="min-width: 50rem"
      stripedRows
      :loading="asyncStatus === 'loading'"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Paquetes</span>
          <router-link to="/paquetes/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Nombre" field="name">
        <template #body="{ data }">
          {{ data.name ?? '—' }}
        </template>
      </Column>

      <Column header="Descripción" field="description">
        <template #body="{ data }">
          {{ data.description ?? '—' }}
        </template>
      </Column>

      <Column header="Precio" field="price">
        <template #body="{ data }">
          Q{{ data.price.toFixed(2) }}
        </template>
      </Column>

      <Column header="Activo" field="active">
        <template #body="{ data }">
          <Tag :value="data.active ? 'Sí' : 'No'" />
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="{ data }">
          <router-link :to="`/paquetes/${data.id}`">
            <Button label="Editar" severity="info" rounded text />
          </router-link>
          <Button
            label="Cambiar Estado"
            severity="danger"
            rounded
            text
            @click="toggleAvailability(data.id, data)"
          />
        </template>
      </Column>

      <template #footer>
        Hay en total {{ state.data?.length || 0 }} paquetes.
      </template>
    </DataTable>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import { toast } from 'vue-sonner'
import {
  getAllPackages,
  updatePackage,
  type Package
} from '~/lib/api/package/package'

const queryCache = useQueryCache()
const confirm = useConfirm()

const { state, asyncStatus } = useCustomQuery({
  key: ['getAllPackages'],
  query: getAllPackages
})

const toggleAvailability = (id: string, pkg: Package) => {
  confirm.require({
    message: `¿Deseas cambiar el estado del paquete "${pkg.name}"?`,
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Cambiar estado',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await updatePackage(id, {
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          active: !pkg.active,
          packageDetail: pkg.packageDetail.map(p => ({
            product: p.product.id,
            quantity: p.quantity
          }))
        })
        toast.success('Estado del paquete actualizado correctamente.')
        queryCache.invalidateQueries({ key: ['getAllPackages'] })
      } catch (error: any) {
        toast.error('Error al cambiar estado del paquete', {
          description: error.message
        })
      }
    },
    reject: () => {
      toast.warning('Operación cancelada. No se modificó el estado del paquete.')
    }
  })
}
</script>
