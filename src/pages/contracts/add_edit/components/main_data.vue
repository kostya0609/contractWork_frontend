<template>
  <pre-loader
      :loading="loading"
      class="mx-auto"
  >
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Инициатор</label>
      </el-col>
      <el-col :md="14">
        <el-select
            v-model="contract.responsible_id"
            :class="['w-full', {'border border-red-500' : errors.responsible_id}]"
            placeholder="Введите ФИО инициатора"
            disabled
        >
          <el-option
              v-for="item in options_list.responsible_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.responsible_id">{{errors.responsible_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Департамент</label>
      </el-col>
      <el-col :md="14">
        <el-select
            v-model="contract.department_id"
            :class="['w-full', {'border border-red-500' : errors.contract_direction_id}]"
            placeholder="Выбрать департамент"
            disabled
        >
          <el-option
              v-for="item in options_list.department_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.contract_direction_id">{{errors.contract_direction_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Тип договора</label>
      </el-col>
      <el-col :md="14" >
        <el-select
            v-model="contract.contract_type_id"
            :class="['w-full', {'border border-red-500' : errors.contract_type_id}]"
            placeholder="Выбрать тип договора"
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.contract_type_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.contract_type_id">{{errors.contract_type_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Организация</label>
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
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.organization_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.organization_id">{{errors.organization_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Контрагент</label>
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
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.contragent_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.contragent_id">{{errors.contragent_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Вид правовой собственности контрагента</label>
      </el-col>
      <el-col :md="14">
        <el-select
            v-model="contract.company_type_id"
            :class="['w-full', {'border border-red-500' : errors.company_type_id}]"
            placeholder="Выбрать вид правовой собственности"
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.company_type_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.company_type_id">{{errors.company_type_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Наблюдатели</label>
      </el-col>
      <el-col :md="14">
        <el-select
            v-model="contract.looker_ids"
            :class="['w-full']"
            ref="looker_select"
            @change="this.$refs['looker_select'].query = ''"
            filterable
            remote
            reserve-keyword
            :remote-method="(file) => search(file, 'user', 'looker')"
            :multiple="true"
            placeholder="Введите ФИО наблюдателя"
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.lookers_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Подписант оригинальной подписью</label>
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
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.signatory_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.signatory_id">{{errors.signatory_id}}</small>
      </el-col>
    </el-row>
    <el-row>
      <el-col :md="21">
        <label class=" mb-1 block">Содержание документа</label>
        <el-input
            v-model="contract.content"
            type="textarea"
            rows="4"
            :class="['w-full', {'border border-red-500' : errors.content}]"
            placeholder="Введите содержание документа"
            :disabled="isDisable"
        ></el-input>
        <small class="text-red-500" v-if="errors.content">{{errors.content}}</small>
      </el-col>
    </el-row>
  </pre-loader>
</template>

<script>
import {computed, inject, reactive, ref} from "vue";
import {SearchRepo, ContractRepo} from '@/repositories';
import preLoader from "@/components/pre_loader";

export default {
  name       : "main_data",
  components : {preLoader},
  props      : ['contract', 'errors', 'options_list', 'waiting_edit'],
  setup(props){

    const notify         = inject('notify');
    const user           = inject('user');
    const contractStatus = inject('contractStatus');

    const loading        = ref(false);

    const isDisable      = computed(() => {
      return !['contract_created', 'correction_primary_data'].includes(contractStatus.value) && (contractStatus.value !== 'correction_after_approval' && !props.waiting_edit) && !isAdmin;
    });

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
            props.options_list.lookers_list.length = 0;
            result.forEach(el => props.options_list.lookers_list.push(el));
            break;
          case 'signatory' :
            props.options_list.signatory_list.length = 0;
            result.forEach(el => props.options_list.signatory_list.push(el));
            break;
          case 'contragent' :
            props.options_list.contragent_list.length = 0;
            result.forEach(el => props.options_list.contragent_list.push(el));
            break;
          case 'organization' :
            props.options_list.organization_list.length = 0;
            result.forEach(el => props.options_list.organization_list.push(el));
            break;
        }

      } catch (e) {
        loading.value = false;
        notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
      }
    };

    const isAdmin        = user.roles.indexOf('admin') >= 0  ? true : false;

    async function getAdditionalData(){
      try{
        loading.value = true;
        let result = await ContractRepo.getAdditionalInfo({user_id : user.id});

        props.options_list.responsible_list.length = 0;
        props.options_list.responsible_list.push(result.data.responsible_list);

        props.options_list.company_type_list.length = 0;
        result.data.companyTypes.forEach(el => props.options_list.company_type_list.push({value : el.id, label : el.type}));

        props.options_list.contract_type_list.length = 0;
        result.data.contractTypes.forEach(el => props.options_list.contract_type_list.push({value : el.id, label : el.type}));

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Получение дополнительных данных для создания договора', message : e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    };
    getAdditionalData();

    return{
      loading, isDisable,

     search,
    }
  },
}
</script>

<style scoped>

</style>