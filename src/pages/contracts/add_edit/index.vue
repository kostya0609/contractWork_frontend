<template>
  <pre-loader
      :loading="loading"
      class="mx-auto"
  >

    <div class="flex justify-between pb-4">
      <h3 class="font-bold text-xl mr-5">{{route.name === 'addContract' ? 'Создание нового' : 'Редактирование'}} договора{{route.name === 'editContract' ? ` c ID  - ${route.params.id}` : ''}}</h3>
      <returnButton/>
    </div>

    <el-tabs type="border-card" v-model="page">
      <el-tab-pane name="main_data" key="main_data">
        <template #label>
          <span :class="{'text-red-500' : errors.main_data_tab}">
            <span>Основные данные</span>
          </span>
        </template>
        <main_data
          v-if="page === 'main_data' && !loading"
          v-model:contract="contract"
          :errors="errors"
          :options_list="options_list"
          :waiting_edit="contract.waiting_edit"
        />
      </el-tab-pane>

      <el-tab-pane name="files" key="files">
        <template #label>
          <span :class="{'text-red-500' : errors.files_tab}">
            <span>Прикрепленные файлы</span>
          </span>
        </template>
        <files
          v-if="page === 'files' && !loading"
          v-model:files="files"
          :waiting_edit="contract.waiting_edit"
        />
      </el-tab-pane>
    </el-tabs>

    <br/>

    <el-row v-if="['contract_created','correction_primary_data'].includes(contractStatus) || contractStatus === 'correction_after_approval' && contract.waiting_edit || isAdmin">
      <el-col :xs="18" :sm="10" :md="8" :lg="6">
        <el-button
          class="uppercase blueButton w-full"
            @click="saveContract"
        >
          {{route.name === 'addContract' ? 'Создать договор' : 'Сохранить изменения'}}
        </el-button>
      </el-col>
    </el-row>
  </pre-loader>
</template>

<script>

import {ContractRepo} from '@/repositories';
import preLoader from "@/components/pre_loader";
import main_data from "@/pages/contracts/add_edit/components/main_data";
import files from "@/pages/contracts/add_edit/components/files";

