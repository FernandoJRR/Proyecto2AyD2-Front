<template>
  <div class="m-6">
    <DataTable :value="state.data" tableStyle="min-width: 50rem" stripedRows
      :loading="asyncStatus == 'loading'">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Juegos</span>
        </div>
      </template>
      <Column header="ID" field="id"/>
      <Column header="ID Reservacion" field="reservationId"/>
      <Column header="Ha Finalizado">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.hasFinished" value="Si" />
          <Tag v-else :value="'No - Hoyo ' + (slotProps.data.currentHole === null ? '1' : slotProps.data.currentHole + 1)" severity="danger" />
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <div>
            <RouterLink :to="`/admin/personal/${slotProps.data.id}`">
              <Button label="Ver" severity="info" rounded text />
            </RouterLink>
            <RouterLink :to="`/juegos/jugar/${slotProps.data.id}`">
              <Button label="Jugar" severity="warn" rounded text />
            </RouterLink>
          </div>
        </template>
      </Column>
      <template #footer> Hay en total {{ state.data ? state.data.length : 0 }} juegos registrados. </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { getAllGames } from '~/lib/api/games/games';

const { state, asyncStatus } = useCustomQuery({
  key: ['juegos'],
  query: () => getAllGames()
})

</script>
