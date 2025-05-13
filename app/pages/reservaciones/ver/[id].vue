<template>
  <div class="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-2xl border border-gray-200">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-3xl font-bold">Detalle de Reservación</h1>
      <router-link to="/reservaciones/">
        <Button label="Volver al listado" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <div v-if="reservation" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p class="font-medium text-gray-600">Usuario ID</p>
        <p class="text-lg font-semibold">{{ reservation.userId }}</p>
      </div>

      <div>
        <p class="font-medium text-gray-600">Fecha</p>
        <p class="text-lg">{{ reservation.date }}</p>
      </div>

      <div>
        <p class="font-medium text-gray-600">Hora de inicio</p>
        <p class="text-lg">{{ reservation.startTime }}</p>
      </div>

      <div>
        <p class="font-medium text-gray-600">Hora de fin</p>
        <p class="text-lg">{{ reservation.endTime }}</p>
      </div>

      <div>
        <p class="font-medium text-gray-600">Modalidad</p>
        <Tag :value="reservation.online ? 'Virtual' : 'Presencial'" />
      </div>

      <div>
        <p class="font-medium text-gray-600">Estado de pago</p>
        <Tag :severity="reservation.paid ? 'success' : 'warning'" :value="reservation.paid ? 'Pagada' : 'No pagada'" />
      </div>

      <div>
        <p class="font-medium text-gray-600">Estado de cancelación</p>
        <Tag :severity="reservation.cancelled ? 'danger' : 'info'" :value="reservation.cancelled ? 'Cancelada' : 'No Cancelada'" />
      </div>
    </div>

    <div v-else class="text-center text-gray-500">
      Cargando reservación...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getReservationById, type Reservation } from '~/lib/api/reservation/reservation'
import { toast } from 'vue-sonner'

const route = useRoute()
const reservation = ref<Reservation | null>(null)

onMounted(async () => {
  try {
    reservation.value = await getReservationById(route.params.id as string)
  } catch (error: any) {
    toast.error('No se pudo cargar la reservación', { description: error.message })
  }
})
</script>