import returnButton from "@/components/return_button";
import {ref, inject, reactive, watchEffect} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name       : "addEditContractIndex",
  components : {returnButton, preLoader, main_data, files},
  setup(){
    const router         = useRouter();
    const route          = useRoute();

    const notify         = inject('notify');
    const contractStatus = inject('contractStatus');

    const user           = inject('user');

    const loading        = ref(false);

    const contract       = reactive({
      id                    : route.params.id ? route.params.id : null,
      user_id               : user.id,
      contract_type_id      : null,
      organization_id       : null,
      department_id         : user.department.id ?? '',
      contragent_id         : null,
      company_type_id       : null,
      responsible_id        : user.id,
      looker_ids            : [],
      signatory_id          : null,
      content               : '',
      waiting_edit          : 0,
      status                : 'contract_created'
    });

    const files          = reactive({
      left  : {
        contract  : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Договор',
          multiple : false,
          errors   : null,
        }, //договор
        addition  : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Доп.соглашение',
          multiple : false,
          errors   : null,
        },//доп соглашение
        annex     : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Приложение к договору',
          multiple : false,
          errors   : null,
        },//приложение
        others    : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Дополнительные файлы',
          multiple : true,
          errors   : null,
        }, //другие дополнительные файлы
      },
      right : {
        note      : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Пояснительная записка',
          multiple : false,
          errors   : null,
        },//пояснительная записка
        info      : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Сведения о контрагенте(в формате PDF), полученные на официальном сайте ИФНС',
          multiple : false,
          errors   : null,
        },//сведения о контрагенте
        about     : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Пояснения контрагента',
          multiple : false,
          errors   : null,
        },//пояснения контрагента
        extract   : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Выписка из ЕГРЮЛ/ЕГРИП',
          multiple : false,
          errors   : null,
        },//выписка из ЮГРЮЛ
        report    : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Отчет по форме 1(Бухгалтерский баланс) и Форме 2(Отчет о прибылях и убытках) за два последних года, для оценки надежности контрагента',
          multiple : false,
          errors   : null,
        },//отчет по форме 1
        agree     : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Разрешение на осуществление деятельности(если предмет договора касается деятельности, подлежащей лицензированию)',
          multiple : false,
          errors   : null,
        },//разрешение на осуществление деятельности
        vicarious : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Копия доверенности, заверенная печатью организации/ИП, копия страниц №№2,3 паспорта представителя',
          multiple : false,
          errors   : null,
        },//копися доверенности
        form      : {
          list     : [],
          file     : [],
          id       : [],
          label    : 'Анкета оптового клинта для получения товарного кредита(см. Приложение к "ИП предоставление скидок и товарного кредита при работе с оптовыми клиентами")',
          multiple : false,
          errors   : null,
        },//анкета оптового клиента
      },
    });

    const options_list   = reactive({
      contract_type_list      : [],
      organization_list       : [],
      department_list         : [{value : user.department.id, label : user.department.name}],
      contragent_list         : [],
      company_type_list       : [],
      responsible_list        : [],
      lookers_list            : [],
      signatory_list          : [],
    });

    const errors         = reactive({
      main_data_tab         : null,
      files_tab             : null,

      contract_type_id      : null,
      organization_id       : null,
      department_id         : null,
      contragent_id         : null,
      company_type_id       : null,
      responsible_id        : null,
      signatory_id          : null,
      content               : null,
    });

    const page           = ref('main_data');

    const isAdmin        = user.roles.indexOf('admin') >= 0  ? true : false;

    async function getData(){
      try{
        loading.value = true;
        let result = await ContractRepo.get({
          contract_id : route.params.id,
          user_id     : user.id
        });

        //ниже если не санкционированно перешли в договор и получили пустую дату, то выкинуть в общий список
        if (!result.data){
          router.push({name : 'ListContracts'})
          return;
        }

        Object.assign(contract, result.data.contract_data);

        contractStatus.value = contract.status;
        Object.keys(result.data.options).forEach(name => {
          result.data.options[name].forEach(el => options_list[name].push(el));
        })

        Object.keys(result.data.files).forEach(side => {
          Object.keys(result.data.files[side]).forEach(name => {
            files[side][name].id   = result.data.files[side][name];
            files[side][name].list = result.data.files[side][name];
          });
        })

        if(result.notify) notify(result.notify)

       } catch (e) {
         router.push({name : 'ListContracts'})
         notify({title : `Получение данных о договоре № ${route.params.id}.`, message : e.message, type : 'error', duration : 5000})
       } finally {
        loading.value = false;
       }
    };

    route.name === 'editContract' ? getData() : contractStatus.value = 'contract_created';

    function validation(){
      let valid = true;

      if (!contract.contract_type_id) {valid = false; errors.contract_type_id = 'Необходимо указать Тип договора!'};
      if (!contract.organization_id)  {valid = false; errors.organization_id  = 'Необходимо указать Организацию!'};
      if (!contract.department_id)    {valid = false; errors.department_id    = 'Не заполнен департамент, ошибка получения данных с сервера'};
      if (!contract.contragent_id)    {valid = false; errors.contragent_id    = 'Необходимо указать Контрагента!'};
      if (!contract.company_type_id)  {valid = false; errors.company_type_id  = 'Необходимо указать Вид правовой собственности!'};
      if (!contract.responsible_id)   {valid = false; errors.responsible_id   = 'Необходимо указать Инициатора!'};
      if (!contract.signatory_id)     {valid = false; errors.signatory_id     = 'Необходимо указать Подписанта!'};
      if (!contract.content)          {valid = false; errors.content          = 'Необходимо указать Содержание документа!'};

      if(files.left.contract.file.length === 0 && files.left.contract.id.length === 0) {valid = false; files.left.contract.errors = 'Необходимо прикрепить файл договора'};

      if(!valid) notify({title : 'Ошибка заполнения формы',message : 'Проверте заполнение обязательных полей. Обратите внимание на вкладки, выделенные красным цветом!',type : 'error', duration : 5000});
      return valid;
      }

    async function saveContract(){
      if (!validation()) return;

      let data = new FormData();
      data.append('data', JSON.stringify(contract));

      Object.keys(files).forEach(side => {

        Object.keys(files[side]).forEach(name => {
          if(files[side][name].multiple){
            for(let i = 0; i < files[side][name].file.length; i++){
              data.append(name + '_file['+i+']', files[side][name].file[i].raw);
            }

            for(let i = 0; i < files[side][name].id.length; i++){
              data.append(name + '_file.id['+i+']', files[side][name].id[i].id);
            }
          }else{
            files[side][name].file[0] ? data.append(name + '_file',    files[side][name].file[0].raw) : '';
            files[side][name].id[0]   ? data.append(name + '_file_id', files[side][name].id[0].id)    : '';
          }
        });

      })

      try {
        loading.value = true;

        let result = route.name === 'addContract' ? await ContractRepo.create(data) : await ContractRepo.edit(data);

        if(result.notify) notify(result.notify);

        router.push({name:'detailContract', params : {id : result.data.contract_id, tab : 'business_process'}});

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на создание нового договора', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }

    }

    watchEffect(() => {
      contract.contract_type_id       ? errors.contract_type_id      = null : '';
      contract.organization_id        ? errors.organization_id       = null : '';
      contract.department_id          ? errors.department_id         = null : '';
      contract.contragent_id          ? errors.contragent_id         = null : '';
      contract.company_type_id        ? errors.company_type_id       = null : '';
      contract.responsible_id         ? errors.responsible_id        = null : '';
      contract.looker_ids.length      ? errors.looker_ids            = null : '';
      contract.signatory_id           ? errors.signatory_id          = null : '';
      contract.content                ? errors.content               = null : '';

      files.left.contract.file.length ? files.left.contract.errors   = null : '';

      errors.main_data_tab = !!(errors.contract_type_id || errors.organization_id || errors.department_id ||
          errors.contragent_id || errors.company_type_id || errors.responsible_id ||
          errors.signatory_id || errors.content);

      errors.files_tab = !!(files.left.contract.errors);
    });

    return{
      loading, route, contract, errors, contractStatus, page, files, options_list,

      saveContract, isAdmin,
    }
  },

}
</script>

<style scoped>

</style>