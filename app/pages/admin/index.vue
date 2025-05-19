<template>
  <div class="grid grid-cols-4 gap-4 m-8">
    <template v-for="menu in menus">
      <MenuShortcutCard :menu="menu" />
    </template>
  </div>
</template>
<script setup lang="ts">
import MenuShortcutCard from '~/components/cards/MenuShortcutCard.vue';

const menus = [
  {
    title: 'Personal',
    description: 'Administracion de Personal',
    route: '/admin/personal',
  },
  {
    title: 'Pagos Extra',
    description: 'Administracion de Pagos Extra',
    route: '/admin/pagos-extra',
  },
  {
    title: 'Configuracion',
    description: 'Configuraciones del Sistema',
    route: '/admin/configuracion',
  },
  {
    title: 'Roles',
    description: 'Administracion de roles y permisos',
    route: '/admin/tipos-de-empleado',
  }
]

defineExpose({ menus })
</script>
