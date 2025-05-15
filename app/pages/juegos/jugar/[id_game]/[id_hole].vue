<template>
  <div class="w-80 lg:w-full p-6">
    <h1 class="text-2xl font-semibold mb-6">Hoyo #{{ holeId }}</h1>
    <div class="mb-8">
      <h2 class="text-xl font-medium mb-2">Punteos</h2>
      <div class="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-4 gap-4">
        <div v-for="player in foundGame?.players" :key="player.id"
          class="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="bg-green-100 text-main-green rounded-full h-10 w-10 flex items-center justify-center font-bold">
              {{ player.playerNumber }}
            </div>
            <div>
              <p class="text-gray-900 font-semibold">{{ player.name }}</p>
              <p class="text-sm text-gray-500">Jugador #{{ player.playerNumber }}</p>
              <p class="text-sm text-gray-700 mt-1" v-if="getTotalScore(player.id) !== null">
                Tiros totales: {{ getTotalScore(player.id) }}
              </p>
              <p class="text-sm text-gray-400 italic mt-1" v-else>
                Sin puntuación aún
              </p>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!foundGame?.players?.length" class="text-gray-500 italic">No hay jugadores registrados en este juego.</p>
    </div>
    <Divider />
    <template v-if="foundGame?.players?.length">
      <h2 class="text-xl font-medium mb-2">Punteo Obtenido</h2>
      <div class="space-y-6">
        <div v-for="player in foundGame.players" :key="player.name" class="flex items-center gap-4">
          <div
            class="flex-shrink-0 w-10 h-10 bg-green-100 text-main-green rounded-full flex items-center justify-center font-bold">
            {{ player.playerNumber }}
          </div>
          <div class="flex-1">
            <p class="text-gray-900 font-medium">{{ player.name }}</p>
            <InputNumber v-model="shots[player.id]" class="mt-1 w-full" inputClass="w-full" :min="1"
              :placeholder="`Tiros para ${player.name}`" :disabled="inputsDisabled" />
          </div>
        </div>
      </div>
    </template>

    <p v-else class="text-gray-500 italic mb-4">No hay jugadores registrados en este juego.</p>

    <div class="grid grid-cols-2 gap-x-2">
      <Button label="Anterior Hoyo" icon="pi pi-arrow-left" class="w-full mt-8" severity="primary" @click="previousHole"
        :disabled="holeId - 1 === 0" />
      <template v-if="holeId !== 18">
        <Button label="Siguiente Hoyo" icon="pi pi-arrow-right" class="w-full mt-8" severity="primary"
          @click="nextHole" />
      </template>
      <template v-else>
        <Button label="Terminar Juego" icon="pi pi-arrow-right" class="w-full mt-8" severity="primary"
          @click="finishGame" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGameById, getScoreGame, getScoreHole, updateScoreGame, type Game, type ScoresHoleResponse, type UpdateScoreGamePayload } from '~/lib/api/games/games'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { Divider } from 'primevue'
import { toast } from 'vue-sonner'
import { useQueryCache } from '@pinia/colada'
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()

const queryCache = useQueryCache()

const gameId = route.params.id_game as string
const holeId = Number(route.params.id_hole)

const { data: foundGame } = useCustomQuery<Game>({
  key: ['game-playing', gameId],
  query: () => getGameById(gameId)
})

const { data: foundScoreGame } = useCustomQuery<ScoresHoleResponse>({
  key: ['game-score-hole', gameId, holeId],
  query: () => getScoreHole(gameId, holeId as number)
})

const { data: currentScoreGame } = useCustomQuery<ScoresHoleResponse>({
  key: ['game-score-game', gameId],
  query: () => getScoreGame(gameId)
})

// Store shots per player using their ID as key
const shots = ref<Record<string, number>>({})

const inputsDisabled = computed(() => foundScoreGame.value ? foundScoreGame.value.playerScores?.length > 0 : false)

const { mutate: changeScoreGame } = useMutation({
  mutation: (payload: UpdateScoreGamePayload) => updateScoreGame(gameId, payload),
  onError(error) {
    toast.error("Error al ingresar punteos", {
      description: error.message,
    });
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['game-score-game'] })
    const nextHoleId = holeId + 1
    router.push(`/juegos/jugar/${gameId}/${nextHoleId}`)
  },
});

const { mutate: finishGameScore } = useMutation({
  mutation: (payload: UpdateScoreGamePayload) => updateScoreGame(gameId, payload),
  onError(error) {
    toast.error("Error al ingresar punteos", {
      description: error.message,
    });
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['game-score-game'] })
    router.push(`/juegos/final/${gameId}`)
  },
});

// Watch scores and set them in shots
watch(
  () => foundScoreGame.value?.playerScores,
  (scores) => {
    if (scores && scores.length > 0) {
      scores.forEach(score => {
        shots.value[score.id] = score.totalShots
      })
    }
  },
  { immediate: true }
)

const getTotalScore = (playerId: string): number | null => {
  const scores = currentScoreGame.value?.playerScores
  const playerScore = scores?.find(s => s.id === playerId)
  return playerScore?.totalShots ?? null
}

// Logic to go to next hole
const nextHole = () => {
  if (inputsDisabled.value) {
    const nextHoleId = holeId + 1
    router.push(`/juegos/jugar/${gameId}/${nextHoleId}`)
    return
  }
  // Optional: validate that all players entered shots
  const missing = foundGame.value?.players?.some(p => !shots.value[p.id])
  if (missing) {
    toast.error('Todos los jugadores deben ingresar el número de tiros.')
    return
  }

  const playersScore = Object.entries(shots.value).map(([playerId, score]) => ({
    playerId: playerId,
    shotsPlayer: score
  }))

  changeScoreGame({scorePlayers: playersScore, holeNumber: holeId})

}

const finishGame = () => {
  if (inputsDisabled.value) {
    const nextHoleId = holeId + 1
    router.push(`/juegos/jugar/${gameId}/${nextHoleId}`)
    return
  }
  // Optional: validate that all players entered shots
  const missing = foundGame.value?.players?.some(p => !shots.value[p.id])
  if (missing) {
    toast.error('Todos los jugadores deben ingresar el número de tiros.')
    return
  }

  const playersScore = Object.entries(shots.value).map(([playerId, score]) => ({
    playerId: playerId,
    shotsPlayer: score
  }))

  finishGameScore({scorePlayers: playersScore, holeNumber: holeId})

}

const previousHole = () => {
  const previousHoleId = holeId - 1
  router.push(`/juegos/jugar/${gameId}/${previousHoleId}`)
}
</script>
