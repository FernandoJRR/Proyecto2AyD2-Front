<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">Juego #{{ gameId }}</h1>
      <p class="text-sm text-gray-500" v-if="foundGame?.hasFinished">Estado: Finalizado</p>
      <p class="text-sm text-green-600" v-else>Estado: En Progreso</p>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-medium mb-2">Jugadores</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div
          v-for="player in foundGame?.players"
          :key="player.id"
          class="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3">
            <div class="bg-green-100 text-main-green rounded-full h-10 w-10 flex items-center justify-center font-bold">
              {{ player.playerNumber }}
            </div>
            <div>
              <p class="text-gray-900 font-semibold">{{ player.name }}</p>
              <p class="text-sm text-gray-500">Jugador #{{ player.playerNumber }}</p>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!foundGame?.players?.length" class="text-gray-500 italic">No hay jugadores registrados en este juego.</p>
    </div>

    <template v-if="!foundGame?.hasFinished">
      <Button
        label="Iniciar Juego"
        icon="pi pi-play"
        class="w-full"
        severity="success"
        @click="startGame"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { getGameById, type Game } from '~/lib/api/games/games'
import { useRoute } from 'vue-router'

const route = useRoute()
const gameId = route.params.id_game as string

const { data: foundGame } = useCustomQuery<Game>({
  key: ['game-playing', gameId],
  query: () => getGameById(gameId)
})

const startGame = () => {
  useRouter().push(`/juegos/jugar/${gameId}/1`)
}
</script>

<style scoped>
/* Optional: Remove Button padding if needed */
</style>
