<template>
  <pre-loader
      :loading="loading"
  >

    <div class="flex justify-between pb-2">
      <h3>Просмотр договора № {{route.params.id}}, статус - {{MAP[contractStatus]}} {{waiting_edit ? '(ожидание корретировки инициатором)' : ''}}.</h3>
      <returnButton class="no-print"/>
    </div>

    <el-tabs type="border-card" v-model="page">
      <el-tab-pane v-for="(item, key) in menu" :label="item" :name="key" :key="key"/>
        <contract
          v-if="page === 'contract' && !loading"
          :value="contract.data"
          :responsible_id = contract.responsible_id
        />
        <business_process
          v-if="page === 'business_process' && !loading"
          :value="contract.data"
        />
        <lawyer
            v-if="page === 'lawyer' && !loading"
            :value="lawyer"
            @toApprove="page='business_process'"
        />
        <protocols
            v-if="page === 'protocols' && !loading"
            :value="protocols"
            @toApprove="page='business_process'"
        />
        <scans
          v-if="page === 'scans' && !loading"
          :value="scans"
          :responsible_id = contract.responsible_id
        />
        <logs  v-if="page === 'logs'  && !loading" />
    </el-tabs>

  </pre-loader>

</template>

<script>
import {ContractRepo} from "@/repositories";
import {useRouter, useRoute} from 'vue-router';
import {ref, inject, reactive} from "vue";
import preLoader from "@/components/pre_loader";
import returnButton from "@/components/return_button";
import business_process from "@/pages/contracts/detail/components/business_process"
import contract from "@/pages/contracts/detail/components/contract"
import scans from "@/pages/contracts/detail/components/scans"
import lawyer from "@/pages/contracts/detail/components/lawyer"
import logs from "@/pages/contracts/detail/components/logs"
import protocols from "@/pages/contracts/detail/components/protocols"

export default {
  name       : "detailContractIndex",
  components : {preLoader, returnButton, business_process, contract, scans, lawyer, logs, protocols},
  setup(){
    const router          = useRouter();
    const route           = useRoute();

    const notify          = inject('notify');

    const contractStatus  = inject('contractStatus');
    const full_access     = inject('full_access');

    const MAP             = inject('MAP');

    const user            = inject('user');

    const count_protocols = inject('count_protocols');
    const waiting_edit    = inject('waiting_edit');

    const loading         = ref(false);

    const page            = ref('contract');

    const menu            = reactive({
      contract         : 'Договор',
      business_process : 'Согласование',
      lawyer           : 'Юридические данные',
      protocols        : 'Протокол разногласий',
      scans            : 'Сканы документов',
      logs             : 'История',
    });

    const contract        = reactive({
      status         : null,
      data           : [],
      responsible_id : null
    });

    const lawyer          = reactive({
      data  : [],
      files : {
        file        : [],
        file_exists : [],
      },
    });

    const protocols       = reactive({
      data  : [],
      files : {
        file        : [],
        file_exists : [],
      },
    });

    const scans           = reactive({
      data  : [],
      files : {
        file        : [],
        file_exists : [],
      },
    });

    const isAdmin         = user.roles.indexOf('admin') >= 0  ? true : false;

    const isLawyer        = user.roles.indexOf('lawyer') >= 0 ? true : false;

    async function getData(){
      try{
        loading.value = true;
        let result = await ContractRepo.detail({
          contract_id : route.params.id,
          user_id     : user.id
        });

        //ниже если не санкционированно перешли в договор и получили пустую дату, то выкинуть в общий список
        if (!result.data){
          router.push({name : 'ListContracts'})
          return;
        }

        contractStatus.value = result.data.status ?? null;

        full_access.value = result.data.full_access ?? null;

        contract.responsible_id = result.data.responsible_id ?? null;

        if (result.data.contract) contract.data = result.data.contract;

        if (result.data.lawyer && result.data.lawyer.data)  lawyer.data = result.data.lawyer.data;

        if (result.data.protocols && result.data.protocols.data) protocols.data = result.data.protocols.data;

        if (result.data.scans && result.data.scans.data) scans.data = result.data.scans.data;

        if(result.notify) notify(result.notify);

        //ниже проверка, что если статус уже на согласовании у юриста то full_access убрать у всех кроме юриста или админа
        if (['lawyer_check'].includes(contractStatus.value)) full_access.value = (isAdmin || isLawyer);

        if (['correction_after_approval'].includes(contractStatus.value)) full_access.value = isAdmin;

        //ниже проверка есть ли протоколы разногласия
        count_protocols.value = result.data.count_protocols ?? null;

        //ниже проверка есть ли ожидание редактирования от инициатора договора
        waiting_edit.value = result.data.waiting_edit ?? null;

      } catch (e) {
        router.push({name : 'ListContracts'})
        notify({title : `Получение данных о договоре № ${route.params.id}.`, message : e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    };
    getData();

    return{loading, route, router, MAP, contractStatus, page, menu, contract, lawyer, protocols, scans,
      count_protocols, waiting_edit, user,
    }
  }
}
</script>

<style scoped>

</style>