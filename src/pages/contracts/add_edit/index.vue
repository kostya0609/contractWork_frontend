<template>
  <pre-loader
      :loading="loading"
      class="mx-auto"
  >

    <div class="flex justify-between pb-7">
      <h3 class="font-bold text-xl mr-5">{{route.name === 'addContract' ? 'Создание нового' : 'Редактирование'}} договора{{route.name === 'editContract' ? ` c ID  - ${route.params.id}` : ''}}</h3>
      <returnButton/>
    </div>

    <el-row>
      <el-col :md="10" class="lg:border-r-2">
        <div class="lg:pr-5">
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Тип договора</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.contract_type_id"
                  :class="['w-full', {'border border-red-500' : errors.contract_type_id}]"
                  placeholder="Выбрать тип договора"
              >
                <el-option
                    v-for="item in contract_type_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.contract_type_id">{{errors.contract_type_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Организация</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.organization_id"
                  :class="['w-full', {'border border-red-500' : errors.organization_id}]"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="(file) => search(file, 'organization', 'organization')"
                  placeholder="Введите название организации"
              >
                <el-option
                    v-for="item in organization_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.organization_id">{{errors.organization_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Направление</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.contract_direction_id"
                  :class="['w-full', {'border border-red-500' : errors.contract_direction_id}]"
                  placeholder="Выбрать направление договора"
              >
                <el-option
                    v-for="item in contract_direction_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.contract_direction_id">{{errors.contract_direction_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Контрагент</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.contragent_id"
                  :class="['w-full', {'border border-red-500' : errors.contragent_id}]"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="(file) => search(file, 'contragent', 'contragent')"
                  placeholder="Введите название контрагента"
              >
                <el-option
                    v-for="item in contragent_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.contragent_id">{{errors.contragent_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Вид правовой собственности</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.company_type_id"
                  :class="['w-full', {'border border-red-500' : errors.company_type_id}]"
                  placeholder="Выбрать вид правовой собственности"
              >
                <el-option
                    v-for="item in company_type_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.company_type_id">{{errors.company_type_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Инициатор</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.responsible_id"
                  :class="['w-full', {'border border-red-500' : errors.responsible_id}]"
                  placeholder="Введите ФИО инициатора"
                  disabled
              >
                <el-option
                    v-for="item in responsible_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.responsible_id">{{errors.responsible_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Наблюдатели</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.looker_ids"
                  :class="['w-full', {'border border-red-500' : errors.looker_ids}]"
                  ref="looker_select"
                  @change="this.$refs['looker_select'].query = ''"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="(file) => search(file, 'user', 'looker')"
                  :multiple="true"
                  placeholder="Введите ФИО наблюдателя"
              >
                <el-option
                    v-for="item in lookers_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.looker_ids">{{errors.looker_ids}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Регистратор</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.recording_id"
                  :class="['w-full', {'border border-red-500' : errors.recording_id}]"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="(file) => search(file, 'user', 'recording')"
                  placeholder="Введите ФИО регистратора"
              >
                <el-option
                    v-for="item in recording_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.recording_id">{{errors.recording_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="10">
              <label class="font-bold">Подписант</label>
            </el-col>
            <el-col :md="14">
              <el-select
                  v-model="contract.signatory_id"
                  :class="['w-full', {'border border-red-500' : errors.signatory_id}]"
                  filterable
                  remote
                  reserve-keyword
                  :remote-method="(file) => search(file, 'user', 'signatory')"
                  placeholder="Введите ФИО подписанта"
              >
                <el-option
                    v-for="item in signatory_list"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
              </el-select>
              <small class="text-red-500" v-if="errors.signatory_id">{{errors.signatory_id}}</small>
            </el-col>
          </el-row>
          <el-row class="mb-5">
            <el-col :md="24">
              <label class="font-bold mb-5 block">Содержание документа</label>
              <el-input
                  v-model="contract.content"
                  type="textarea"
                  rows="5"
                  :class="['w-full', {'border border-red-500' : errors.content}]"
                  placeholder="Введите содержание документа"
              ></el-input>
              <small class="text-red-500" v-if="errors.content">{{errors.content}}</small>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <el-col :md="14">
        <div class="lg:pl-5">
          <el-row>
            <el-col>
              <label class="font-bold block mb-1">Основные файлы</label>
              <el-upload
                  v-model:file-list="main_files.file_exists"
                  drag
                  ref="upload_main_files"
                  action=""
                  multiple
                  :auto-upload="false"
                  :on-change="(file) => {fileChange(file, 'main_files')}"
                  :on-remove="(file) => {fileRemove(file, 'main_files')}"
                  :on-preview='downLoadFile'
                  :disabled="!['contract_created','correction_primary_data'].includes(contractStatus) && (contractStatus !== 'correction_after_approval' && !contract.waiting_edit) "
              >
                <div
                    v-if="['contract_created','correction_primary_data'].includes(contractStatus) || contractStatus === 'correction_after_approval' && contract.waiting_edit"
                    :class="{'border border-red-500' : errors.main_files}"

                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
                  </div>
                </div>
                <div
                    v-else
                >
                  <p>
                    Изменять основные файлы разрешается если договор имеет статус "На оформлении" или "На корректировки данных"
                  </p>
                </div>
              </el-upload>
              <small class="text-red-500" v-if="errors.main_files">{{errors.main_files}}</small>
            </el-col>
          </el-row>
          <br/>
          <el-row>
            <el-col>
              <label class="font-bold block mb-1">Файлы комментарии</label>
              <el-upload
                  v-model:file-list="comment_files.file_exists"
                  drag
                  ref="upload_comment_files"
                  action=""
                  multiple
                  :auto-upload="false"
                  :on-change="(file) => fileChange(file, 'comment_files')"
                  :on-remove="(file) => fileRemove(file, 'comment_files')"
                  :on-preview='downLoadFile'
                  :disabled="!['contract_created','correction_primary_data'].includes(contractStatus) && (contractStatus !== 'correction_after_approval' && !contract.waiting_edit) "
              >
                <div
                    v-if="['contract_created','correction_primary_data'].includes(contractStatus) || contractStatus === 'correction_after_approval' && contract.waiting_edit"
                    :class="{'border border-red-500' : errors.comment_files}"
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
                  </div>
                </div>
                <div
                    v-else
                >
                  <p>
                    Изменять основные файлы разрешается если договор имеет статус "На оформлении" или "На корректировке данных"
                  </p>
                </div>
              </el-upload>
              <small class="text-red-500" v-if="errors.comment_files">{{errors.comment_files}}</small>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <el-row v-if="['contract_created','correction_primary_data'].includes(contractStatus) || contractStatus === 'correction_after_approval' && contract.waiting_edit">
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

import {SearchRepo, ContractRepo} from '@/repositories';
import preLoader from "@/components/pre_loader";

import returnButton from "@/components/return_button";
import {ref, inject, reactive, watchEffect} from "vue";
import { useRouter, useRoute } from 'vue-router';

export default {
  name: "addEditContractIndex",
  components : {returnButton, preLoader},
  setup(){
    const router         = useRouter();
    const route          = useRoute();

    const notify         = inject('notify');
    const contractStatus = inject('contractStatus');

    const user           = inject('user');
    const downLoadFile   = inject('downLoadFile');

    const loading        = ref(false);

    const contract       = reactive({
      id                    : route.params.id ? route.params.id : null,
      user_id               : user.id,
      contract_type_id      : null,
      organization_id       : null,
      contract_direction_id : null,
      contragent_id         : null,
      company_type_id       : null,
      responsible_id        : user.id,
      looker_ids            : [],
      recording_id          : null,
      signatory_id          : null,
      content               : '',
      waiting_edit          : 0,
      status                : 'contract_created'
    });

    const main_files     = reactive({
      file          : [],
      file_save     : [],
      file_exists   : [],
    });

    const comment_files  = reactive({
      file          : [],
      file_save     : [],
      file_exists   : [],
    });

    const errors         = reactive({
      contract_type_id      : null,
      organization_id       : null,
      contract_direction_id : null,
      contragent_id         : null,
      company_type_id       : null,
      responsible_id        : null,
      looker_ids            : null,
      recording_id          : null,
      signatory_id          : null,
      content               : null,

      main_files            : null,
      comment_files         : null,
    });

    const contract_type_list      = reactive([]);
    const organization_list       = reactive([]);
    const contract_direction_list = reactive([]);
    const contragent_list         = reactive([]);
    const company_type_list       = reactive([]);
    const responsible_list        = reactive([]);
    const lookers_list            = reactive([]);
    const recording_list          = reactive([]);
    const signatory_list          = reactive([]);

    async function search(query, type, role){
      if (!query) return;

      try {
        loading.value = true;
        let result = '';

        if (type === 'user')
          result = await SearchRepo.searchUsers(query);

        if (type === 'organization')
          result = await SearchRepo.searchOrganization(query);

        if (type === 'contragent')
          result = await SearchRepo.searchContragent(query);

        loading.value = false;

        switch (role){
          case 'looker' :
            lookers_list.length = 0;
            result.forEach(el => lookers_list.push(el));
            break;
          case 'recording' :
            recording_list.length = 0;
            result.forEach(el => recording_list.push(el));
            break;
          case 'signatory' :
            signatory_list.length = 0;
            result.forEach(el => signatory_list.push(el));
            break;
          case 'contragent' :
            contragent_list.length = 0;
            result.forEach(el => contragent_list.push(el));
            break;
          case 'organization' :
            organization_list.length = 0;
            result.forEach(el => organization_list.push(el));
            break;
        }

     } catch (e) {
        loading.value = false;
        notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
     }
    };

    function fileChange(file, type){
      let newFilName = file.name;

      if (type === 'main_files'){
        let err_there_is_file      = !!main_files.file.find(item => newFilName === item.name);
        let err_there_is_file_save = !!main_files.file_save.find(item => newFilName === `${item.name}.${item.type}`);

        if (!err_there_is_file && !err_there_is_file_save ){
          main_files.file.push(file.raw);
        } else {
          notify({title : 'Ошибка добавления основного файла', message : 'Файл с таким именем уже существует.', type : 'error'});
          setTimeout(() => {main_files.file_exists.splice(main_files.file_exists.length - 1 , 1)}, 0);
        };

      }

      if (type === 'comment_files'){
        let err_there_is_file      = !!comment_files.file.find(item => newFilName === item.name );
        let err_there_is_file_save = !!comment_files.file_save.find(item => newFilName === `${item.name}.${item.type}`) ;

        if (!err_there_is_file && !err_there_is_file_save ){
          comment_files.file.push(file.raw);
        } else {
          notify({title : 'Ошибка добавления файла комментария', message : 'Файл с таким именем уже существует.', type : 'error'});
          setTimeout(() => {comment_files.file_exists.splice(comment_files.file_exists.length - 1 , 1)}, 0);
        };

      }
    };

    function fileRemove(file, type){
      if (type === 'main_files'){
        main_files.file_save   = main_files.file_save.filter(el => el.id !== file.id);
        main_files.file        = main_files.file.filter(el => el.name !== file.name);
      }

      if (type === 'comment_files'){
        comment_files.file_save   = comment_files.file_save.filter(el => el.id !== file.id);
        comment_files.file        = comment_files.file.filter(el => el.name !== file.name);
      }
    };

    async function getAdditionalData(){
      try{
        loading.value = true;
        let result = await ContractRepo.getAdditionalInfo({user_id : user.id});

        responsible_list.length = 0;
        responsible_list.push(result.data.responsible_list);

        company_type_list.length = 0;
        result.data.companyTypes.forEach(el => company_type_list.push({value : el.id, label : el.type}));

        contract_type_list.length = 0;
        result.data.contractTypes.forEach(el => contract_type_list.push({value : el.id, label : el.type}));

        contract_direction_list.length = 0;
        result.data.contractDirections.forEach(el => contract_direction_list.push({value : el.id, label : el.direction}));

        if(result.notify) notify(result.notify);

      } catch (e) {
          notify({title : 'Получение дополнительных данных для создания договора', message : e.message, type : 'error', duration : 5000});
      } finally {
          loading.value = false;
      }
    };
    getAdditionalData();

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

        result.data.options.contragent_list.forEach(el => contragent_list.push(el));

        result.data.options.lookers_list.forEach(el => lookers_list.push(el));

        result.data.options.organization_list.forEach(el => organization_list.push(el));

        result.data.options.recording_list.forEach(el => recording_list.push(el));

        result.data.options.responsible_list.forEach(el => responsible_list.push(el));

        result.data.options.signatory_list.forEach(el => signatory_list.push(el));

        result.data.files.main_files.forEach(el => {
          main_files.file_save.push(el);
          main_files.file_exists.push(el)
        });

        result.data.files.comment_files.forEach(el => {
          comment_files.file_save.push(el);
          comment_files.file_exists.push(el)
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

      if (!contract.contract_type_id)       {valid = false; errors.contract_type_id       = 'Необходимо указать Тип договора!'};
      if (!contract.organization_id)        {valid = false; errors.organization_id        = 'Необходимо указать Организацию!'};
      if (!contract.contract_direction_id)  {valid = false; errors.contract_direction_id  = 'Необходимо указать Направление!'};
      if (!contract.contragent_id)          {valid = false; errors.contragent_id          = 'Необходимо указать Контрагента!'};
      if (!contract.company_type_id)        {valid = false; errors.company_type_id        = 'Необходимо указать Вид правовой собственности!'};
      if (!contract.responsible_id)         {valid = false; errors.responsible_id         = 'Необходимо указать Инициатора!'};
      if (contract.looker_ids.length === 0) {valid = false; errors.looker_ids             = 'Необходимо указать Наблюдателей!'};
      if (!contract.recording_id)           {valid = false; errors.recording_id           = 'Необходимо указать Регистратора!'};
      if (!contract.signatory_id)           {valid = false; errors.signatory_id           = 'Необходимо указать Подписанта!'};
      if (!contract.content)                {valid = false; errors.content                = 'Необходимо указать Содержание документа!'};

      if(main_files.file.length    === 0 && main_files.file_save.length    === 0) {valid = false; errors.main_files    = 'Необходимо прикрепить Основные файлы'};
      if(comment_files.file.length === 0 && comment_files.file_save.length === 0) {valid = false; errors.comment_files = 'Необходимо прикрепить Файлы комментарии'};

      return valid;
      }

    async function saveContract(){
      if (!validation()) return;

      let data = new FormData();
      data.append('data', JSON.stringify(contract));

      for(let i = 0; i < main_files.file.length; i++){
        data.append('main_files[file]['+i+']', main_files.file[i]);
      };

      for(let i = 0; i < main_files.file_save.length; i++){
        data.append('main_files[file_save]['+i+']', main_files.file_save[i].id);
      };

      for(let i = 0; i < comment_files.file.length; i++){
        data.append('comment_files[file]['+i+']', comment_files.file[i]);
      };

      for(let i = 0; i < comment_files.file_save.length; i++){
        data.append('comment_files[file_save]['+i+']', comment_files.file_save[i].id);
      };

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
      contract.contract_type_id      ? errors.contract_type_id      = null : '';
      contract.organization_id       ? errors.organization_id       = null : '';
      contract.contract_direction_id ? errors.contract_direction_id = null : '';
      contract.contragent_id         ? errors.contragent_id         = null : '';
      contract.company_type_id       ? errors.company_type_id       = null : '';
      contract.responsible_id        ? errors.responsible_id        = null : '';
      contract.looker_ids.length     ? errors.looker_ids            = null : '';
      contract.recording_id          ? errors.recording_id          = null : '';
      contract.signatory_id          ? errors.signatory_id          = null : '';
      contract.content               ? errors.content               = null : '';

      (main_files.file.length    || main_files.file_save.length)    ? errors.main_files    = null : '';
      (comment_files.file.length || comment_files.file_save.length) ? errors.comment_files = null : '';
    });

    return{
      loading, route, contract, errors, contract_type_list, organization_list, contract_direction_list, contragent_list,
      company_type_list, responsible_list, lookers_list, recording_list, signatory_list, contractStatus, main_files, comment_files,

      search, fileChange, fileRemove, downLoadFile, saveContract,
    }
  },

}
</script>

<style scoped>

</style>