<template>
  <div class="m-6">
    <DataTable
      :value="state.data as any[]"
      tableStyle="min-width: 50rem"
      stripedRows
      :loading="asyncStatus === 'loading'"
      filterDisplay="row"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Horarios</span>
          <router-link to="/horarios/crear">
            <Button icon="pi pi-plus" rounded raised />
          </router-link>
        </div>
      </template>

      <Column header="Inicio" field="startTime">
        <template #filter>
          <InputText
            v-model="spec.startTime"
            placeholder="Filtrar por hora inicio"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.startTime ?? '—' }}
        </template>
      </Column>

      <Column header="Fin" field="endTime">
        <template #filter>
          <InputText
            v-model="spec.endTime"
            placeholder="Filtrar por hora fin"
            class="w-full"
            @input="refetch()"
          />
        </template>
        <template #body="{ data }">
          {{ data.endTime ?? '—' }}
        </template>
      </Column>

      <Column header="Modalidad" field="online">
        <template #filter>
          <Dropdown
            v-model="spec.online"
            :options="modalidadOptions"
            placeholder="Filtrar modalidad"
            class="w-full"
            optionLabel="label"
            optionValue="value"
            @change="refetch()"
          />
        </template>
        <template #body="{ data }">
          <Tag :value="data.online ? 'Virtual' : 'Presencial'" />
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="{ data }">
          <router-link :to="`/horarios/${data.id}`">
            <Button label="Editar" severity="info" rounded text />
          </router-link>
          <Button
            label="Eliminar"
            severity="danger"
            rounded
            text
            @click="confirmDelete(data.id)"
          />
        </template>
      </Column>

      <template #footer>
        Hay en total {{ state.data?.length || 0 }} horarios.
      </template>
    </DataTable>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { toast } from "vue-sonner";
import {
  getAllOnlineStatus,
  deleteSchedule,
  type Schedule,
} from "~/lib/api/schedules/schedule";

const confirm = useConfirm();
const queryCache = useQueryCache();

const spec = reactive<{
  startTime: string | null;
  endTime: string | null;
  online: boolean | null;
}>({
  startTime: null,
  endTime: null,
  online: null,
});

const modalidadOptions = [
  { label: "Todas", value: null },
  { label: "Virtual", value: true },
  { label: "Presencial", value: false },
];

const { state, asyncStatus, refetch } = useCustomQuery({
  key: ["getAllSchedules", spec],
  query: async () => {
    if (spec.online !== null) return await getAllOnlineStatus(spec.online);
    const allTrue = await getAllOnlineStatus(true);
    const allFalse = await getAllOnlineStatus(false);
    return [...allTrue, ...allFalse];
  },
});

const confirmDelete = (id: string) => {
  confirm.require({
    message: "¿Estás seguro de eliminar este horario?",
    header: "Confirmación",
    icon: "pi pi-exclamation-triangle",
    accept: () => mutateDelete(id),
    reject: () => toast.warning("Operación cancelada"),
  });
};

const { mutate: mutateDelete } = useMutation({
  mutation: deleteSchedule,
  onSuccess() {
    toast.success("Horario eliminado correctamente");
    queryCache.invalidateQueries({ key: ["getAllSchedules"] });
  },
  onError(error) {
    toast.error("Error al eliminar el horario", { description: error.message });
  },
});
</script>
