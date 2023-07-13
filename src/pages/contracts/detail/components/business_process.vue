<template>
  <pre-loader
      :loading="loading"
  >

    <h4
        v-if="contractStatus === 'correction_primary_data'"
        class="text-red-500"
    >
      Обратите внимание - текущий статус договора {{MAP[contractStatus]}}. Не запускайте процесс согласования если не уверены, что все замечания устранены!
    </h4>

    <h4
        v-if="['lawyer_check', 'correction_after_approval'].includes(contractStatus)"
        class="text-red-500"
    >
      Обратите внимание. Процесс внутреннего согласования договора может запустить только специалист юридического отдела.
    </h4>

    <br/>

    <Process
        v-if="contractStatus !== 'contract_cancel'"
        :config="configProcess"
        @process="getProcess"
    />

    <p v-else class="text-red-500" > Дальнейшая работа по договору прекращена</p>

  </pre-loader>
</template>

<script>

import {ref, provide, inject, reactive} from 'vue';
import Process from "@/process/Process"
import preLoader from "@/components/pre_loader";
import { useRoute } from 'vue-router';
import {ActionsRepo, ProcessRepo, ContractRepo} from "@/repositories";

export default {
  name       : "business_process",
  props      : ['value'],
  components : {Process, preLoader},
  setup(props){
    const route           = useRoute();
    const user            = inject('user');

    const notify          = inject('notify');
    const contractStatus  = inject('contractStatus');
    const full_access     = inject('full_access');
    const MAP             = inject('MAP');
    const count_protocols = inject('count_protocols');

    const loading         = ref(false);
    provide('loading', loading);

    let sub_title         = {
      8 : `Согласование первичных данных договора, контрагент - ${props.value[3].value[0]}, инициатор - ${props.value[5].value[0]} `,
      9 : `Внутреннее согласование договора, контрагент -       ${props.value[3].value[0]}, инициатор - ${props.value[5].value[0]}`,
    };

    let process_id        = {
      contract_created             : 8, // начальный статус когда договор создали
      manager_approval             : 8, // стадия утверждения у руководителя
      correction_primary_data      : 8, // когда руководитель или юрист вернули на доработку
      contract_cancel              : 8, // когда прекратили работу по договору

      lawyer_check                 : 9, // начальный статус процесса, когда ранее руководитель согласовал и далее юрист принимает решение и стартует процесс или возвращает на доработку
      contract_internal_approval   : 9, // стадия согласования и утверждение в процессе
      correction_after_approval    : 9, // когда не согласовали и вернули на доработки, в составляется протокол разногласий и согласовывают по новой... и так может быть много раз и много протоколов
      protocol_contragent_approval : 9, // если согласовали с протоколом разногласий
      transfer_originals_to_lawyer : 9, // если согласовали с первого раза без протоколов разногласий
      contract_signing             : 9, // на этапе подписания
      contract_active              : 9, // работа завершена, договор в действии
    };

    let configProcess     = reactive({
      process_id  : process_id[contractStatus.value],
      document_id : route.params.id,
      user        : user.id,
      subtitle    : [ sub_title[ process_id[ contractStatus.value ] ] ],
      full_access : full_access.value,
      data_notify : { //данные для формирования уведомления
        executor : props.value.find(el => {return el.eng_name === 'responsible'}).value,
        date     : props.value.find(el => {return el.eng_name === 'date'}).value,
        id       : route.params.id
      }
    });

    async function getProcess(item){

      let status = {
        //статусы договора
        27 : 'contract_created', //это если руководитель вернул на доработки и с этого же статуса "27" мы стартуем процесс изначально
        28 : 'manager_approval', // на согласовании у руководителя
        29 : count_protocols.value > 0 ? 'correction_after_approval' : 'lawyer_check', // когда руководитель согласовал и далее пошло юристу или когда был возврат но второй круг и до этого были протоколы

        30 : 'correction_after_approval',    //это если вернули на доработки и с этого же статуса "30" мы стартуем процесс изначально
        31 : 'contract_internal_approval',   //когдка в процессе согласования
        32 : 'contract_internal_approval',   //когда в процессе утверждения, то тот же статус
        33 : count_protocols.value > 0 ? 'protocol_contragent_approval' : 'transfer_originals_to_lawyer', // после того как согласовали
      };

      // не участвуют в модуле согласований следующие статусы - wait_contragent_answer, contract_signing, contract_active, contract_cancel

      //обновляем текущих согласовантов/утверждантов
      if(['manager_approval', 'contract_internal_approval'].includes(contractStatus.value)){
        try {
          loading.value = true;
          let result = await ActionsRepo.update({
            user_id     : user.id,
            contract_id : route.params.id,
            users_id    : item.stage_current_users ? item.stage_current_users : []
          });

          if(result.notify) notify(result.notify);

        } catch (e) {
          notify({title : 'Ошибка при выполнении запроса на обновление списка текущих согласующих и утверждающих лиц', message : e.message, type : 'error', duration : 5000})
        }
        finally {
          loading.value = false;
        }
      }

      //ниже если прошло аннулирование процесса надо статусы вернуть на предыдущие
      if(!item.status_current && ['manager_approval', 'contract_internal_approval'].includes(contractStatus.value)){

        let old_status = '';

        if(contractStatus.value === 'manager_approval') {//согласование у руководителя

           if(item.history[item.history.length - 1].result.indexOf('Отклонить работу по договору') >= 0) old_status = 'contract_cancel'
             else old_status = 'contract_created'
        }

        if(contractStatus.value === 'contract_internal_approval'){ //полное внутреннее согласование
          let members = Object.keys(item.stages_users).length;
          let members_history = item.history.slice(-members);
          let is_comment = members_history.find(el => {return el.result.indexOf('Оставить комментарий') >= 0});

          if (is_comment)
            old_status = 'correction_after_approval'; //если не согласовали
              else
                old_status = count_protocols.value > 0 ? 'lawyer_check' : 'correction_after_approval'; // если было аннулирование то надо понять как было до этого исходя из наличия протоколов разногласий
        }

        try {
          loading.value = true;
          let result = await ContractRepo.changeStatus({
            user_id     : user.id,
            contract_id : route.params.id,
            status      : old_status,
            users_id    : [],
          });

          contractStatus.value = old_status;

          if(result.notify) notify(result.notify);

        } catch (e) {
          notify({title : 'Ошибка при аннулировании согласования/утверждения', message : e.message, type : 'error', duration : 5000});
        }

        finally {
          loading.value = false;
        }
      }; //аннулирование


      //обновляем статус договора от модуля согласования если прошло изменение
      //ниже массив статусов, находясь в которых, у договора разрешено менять статус из модуля согласования
       if (['contract_created', 'manager_approval', 'lawyer_check', 'correction_primary_data', 'correction_after_approval', 'contract_internal_approval'].includes(contractStatus.value) &&
           status[item.status_current] && contractStatus.value !== status[item.status_current]) {

         let new_status = status[item.status_current];
         let users_id   = item.stage_current_users ? item.stage_current_users : [];

         //ниже если согласовали с комментариями то вернуть на корректировку и удалить процесс.. будет новое согласование
         if(item.status_current == 33){
           let members = Object.keys(item.stages_users).length;
           let members_history = item.history.slice(-members);
           let is_comment = members_history.find(el => {return el.result.indexOf('Оставить комментарий') >= 0})

           if (is_comment) {
             new_status = 'correction_after_approval';

             try {
               loading.value = true;
               let result = await ProcessRepo.deleteProcessDoc({
                 process_document_id : route.params.id,
                 module_name         : 'ContractWork',
                 process_id          : [9],
               });

               if(result.notify) notify(result.notify);

             } catch (e) {
               notify({title : 'Ошибка при удалении процесса согласования.', message : e.message, type : 'error', duration : 5000})
             }

             finally {
               loading.value = false;
             }
           }

         }

         //ниже обновить статус документа
         try {
           loading.value = true;
           let result = await ContractRepo.changeStatus({
             user_id     : user.id,
             contract_id : route.params.id,
             status      : new_status,
             users_id
           });

           contractStatus.value = new_status;

           if(result.notify) notify(result.notify);

         } catch (e) {
           notify({title : 'Ошибка при изменении статуса договора.', message : e.message, type : 'error', duration : 5000})
         }

         finally {
           loading.value = false;
         }

      };
    };

    return{route, user, loading, contractStatus, MAP, sub_title, configProcess, count_protocols,
      getProcess
    }


  },
}
</script>

<style scoped>

</style>