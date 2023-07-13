<template>
  <div class="relative">
    <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :router=true
    >
      <template v-for="(item, key) in menu" :key="key">
        <el-menu-item :index="item.path"> {{item.name}} </el-menu-item>
        <span v-if="item.name == 'Требует вашей реакции'" class="relative"><span class="badgeItem"> {{needActions}}</span></span>
      </template>

    </el-menu>
    <el-button
      @click="router.push({path : route.meta.path})"
      class="absolute right-5 top-2 uppercase blueButton"
    >
      Добавить {{route.meta.label}}
    </el-button>
  </div>

</template>

<script>

import {ref, reactive, inject, watchEffect} from "vue";
import {useRoute, useRouter} from 'vue-router'
import {ActionsRepo} from "@/repositories";

export default {
  name : "navBar",
  setup(){
    const user     = inject('user');
    const notify   = inject('notify');

    const isAdmin  =  user.roles.indexOf('admin') >= 0 ? true : false;

    const route    = useRoute();
    const router   = useRouter();

    const loading  = ref(false);

    const menu     = reactive([]);
    router.getRoutes().forEach(el => {
      if (el.meta.name)
       !el.meta.forAdmin ? menu.push({path : el.path, name : el.meta.name}) : isAdmin ? menu.push({path : el.path, name : el.meta.name}) : '';
    })

    const activeIndex = ref(null);
    const needActions = ref('');

    async function getData(){
      try {
        loading.value = true;
        let result = await ActionsRepo.badge({
          user_id     : user.id,
        });

        needActions.value = result.data.count;

        if(result.notify) notify(result.notify);

      } catch (e) {
        needActions.value = '';
        notify({title : 'Ошибка при выполнении запроса на получение числа договоров, требующих действий ', message : e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }
    };
    getData();

    watchEffect(() => { activeIndex.value = route.path });

    return{ activeIndex, menu, route, needActions, router}
  },
}
</script>

<style scoped>

</style>