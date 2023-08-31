<template>

  <pre-loader
      :loading="loading"
      class="mx-auto"
  >
    <div v-if="isOK">
      <navBar v-if="navBarVisible"/>
      <router-view/>
    </div>
  </pre-loader>

</template>

<script>
import navBar from "@/components/navBar";
import preLoader from "@/components/pre_loader";
import { useRouter, useRoute } from 'vue-router';
import {ref, provide, reactive, computed} from "vue";
import {ElNotification}  from 'element-plus'
import {FilesRepo, UsersRepo} from '@/repositories';
export default {
  name       : 'App',
  components : {navBar, preLoader},
  setup(){
    const router                    = useRouter();
    const isOK                      = ref(null);
    const timerId                   = ref(null);

    const loading                   = ref(false);

    const notify                    = ({title = '', message = '', type = '', duration = 3000} = {}) => {
      ElNotification({
        title,
        message,
        type,
        duration,
        dangerouslyUseHTMLString: true,
      })
    };

    const contractStatus            = ref('contract_created');
    const full_access               = ref(0);

    const user                      = reactive({
      id            : 14317,
      roles         : [],
      FIO           : '',
      department    : '',
    });
    const navBarVisible             = computed(() => {
      let currentRoute              = router.currentRoute.value.name;
      return['ListContracts', 'listContractsNeedAction', 'listUsers'].includes(currentRoute)
    });

    let gridsData                   = reactive({
      contractWorkList               : {
        paginationData  : {page : 1, count : 10},
        sortData        : {name: "id", order: "desc"},
        filterData      : {},
        showValueFilter : [],
        activeProfile   : null,
      },
      contractWorkNeedActionList : {
        paginationData  : {page : 1, count : 10},
        sortData        : {name: "id", order: "desc"},
        filterData      : {},
        showValueFilter : [],
        activeProfile   : null,
      }
    });

    const MAP                       = {
        contract_created             : 'На подготовке',
        manager_approval             : 'На согласовании у руководителя',
        lawyer_check                 : 'На юридической проверке',
        correction_primary_data      : 'На корректировке первичных данных',
        correction_after_approval    : 'На корректировке после согласования',
        contract_internal_approval   : 'На внутреннем согласовании условий договора',
        protocol_contragent_approval : 'На согласовании протокола с контрагентом',
        wait_contragent_answer       : 'На ожидании обратной связи от контрагента',
        transfer_originals_to_lawyer : 'На передаче оригиналов юристу',
        contract_signing             : 'На подписании договора',
        contract_active              : 'Договор в действии',
        contract_cancel              : 'Договор отменен',
    };

    const count_protocols           = ref(null);
    const waiting_edit              = ref(null);

    async function initData(){
      window._userId ? user.id      = window._userId : user.id      = null;
      window._token  ? window.token = window._token  : window.token = null;
    }

    async function auth(){
      loading.value = true;
      await initData();
      if (window.token) {
        setTimeout(() => {clearInterval(timerId.value)});
        try {
          loading.value = true;

          let result = await UsersRepo.get({user_id: user.id});

          user.roles.length = 0;
          result.data.roles.forEach(el => user.roles.push(el));
          user.FIO        = result.data.user.FIO;
          user.department = result.data.user.department;

          isOK.value = true;

          if(result.notify) notify(result.notify);

        } catch (e) {
          notify({title : 'Проблема с получением данных с сервера', message : e.message, type : 'error'});
        } finally {
          loading.value = false;
        }

      } else {
        user.roles.length = 0;
        user.FIO          = '';
        user.department   = '';
        isOK.value        = false;
        notify({title : 'Проблема с авторизацией на портале', message : 'Нет токена.', type : 'error'});
        timerId.value   = setInterval(async () => await initData(), 15000 );
      };
    };
    auth();

    function formatNumber(number){
      return (+number).toLocaleString('ru-RU',{ minimumFractionDigits: 2 });
    };

    const downLoadFile              = async(file) =>{
      if(!file.id) {
        notify({title : 'Ошибка загрузки файла', message : 'Этот файл недоступен для скачивания. Так как был только что добавлен.', type : 'error'});
        return
      }

      try{
        loading.value = true;
        let result = await FilesRepo.downloadFile({
          file_id : file.id,
        });

        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = `${file.name}.${file.type}`;

        link.click();
        URL.revokeObjectURL(link.href);

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка загрузки файла', message : e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    };

    window.contractWorkLoadFile     = async (id, fileName) => {
      try{

        let result = await FilesRepo.downloadFile({
          file_id : id
        });

        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;

        link.click();
        URL.revokeObjectURL(link.href);

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка загрузки файла', message : e.message, type : 'error', duration : 5000});
      } finally {

      }

      return false;
    };

    provide('notify', notify);
    provide('downLoadFile', downLoadFile);

    provide('contractStatus', contractStatus);
    provide('full_access', full_access);
    provide('user', user);

    provide('formatNumber', formatNumber);
    provide('MAP', MAP);

    provide('gridsData', gridsData);
    provide('count_protocols', count_protocols);
    provide('waiting_edit', waiting_edit);

    return{
      loading, navBarVisible, isOK,
    }
  },
}
</script>

<style>

</style>
