<template>
  <div class="m-6 ml-12">
    <router-link to="/admin/personal">
      <Button label="Ver Todos" icon="pi pi-arrow-left" text />
    </router-link>
    <h1 class="text-4xl mb-2">Editar Usuario</h1>
    <div>
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Datos del Empleado</h1>
        <div v-if="foundUser.data" class="flex flex-col gap-2">
          <Form :key="foundUser.data.id" v-slot="$employeeForm" :initialValues :employeeResolver
            @submit="onEmployeeFormSubmit" class="mt-8 flex justify-center">
            <div class="flex flex-col w-full gap-4">
              <div class="flex flex-row gap-4">
                <div class="w-full">
                  <FloatLabel>
                    <InputText name="firstName" type="text" fluid />
                    <label>Nombres</label>
                  </FloatLabel>
                  <Message v-if="$employeeForm.firstName?.invalid" severity="error" size="small" variant="simple">{{
                    $employeeForm.firstName.error?.message }}</Message>
                </div>
                <div class="w-full">
                  <FloatLabel>
                    <label>Apellidos</label>
                    <InputText name="lastName" type="text" fluid />
                  </FloatLabel>
                  <Message v-if="$employeeForm.lastName?.invalid" severity="error" size="small" variant="simple">{{
                    $employeeForm.lastName.error?.message }}</Message>
                </div>
                <div class="w-full">
                  <FloatLabel>
                    <label>CUI</label>
                    <InputText name="cui" type="text" fluid />
                  </FloatLabel>
                  <Message v-if="$employeeForm.cui?.invalid" severity="error" size="small" variant="simple">{{
                    $employeeForm.cui.error?.message }}</Message>
                </div>
              </div>
              <Button class="w-full" type="submit" severity="secondary" label="Actualizar Datos" />
            </div>
          </Form>
        </div>
        <h1 class="text-2xl font-semibold mt-2">Datos de Planilla</h1>
        <div class="flex flex-row gap-x-8 mt-2 gap-2 justify-center">
          <Form v-slot="$salaryForm" :initialValues :salaryResolver @submit="onSalaryFormSubmit"
            class="mt-8 flex justify-center">
            <div class="flex flex-col gap-2">
              <FloatLabel>
                <label>Salario</label>
                <InputNumber name="salary" :min="1" :minFractionDigits="2" :maxFractionDigits="2" mode="currency"
                  currency="GTQ" placeholder="Salario" fluid />
              </FloatLabel>
              <Message v-if="$salaryForm.salary?.invalid" severity="error" size="small" variant="simple">{{
                $salaryForm.salary.error?.message }}</Message>
              <InputGroup>
                <DatePicker name="salaryDate" :maxDate="new Date()" />
                <Button class="w-full" type="submit" severity="secondary" label="Actualizar Salario" />
              </InputGroup>
            </div>
          </Form>
          <Form v-slot="$benefitsForm" :initialValues :benefitsResolver @submit="onBenefitsFormSubmit"
            class="mt-8 flex justify-center">
            <div class="flex flex-col gap-2">
              <div class="flex flex-row">
                <div>
                  <div class="flex flex-row items-center gap-4 ml-4">
                    <ToggleSwitch name="has_porcentaje_igss" class="min-w-10" />
                    <FloatLabel>
                      <label>Porcentaje IGSS</label>
                      <InputNumber name="igssPercentage" :min="1" :max="100" suffix="%" placeholder="Porcentaje IGSS"
                        fluid :disabled="!$benefitsForm.has_porcentaje_igss?.value" />
                    </FloatLabel>
                  </div>
                  <Message v-if="$benefitsForm.igssPercentage?.invalid" severity="error" size="small" variant="simple">
                    {{
                      $benefitsForm.igssPercentage.error?.message }}</Message>
                </div>
                <div>
                  <div class="flex flex-row items-center gap-4 ml-4">
                    <ToggleSwitch name="has_porcentaje_irtra" class="min-w-10" />
                    <FloatLabel>
                      <label>Porcentaje IRTRA</label>
                      <InputNumber name="irtraPercentage" :min="1" :max="100" suffix="%" label="Porcentaje IRTRA" fluid
                        :disabled="!$benefitsForm.has_porcentaje_irtra?.value" />
                    </FloatLabel>
                  </div>
                  <Message v-if="$benefitsForm.irtraPercentage?.invalid" severity="error" size="small" variant="simple">
                    {{
                      $benefitsForm.irtraPercentage.error?.message }}</Message>
                </div>
              </div>
              <Button class="w-full" type="submit" severity="secondary" label="Actualizar Prestaciones" />
            </div>
          </Form>
        </div>
        <h1 class="text-2xl font-semibold mt-2">Area del Empleado</h1>
        <Form v-slot="$areaForm" :initialValues :areaResolver @submit="onAreaFormSubmit"
          class="mt-8 flex justify-center">
          <div class="flex flex-col mt-2 w-full">
            <div>
              <template v-if="userTypes.status === 'success'">
                <FloatLabel>
                  <label>Tipo de Usuario</label>
                  <Select name="type" v-model="selectedType" optionLabel="name" optionValue="id"
                    :options="userTypes.data" placeholder="Selecciona un tipo de usuario" fluid />
                </FloatLabel>
                <Message v-if="$areaForm.type?.invalid" severity="error" size="small" variant="simple">{{
                  $areaForm.type.error?.message }}</Message>
              </template>
            </div>
            <Button class="w-full mt-2" type="submit" severity="secondary" label="Actualizar Area" />
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { DatePicker, FloatLabel, InputGroup, InputNumber, ToggleSwitch } from 'primevue';
import { toast } from 'vue-sonner';
import { z } from 'zod';
import { createEmployee, getEmployeeById, updateEmployee, updateEmployeeSalary, type EmployeePayload, type EmployeeSalaryUpdatePayload, type EmployeeUpdatePayload } from '~/lib/api/admin/employee';
import { getAllEmployeeTypes } from '~/lib/api/admin/employee-type';
import { useQueryCache } from '@pinia/colada'

