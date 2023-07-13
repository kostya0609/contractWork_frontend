<template>
  <el-button class="uppercase blueButton" @click="goBack">Вернуться назад</el-button>
</template>
<script setup>

import { useRouter } from 'vue-router';

const router = useRouter();

function goBack(){
  if(!router.previous) {
    router.push({name:'ListContracts'});
    return;
  }else{
    if (router.previous === 'addContract' || router.previous === 'editContract') {
      router.push({name:'ListContracts'});
      return;
    }
  }
  router.back(1);
};

</script>

<style scoped>

</style>