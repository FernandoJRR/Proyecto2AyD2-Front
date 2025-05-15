<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
      <router-link to="/horarios/">
        <Button label="Ver todos" icon="pi pi-arrow-left" text />
      </router-link>
    </div>

    <h1 class="text-4xl font-bold mb-6">Crear horario</h1>

    <Form
      v-slot="$form"
      :initialValues="initialValues"
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
      </div>

      <div class="pt-4">
        <Button type="submit" label="Crear" icon="pi pi-save" severity="secondary" />
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { toast } from 'vue-sonner'
import InputText from 'primevue/inputtext'
import { FloatLabel } from 'primevue'
import { createSchedule, type CreateSchedule } from '~/lib/api/schedules/schedule'

const initialValues: CreateSchedule = {
  startTime: '',
  endTime: ''
}

const resolver = zodResolver(
  z.object({
    startTime: z.string().min(1, 'La hora de inicio es obligatoria'),
    endTime: z.string().min(1, 'La hora de fin es obligatoria')
  })
)

const onFormSubmit = (e: any) => {
  if (e.valid) {
    mutate(e.values)
  }
}

const { mutate } = useMutation({
  mutation: (payload: CreateSchedule) => createSchedule(payload),
  onError(error) {
    toast.error('Ocurrió un error al crear el horario', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('El horario se ha creado correctamente')
    useQueryCache().invalidateQueries({ key: ['getAllSchedules'] })
    navigateTo('/horarios/')
  }
})
</script>
