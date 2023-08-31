<template>
  <pre-loader
      :loading="loading"
  >
    <log_template v-if="!loading" :history="history"/>
  </pre-loader>
</template>

<script>

import preLoader from "@/components/pre_loader";
import log_template from "@/components/log_template";
import {inject, ref, reactive} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import {ProcessRepo} from "@/repositories";


export default {
  name       : "logs_bp",
  components : {preLoader, log_template},
  setup(){
    const notify  = inject('notify');

    const route   = useRoute();

    let loading   = ref(false);
    const history = reactive([]);

    async function getData(){
      //ниже запрашиваем историю из модуля согласования
      try {
        loading.value = true;

        let result = await ProcessRepo.getProcessDoc({
          document_id : route.params.id,
          process_id  : 8,
        });

        if (result.data.history) {
          result.data.history.forEach(el => history.push(
              {
                date    : el.created_at,
                event   : 'Решение : ' + el.result,
                comment : el.comment ? 'Комментарий : ' + el.comment : '',
                user    : el.user
              }
          ))
        }

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на получение истории по договору из модуля согласования', message :e.message, type : 'error', duration : 5000});
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