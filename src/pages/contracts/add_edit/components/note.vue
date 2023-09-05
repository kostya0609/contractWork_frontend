<template>
  <pre-loader
      :loading="loading"
      class="mx-auto"
  >
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Преамбула, комментарий</label>
      </el-col>
      <el-col :md="14">
        <el-input
            v-model="note.comment"
            type="textarea"
            rows="4"
            :class="['w-full', {'border border-red-500' : errors.comment}]"
            placeholder="Введите содержание преамбулы / комментария"
            :disabled="isDisable"
        ></el-input>
        <small class="text-red-500" v-if="errors.comment">{{errors.comment}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Цель</label>
      </el-col>
      <el-col :md="14">
        <el-input
            v-model="note.aim"
            type="textarea"
            rows="4"
            :class="['w-full', {'border border-red-500' : errors.aim}]"
            placeholder="Введите содержание цель"
            :disabled="isDisable"
        ></el-input>
        <small class="text-red-500" v-if="errors.aim">{{errors.aim}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Держатель договора</label>
      </el-col>
      <el-col :md="14">
        <el-select
            v-model="note.holder_id"
            :class="['w-full', {'border border-red-500' : errors.holder_id}]"
            filterable
            remote
            reserve-keyword
            :remote-method="(query) => search(query, 'user', 'holder')"
            placeholder="Введите держателя договора"
            :disabled="isDisable"
        >
          <el-option
              v-for="item in options_list.holder_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.holder_id">{{errors.holder_id}}</small>
      </el-col>
    </el-row>
    <el-row class="mb-3 lg:mb-5">
      <el-col :md="7" class="mb-1">
        <label>Тип договора</label>
      </el-col>
      <el-col :md="14" >
        <el-select
            v-model="note.type"
            :class="['w-full', {'border border-red-500' : errors.type}]"
            placeholder="Выбрать тип договора"
            :disabled="isDisable"
        >
          <el-option
              v-for="item in type_list"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small class="text-red-500" v-if="errors.type">{{errors.type}}</small>
      </el-col>
    </el-row>
  </pre-loader>
</template>

<script>
import {computed, inject, ref, reactive} from "vue";

import preLoader from "@/components/pre_loader";
import {SearchRepo} from "@/repositories";

export default {
  name       : "note",
  components : {preLoader},
  props      : ['note', 'errors', 'waiting_edit', 'options_list'],
  setup(props){
    const notify         = inject('notify');
    const contractStatus = inject('contractStatus');
    const user           = inject('user');

    const loading        = ref(false);

    const isAdmin        = user.roles.indexOf('admin') >= 0  ? true : false;

    const isDisable      = computed(() => {
      return !['contract_created', 'correction_primary_data'].includes(contractStatus.value) && (contractStatus.value !== 'correction_after_approval' && !props.waiting_edit) && !isAdmin;
    });

    const type_list      = reactive([
      {value : 'profitable_type',    label : 'Доходный типой'},
      {value : 'profitable_no_type', label : 'Доходный не типой'},
      {value : 'expense_type',       label : 'Расходный типовой'},
      {value : 'expense_no_type',    label : 'Расходный не типовой'},
    ]);

    async function search(query, type, role){
      if (!query) return;

      try {
        loading.value = true;
        let result = '';

        if (type === 'user')
          result = await SearchRepo.searchUsers(query);

        loading.value = false;

        switch (role){
          case 'holder' :
            props.options_list.holder_list.length = 0;
            props.options_list.holder_list.push(... result)
            break;
        }

      } catch (e) {
        loading.value = false;
        notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
      }
    };

    return{
      loading, isDisable, type_list,
      search
    }
  },
}
</script>

<style scoped>

</style>