const queryCache = useQueryCache();

const { state: foundUser } = useCustomQuery({
  key: ['usuario-editar', useRoute().params.id as string],
  query: () => getEmployeeById(useRoute().params.id as string).then((res) => { return { ...res.employeeResponseDTO, username: res.username } }),
})

const initialValues = reactive({
  firstName: foundUser.value.data?.firstName ?? '',
  lastName: foundUser.value.data?.lastName ?? '',
  cui: foundUser.value.data?.cui ?? '',
  salary: foundUser.value.data?.salary ?? 0,
  salaryDate: new Date(),

  has_porcentaje_igss: foundUser.value.data?.igssPercentage != null,
  igssPercentage: foundUser.value.data?.igssPercentage ?? 0,
  has_porcentaje_irtra: foundUser.value.data?.irtraPercentage != null,
  irtraPercentage: foundUser.value.data?.irtraPercentage ?? 0,

  type: foundUser.value.data?.employeeType.name ?? '',

  username: foundUser.value.data?.username ?? '',
  password: '',
  password_repeat: '',

  hiring_date: new Date()
});

watch(
  () => foundUser.value.data,
  (data) => {
    if (data) {
      initialValues.firstName = data.firstName;
      initialValues.lastName = data.lastName;
      initialValues.salary = data.salary;

      initialValues.has_porcentaje_igss = data.igssPercentage != null;
      initialValues.igssPercentage = data.igssPercentage ?? 0;
      initialValues.has_porcentaje_irtra = data.irtraPercentage != null;
      initialValues.irtraPercentage = data.irtraPercentage ?? 0;
      initialValues.type = data.employeeType?.id ?? '';
      initialValues.username = data.username;
    }
  },
  { immediate: true }
);

const selectedType = ref('')

const employeeResolver = ref(zodResolver(
  z.object({
    firstName: z.string().min(1, 'Los nombres son obligatorios.'),
    lastName: z.string().min(1, 'Los apellidos son obligatorios.'),
    cui: z.string().regex(/^\d{13}$/, "El CUI es obligatorio y debe tener 13 digitos"),
  })
))

