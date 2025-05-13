<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/horarios/">
        <Button label="Ver todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Editar horario</h1>

    <Form
      v-if="isScheduleReady"
      v-slot="$form"
      :initialValues="formInitialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="space-y-8 bg-white shadow-md rounded-2xl p-6 border border-gray-200"
    >
      <div class="space-y-6">
        <h2 class="text-2xl font-semibold">Datos del horario</h2>

        <FloatLabel>
          <label for="startTime">Hora de inicio</label>
          <InputText id="startTime" name="startTime" type="time" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.startTime?.invalid" severity="error" size="small" variant="simple">
          {{ $form.startTime.error?.message }}
        </Message>

        <FloatLabel>
          <label for="endTime">Hora de fin</label>
          <InputText id="endTime" name="endTime" type="time" class="w-full" />
        </FloatLabel>
        <Message v-if="$form.endTime?.invalid" severity="error" size="small" variant="simple">
          {{ $form.endTime.error?.message }}
        </Message>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
          <Dropdown
            id="online"
            name="online"
            :options="modalidadOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="Seleccionar modalidad"
          />
          <Message v-if="$form.online?.invalid" severity="error" size="small" variant="simple">
            {{ $form.online.error?.message }}
          </Message>
        </div>
      </div>

      <div class="pt-4">
        <Button type="submit" label="Guardar cambios" icon="pi pi-save" severity="secondary" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { FloatLabel } from 'primevue'
import {
  getScheduleById,
  updateSchedule,
  type Schedule,
  type UpdateSchedule
} from '~/lib/api/schedules/schedule'

const route = useRoute()
const scheduleId = route.params.id as string
const isScheduleReady = ref(false)

const modalidadOptions = [
  { label: 'Virtual', value: true },
  { label: 'Presencial', value: false }
]

const formInitialValues = ref<UpdateSchedule>({
  startTime: '',
  endTime: '',
  online: true
})

const { data: foundedSchedule } = useCustomQuery<Schedule>({
  key: ['getScheduleById', scheduleId],
  query: () => getScheduleById(scheduleId)
})

watch(
  () => foundedSchedule.value,
  (data) => {
    if (data) {
      formInitialValues.value = {
        startTime: data.startTime,
        endTime: data.endTime,
        online: data.online
      }
      isScheduleReady.value = true
    }
  },
  { immediate: true }
)

const resolver = zodResolver(
  z.object({
    startTime: z.string().min(1, 'La hora de inicio es obligatoria'),
    endTime: z.string().min(1, 'La hora de fin es obligatoria'),
    online: z.boolean({ required_error: 'Debe seleccionar una modalidad' })
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    mutate(e.values)
  }
}

const { mutate } = useMutation({
  mutation: (payload: UpdateSchedule) => updateSchedule(scheduleId, payload),
  onError(error) {
    toast.error('Ocurrió un error al editar el horario', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('El horario se ha editado correctamente')
    useQueryCache().invalidateQueries({ key: ['getScheduleById'] })
    useQueryCache().invalidateQueries({ key: ['getAllSchedules'] })
    navigateTo('/horarios/')
  }
})
</script>
