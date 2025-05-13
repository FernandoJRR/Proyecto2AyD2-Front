<template>
  <div class="m-6 ml-12">
    <h1 class="text-3xl font-medium mb-8">Configuracion</h1>
    <div class="flex flex-col gap-4">
      <h1 class="text-3xl font-medium mb-6 max-h-4">Nombre de la Empresa</h1>
      <FloatLabel class="mt-4">
        <label for="number">Nombre</label>
        <InputText v-model="currentEnterpriseName" />
      </FloatLabel>
      <Button label="Cambiar nombre" icon="pi pi-refresh" @click="changeName" />
    </div>
    <div class="flex flex-col gap-4 mt-8">
      <h1 class="text-3xl font-medium mb-6 max-h-4">NIT de la Empresa</h1>
      <FloatLabel class="mt-4">
        <label for="number">NIT</label>
        <InputText v-model="currentEnterpriseNIT" />
      </FloatLabel>
      <Button label="Cambiar NIT" icon="pi pi-refresh" @click="changeNIT" />
    </div>
    <div class="flex flex-col gap-4 mt-8">
      <h1 class="text-3xl font-medium mb-6 max-h-4">Regimen Fiscal de la Empresa</h1>
      <FloatLabel class="mt-4">
        <label for="number">Regimen</label>
        <Select v-model="selectedFiscalRegime" :options="regimes" optionLabel="name"
          placeholder="Selecciona un regimen fiscal" class="w-full md:w-56" />
      </FloatLabel>
      <Button label="Cambiar Regimen" icon="pi pi-refresh" @click="changeRegime" />
    </div>
    <Divider />
  </div>
</template>
<script setup lang="ts">
import { Divider, InputText, Select } from 'primevue';
import { toast } from 'vue-sonner';
import { getNit, getRegime, getName, updateNIT, type UpdateNITPayload, type UpdateNamePayload, updateName, type UpdateRegimePayload, updateRegime } from '~/lib/api/configurations/configurations';

const currentEnterpriseName = ref<string>("Golf Course")
const currentEnterpriseNIT = ref<string>("123456-7")

const regimes = ref([
  { name: 'General - 12%', code: 'gen' },
  { name: 'Pequeño - 5%', code: 'peq' },
])
const selectedFiscalRegime = ref(regimes.value[0])

const { state: nit } = useCustomQuery({
  key: ['enterprise-nit-edit'],
  query: () => getNit(),
})
const { state: name } = useCustomQuery({
  key: ['enterprise-name-edit'],
  query: () => getName(),
})
const { state: regime } = useCustomQuery({
  key: ['enterprise-regime-edit'],
  query: () => getRegime(),
})


const { mutate: mutateNIT } = useMutation({
  mutation: (payload: UpdateNITPayload) => updateNIT(payload),
  onError(error) {
    toast.error("Ocurrio un error al actualizar los dias de vacaciones", {
      description: error.message
    })
  },
  onSuccess() {
    toast.success("Se han actualizado los dias de vacaciones")
  }
})

const { mutate: mutateName } = useMutation({
  mutation: (payload: UpdateNamePayload) => updateName(payload),
  onError(error) {
    toast.error("Ocurrio un error al actualizar los dias de vacaciones", {
      description: error.message
    })
  },
  onSuccess() {
    toast.success("Se han actualizado los dias de vacaciones")
  }
})

const { mutate: mutateRegime } = useMutation({
  mutation: (payload: UpdateRegimePayload) => updateRegime(payload),
  onError(error) {
    toast.error("Ocurrio un error al actualizar los dias de vacaciones", {
      description: error.message
    })
  },
  onSuccess() {
    toast.success("Se han actualizado los dias de vacaciones")
  }
})

function changeNIT() {
  mutateNIT({ nit: currentEnterpriseNIT.value })
}

function changeName() {
  mutateName({ newName: currentEnterpriseName.value })
}

function changeRegime() {
  mutateRegime({ newRegime: selectedFiscalRegime.value.code })
}

watch(
  () => nit.value.data,
  (data) => {
    if (data) {
      currentEnterpriseNIT.value = data.value;
    }
  }, { immediate: true }
);
watch(
  () => name.value.data,
  (data) => {
    if (data) {
      currentEnterpriseName.value = data.value;
    }
  }, { immediate: true }
);
watch(
  () => regime.value.data,
  (data) => {
    if (data) {
      const responseData: {name: string, value: number} = JSON.parse(data.value);
      if (responseData.name === "gen") {
        selectedFiscalRegime.value = regimes.value[0]
      } else {
        selectedFiscalRegime.value = regimes.value[1]
      }
    }
  }, { immediate: true }
);
</script>
