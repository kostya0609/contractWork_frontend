<template>
  <pre-loader
      :loading="loading"
  >
    <detail_table :value="$attrs.value"/>

    <el-row v-if="responsible_id === user.id || full_access && !isLawyer || isAdmin" class="justify-between mt-3">

      <el-col
          :xs="13" :sm="11" :md="10" :lg="8"
          v-if="['contract_created', 'correction_primary_data'].includes(contractStatus) || (contractStatus === 'correction_after_approval' && count_protocols > 0) || isAdmin">
        <el-button
            class="blueButton w-full"
            @click="router.push({name:'editContract', params: { id: route.params.id }})"
        >
          Редактировать
        </el-button>
      </el-col>

      <el-col
          :xs="13" :sm="11" :md="10" :lg="8"
          v-if="['contract_created', 'correction_primary_data'].includes(contractStatus) || (contractStatus === 'correction_after_approval' && count_protocols == 0)">
        <el-button
            class="blueButton w-full"
            @click="emit('toBusinessProcess')"
        >
          Отправить на согласование
        </el-button>
      </el-col>

      <el-col
          :xs="13" :sm="11" :md="10" :lg="8"
          v-if="contractStatus === 'correction_after_approval' && count_protocols > 0">
        <el-button
            class="blueButton w-full"
            @click="toLawyer"
        >
          Отправить юристу
        </el-button>
      </el-col>
    </el-row>

  </pre-loader>
</template>

<script>
import preLoader from "@/components/pre_loader";
import detail_table from "@/components/detail_table";
import {ElMessageBox} from "element-plus";
import {ContractRepo} from "@/repositories";
import { useRouter, useRoute } from 'vue-router';
import {inject, ref} from "vue";

export default {
  name       : "contractData",
  props      : ['responsible_id'],
  components : {preLoader, detail_table},
  setup(props, {emit}){
    const router          = useRouter();
    const route           = useRoute();

    const notify          = inject('notify');

    const contractStatus  = inject('contractStatus');
    const full_access     = inject('full_access');

    const user            = inject('user');

    const count_protocols = inject('count_protocols');
    const waiting_edit    = inject('waiting_edit');

    const loading         = ref(false);

    const isAdmin         = user.roles.indexOf('admin') >= 0  ? true : false;

    const isLawyer        = user.roles.indexOf('lawyer') >= 0 ? true : false;

    async function toLawyer(){
      await ElMessageBox.confirm(`Вы уверены, что хотите все замечания устранены и передаем договор на согласование юристу?`)

      try {
        loading.value = true;

        let result = await ContractRepo.changeStatus({
          user_id      : user.id,
          contract_id  : route.params.id,
          status       : 'lawyer_check',
          waiting_edit : 0,
        });

        contractStatus.value = 'lawyer_check';

        waiting_edit.value = 0;

        if(result.notify) notify(result.notify);

      } catch (e) {
        if (e !== 'cancel')
          notify({title : 'Ошибка при выполнении запроса на передачу договора юристу', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    }
    return{
      loading, user, router, route, contractStatus, isAdmin, full_access, count_protocols, isLawyer,
      toLawyer, emit
    }
  },
}
</script>

<style scoped>

</style>
