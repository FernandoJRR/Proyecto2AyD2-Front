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
        <div v-for="player in foundGame?.players" :key="player.id"
          class="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
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
      <div v-if="!foundGame?.players?.length" class="space-y-4">
        <div v-for="(name, index) in newPlayers" :key="index"
          class="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 w-full">
            <div class="bg-green-100 text-main-green rounded-full h-10 w-10 flex items-center justify-center font-bold">
              {{ index + 1 }}
            </div>
              <input v-model="newPlayers[index]" type="text" class="flex-1 px-3 py-2 rounded w-full"
                :placeholder="`Nombre del Jugador ${index + 1}`" required />
          </div>
        </div>

        <div class="flex flex-row gap-x-2 mt-4">
          <Button class="w-full" label="Agregar" @click="addPlayer" :disabled="newPlayers.length >= 4"
            icon="pi pi-plus" />
          <Button class="w-full" label="Quitar" @click="removePlayer" :disabled="newPlayers.length <= 1"
            icon="pi pi-minus" />
        </div>

        <Button label="Registrar Jugadores" severity="success" class="w-full mt-4" @click="submitPlayers"
          :disabled="!canSubmit" />
      </div>
    </div>

    <template v-if="!foundGame?.hasFinished">
      <Button label="Iniciar Juego" icon="pi pi-play" class="w-full" severity="success" @click="startGame"
        :disabled="!foundGame?.players.length" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { getGameById, updatePlayerGame, type Game, type UpdatePlayersGame } from '~/lib/api/games/games'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { useQueryCache } from '@pinia/colada'

const route = useRoute()
const queryCache = useQueryCache()
const gameId = route.params.id_game as string

const { data: foundGame } = useCustomQuery<Game>({
  key: ['game-playing', gameId],
  query: () => getGameById(gameId)
})

const startGame = () => {
  useRouter().push(`/juegos/jugar/${gameId}/1`)
}

const newPlayers = ref<string[]>([''])

const addPlayer = () => {
  if (newPlayers.value.length < 4) newPlayers.value.push('')
}

const removePlayer = () => {
  if (newPlayers.value.length > 1) newPlayers.value.pop()
}

const canSubmit = computed(() =>
  newPlayers.value.length >= 1 &&
  newPlayers.value.length <= 4 &&
  newPlayers.value.every(name => name.trim().length > 0)
)

const { mutate: addPlayers } = useMutation({
  mutation: (payload: UpdatePlayersGame) => updatePlayerGame(gameId, payload),
  onError(error) {
    toast.error("Error al ingresar los usuarios", {
      description: error.message,
    });
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['game-playing'] })
  },
});

const submitPlayers = () => {
  if (!canSubmit.value) return
  const registeredPlayers = newPlayers.value.map((name, i) => ({
    name,
    playerNumber: i + 1,
  }))
  console.log('Sending players:', registeredPlayers)
  addPlayers({ players: registeredPlayers })
}
</script>

<style scoped>
/* Optional: Remove Button padding if needed */
</style>
