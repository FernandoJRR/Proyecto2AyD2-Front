<template>
  <div class="w-80 lg:w-full p-6 text-center">
    <h1 class="text-2xl font-bold mb-8 text-gray-800">🏆Resultado Final🏆</h1>

    <div v-if="sortedScores.length" class="space-y-4">
      <div v-for="(player, index) in sortedScores" :key="player.id" :class="[
        'rounded-lg shadow p-4 border',
        index === 0 ? 'bg-yellow-200' :
          index === 1 ? 'bg-gray-100' :
            index === 2 ? 'bg-main-lotus' :
              'bg-white'
      ]">
        <p class="text-lg font-semibold text-gray-800">
          {{ index + 1 }}° lugar - {{ player.name }}
          <span v-if="index === 0">🥇</span>
          <span v-else-if="index === 1">🥈</span>
          <span v-else-if="index === 2">🥉</span>
        </p>
        <p class="text-sm text-gray-600">Tiros Totales: {{ player.totalShots }}</p>
      </div>
    </div>

    <p v-else class="text-gray-500 italic mt-4">No hay puntajes registrados aún.</p>
  </div>
</template>

<script setup lang="ts">
import { getScoreGame, type ScoresHoleResponse } from '~/lib/api/games/games'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const gameId = route.params.id_game as string

const { data: currentScoreGame } = useCustomQuery<ScoresHoleResponse>({
  key: ['game-score-game', gameId],
  query: () => getScoreGame(gameId)
})

// Ordenar de menor a mayor totalShots
const sortedScores = computed(() =>
  currentScoreGame.value?.playerScores
    ? [...currentScoreGame.value.playerScores].sort((a, b) => a.totalShots - b.totalShots)
    : []
)
</script>
