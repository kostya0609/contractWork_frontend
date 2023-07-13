<template>
  <pre-loader
      :loading="loading"
  >
    <el-table :data="history" stripe  class="logs-table" height="500" :show-header="false">
      <el-table-column prop="date" width="140"
      >
        <template #default="scope">
          {{formatDate(scope.row.date)}}
        </template>
      </el-table-column>
      <el-table-column prop="event">
        <template #default="scope">
          {{(scope.row.event)}}
          <br/> {{scope.row.comment}}
        </template>
      </el-table-column>
      <el-table-column width="70">
        <template #default="scope">
            <span class="userPhoto">
              <a :href="scope.row.user.link">
                <img :src="scope.row.user.photo" alt="фото"/>
              </a>
            </span>
        </template>
      </el-table-column>
    </el-table>
  </pre-loader>
</template>

<script>

import moment from 'moment'
import preLoader from "@/components/pre_loader";
import {inject, ref, reactive} from 'vue'
import { useRouter, useRoute } from 'vue-router';
import {LogsRepo, ProcessRepo} from "@/repositories";

export default {
  name       : "logs",
  components : {preLoader},
  setup(){
    const notify  = inject('notify');

    const route   = useRoute();

    let loading   = ref(false);
    const history = reactive([]);

    function formatDate(date){
      return moment(date).format('DD.MM.YYYY  HH:mm');
    }

    async function getData(){
      //ниже запрашиваем основную историю по SMART
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

      //ниже запрашиваем историю из модуля согласования и потом их объеденяем и сортируем
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
          history.sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
          });
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

    return {history, loading,
      formatDate
    }
  },

}
</script>

<style scoped>

</style>