const benefitsResolver = ref(zodResolver(
  z.object({
    has_porcentaje_igss: z.boolean(),
    igssPercentage: z.union([
      z.number().min(1, "El porcentaje debe ser mayor a 0.").max(100, "El porcentaje no puede ser mayor a 100"),
      z.literal(null)
    ]).optional(),

    has_porcentaje_irtra: z.boolean(),
    irtraPercentage: z.union([
      z.number().min(1, "El porcentaje debe ser mayor a 0.").max(100, "El porcentaje no puede ser mayor a 100"),
      z.literal(null)
    ]).optional(),

  }).superRefine((data, ctx) => {
    if (data.has_porcentaje_igss && (data.igssPercentage === null || data.igssPercentage === undefined || data.igssPercentage === 0)) {
      ctx.addIssue({
        path: ["igssPercentage"],
        message: "Debe ingresar un porcentaje válido para IGSS.",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.has_porcentaje_irtra && (data.irtraPercentage === null || data.irtraPercentage === undefined || data.irtraPercentage === 0)) {
      ctx.addIssue({
        path: ["irtraPercentage"],
        message: "Debe ingresar uns porcentaje válido para IRTRA.",
        code: z.ZodIssueCode.custom,
      });
    }
  })
))

const areaResolver = ref(zodResolver(
  z.object({
    type: z.string(),
  })
))

const salaryResolver = ref(zodResolver(
  z.object({
    salary: z.number({ message: "El salario es obligatorio." }).min(1, 'El salario debe ser un numero positivo.'),
    salaryDate: z.date().max(new Date())
  })
))

const onEmployeeFormSubmit = (e: any) => {
  if (e.valid) {
    console.log(e.values)
    const payload: EmployeeUpdatePayload = {
      firstName: e.values.firstName,
      lastName: e.values.lastName,
      cui: e.values.cui,
      salary: foundUser.value.data?.salary ?? 0,
      igssPercentage: foundUser.value.data?.igssPercentage ?? 0,
      irtraPercentage: foundUser.value.data?.irtraPercentage ?? 0,
      employeeTypeId: { id: foundUser.value.data?.employeeType.id ?? '' },
    }
    updateEmployeeMutation(payload)
  }
};

const onAreaFormSubmit = (e: any) => {
  if (e.valid) {
    console.log(e.values)
    const payload: EmployeeUpdatePayload = {
      firstName: foundUser.value.data?.firstName ?? '',
      lastName: foundUser.value.data?.lastName ?? '',
      cui: foundUser.value.data?.cui ?? '',
      salary: foundUser.value.data?.salary ?? 0,
      igssPercentage: foundUser.value.data?.igssPercentage ?? 0,
      irtraPercentage: foundUser.value.data?.irtraPercentage ?? 0,
      employeeTypeId: { id: e.values.type },
    }
    updateEmployeeMutation(payload)
  }
};

const onSalaryFormSubmit = (e: any) => {
  if (e.valid) {
    updateSalary(e.values)
  }
};

const onBenefitsFormSubmit = (e: any) => {
  if (e.valid) {
    console.log(e.values)
    const payload: EmployeeUpdatePayload = {
      firstName: foundUser.value.data?.firstName ?? '',
      lastName: foundUser.value.data?.lastName ?? '',
      cui: foundUser.value.data?.cui ?? '',
      salary: foundUser.value.data?.salary ?? 0,
      igssPercentage: e.values.has_porcentaje_igss ? e.values.igssPercentage : null,
      irtraPercentage: e.values.has_porcentaje_irtra ? e.values.irtraPercentage : null,
      employeeTypeId: { id: foundUser.value.data?.employeeType.id ?? '' },
    }
    updateEmployeeMutation(payload)
  }
};

const { state: userTypes } = useCustomQuery({
  key: ['optionsTypes'],
  query: () => getAllEmployeeTypes()
})

const { mutate: updateEmployeeMutation } = useMutation({
  mutation: (updateData: EmployeeUpdatePayload) => updateEmployee(updateData, useRoute().params.id as string),
  onError(error) {
    toast.error('Ocurrió un error al actualizar al empleado.', {
      description: error.message
    })
  },
  onSuccess() {
    toast.success('Empleado actualizado correctamente')
    queryCache.invalidateQueries({
      key: ['usuario-editar', useRoute().params.id as string],
      exact: true,
    });
    navigateTo('/admin/personal')
  }
})

const { mutate: updateSalary } = useMutation({
  mutation: (updateData: EmployeeSalaryUpdatePayload) => updateEmployeeSalary(updateData, useRoute().params.id as string),
  onError(error) {
    toast.error('Ocurrió un error al actualizar el salario.', {
      description: error
    })
  },
  onSuccess() {
    toast.success('Salario editado correctamente')
    queryCache.invalidateQueries({
      key: ['usuario-editar', useRoute().params.id as string],
      exact: true,
    });
    navigateTo('/admin/personal')
  }
})

const { mutate } = useMutation({
  mutation: (employeeData: EmployeePayload) => createEmployee(employeeData),
  onError(error) {
    toast.error('Ocurrió un error al crear el empleado', {
      description: error
    })
  },
  onSuccess() {
    toast.success('Empleado creado correctamente')
    queryCache.invalidateQueries({
      key: ['usuario-editar', useRoute().params.id as string],
      exact: true,
    });
    navigateTo('/admin/personal')
  }
})

watch(
  () => userTypes.value.data,
  (data) => {
    if (data && data.length > 0) {
      selectedType.value = data[0].id;
      initialValues.type = data[0].id;
    }
  }, { immediate: true }
);
</script>
