<template>
  <pre-loader
      :loading="loading"
  >
    <log_template v-if="!loading" :history="history"/>
  </pre-loader>
</template>

<script>

import moment from 'moment'
import preLoader from "@/components/pre_loader";
import log_template from "@/components/log_template";
import {inject, ref, reactive} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import {LogsRepo} from "@/repositories";

export default {
  name       : "logs",
  components : {preLoader, log_template},
  setup(){
    const notify  = inject('notify');

    const route   = useRoute();

    let loading   = ref(false);
    const history = reactive([]);

    async function getData(){
      //ниже запрашиваем основную историю по Договору
      try {
        loading.value = true;

        let result = await LogsRepo.get({contract_id : route.params.id});

        if (Array.isArray(result.data)) {
          history.length = 0;
          result.data.forEach(el => {
            history.push(el);
          })
        }

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на получение основной истории по договору', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }

    }
    getData()

    return {history, loading}
  },

}
</script>

<style scoped>

</style>