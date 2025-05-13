<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="font-bold text-2xl mb-20">Bienvenido, {{ user?.username }}!</h1>
    <div class="grid grid-cols-4 gap-4">
      <template v-for="menu in menus">
        <MenuShortcutCard :menu="menu" />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import MenuShortcutCard from "~/components/cards/MenuShortcutCard.vue";

const { user } = storeToRefs(useAuthStore());

const menus = [
  {
    title: "Administracion",
    description: "Administracion General del Hospital",
    route: "/admin",
  },
  {
    title: "Reportes",
    description: "Generación de Repotes",
    route: "/reportes",
  },
  {
    title: "Bodegas",
    description: "Administracion de Bodegas",
    route: "/bodegas",
  },
  {
    title: "Proveedores",
    description: "Administracion de Proveedores",
    route: "/proveedores",
  },
  {
    title: "Cajas",
    description: "Administracion de Cajas",
    route: "/cajas",
  },
  {
    title: "Productos",
    description: "Administracion de Productos",
    route: "/productos",
  },
  {
    title: "Entradas Productos",
    description: "Administracion de Entradas de Productos",
    route: "/entradas_productos",
  },
  {
    title: "Reservaciones",
    description: "Administracion de Reservaciones",
    route: "/reservaciones",
  },
  {
    title: "Horarios",
    description: "Administracion de Horarios",
    route: "/horarios",
  }
];

defineExpose({ menus });
</script>
