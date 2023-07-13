<template>
  <pre-loader
      :loading="loading"
  >
    <div class="flex justify-between pb-2">
      <h3>Добавление пользователя</h3>
      <returnButton class="no-print"/>
    </div>

    <el-row>
      <el-col :md="8" class="pr-4">
        <label class="font-bold block mb-1">Пользователь</label>
        <el-select
            v-model="newUser.user_id"
            :class="[ {'border border-red-500' : errors.user_id}, 'w-full']"
            style="width: 100%"
            filterable
            remote
            reserve-keyword
            :remote-method="(file) => search(file, 'user', 'user')"
            placeholder="Пользователь"
        >
          <el-option
              v-for="item in userList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.user_id" class="text-red-500">{{errors.user_id}}</small>
      </el-col>
      <el-col :md="12" class="pr-4">
        <label class="font-bold block mb-1">Роль</label>
        <el-select
            v-model="newUser.role_id"
            :class="[{'border border-red-500' : errors.role_id}, 'w-full']"
            placeholder="Установить"
        >
          <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
        <small v-if="errors.role_id" class="text-red-500">{{errors.role_id}}</small>
      </el-col>
    </el-row>
    <br/>
    <el-row v-if="isExtended">
      <el-col :md="8" class="pr-4">
        <label class="font-bold block mb-1">Тип</label>
        <el-select
            v-model="type"
            :class="['w-full']"
            placeholder="Отдел"
            @change="individualList.length = 0; individual = null; errors.individuals = null; departmentList.length = 0; department = null; errors.departments = null"
        >
          <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :md="12" class="pr-4">
        <template v-if="type === 'individual'">
          <label class="font-bold block mb-1">Сотрудник</label>
          <el-select
              v-model="individual"
              :class="[{'border border-red-500' : errors.individuals}, 'w-full']"
              filterable
              remote
              reserve-keyword
              :remote-method="(file) => search(file, 'user', 'individual')"
              placeholder="Сотрудник"
          >
            <el-option
                v-for="item in individualList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
          <small v-if="errors.individuals" class="text-red-500">{{errors.individuals}}</small>
        </template>
        <template v-else>
          <label class="font-bold block mb-1">Отдел</label>
          <el-select
              v-model="department"
              :class="[{'border border-red-500' : errors.departments}, 'w-full']"
              filterable
              remote
              reserve-keyword
              :remote-method="(file) => search(file, 'department', 'department')"
              placeholder="Отдел"
          >
            <el-option
                v-for="item in departmentList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
          </el-select>
          <small v-if="errors.departments" class="text-red-500">{{errors.departments}}</small>
        </template>

        <label class="font-bold block mb-1"><br/></label>
        <el-table
            :data="tableData"
        >
          <el-table-column  prop="name" label="ФИО сотрудника / название отдела"/>
          <el-table-column label="Действие" align="center" width="200">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="userDelete(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
              <el-switch
                  v-model="scope.row.full_access"
                  class="ml-4"
                  size="small"
                  active-text="full"
                  inactive-text="read"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :md="1">
        <label class="font-bold block mb-1"><br/></label>
        <el-button
            class="uppercase blueButton"
            @click="userAdd"
            :disabled="(!individual && type==='individual') || (!department && type==='department')"
        >
          +
        </el-button>
      </el-col>
    </el-row>
    <br/>
    <el-row>
      <el-col :xs="13" :sm="11" :md="10" :lg="8">
        <el-button
            class="uppercase blueButton w-full"
            @click="saveUser"
        >
          Сохранить
        </el-button>
      </el-col>
    </el-row>
  </pre-loader>

</template>
<script>
import preLoader from "@/components/pre_loader";
import returnButton from "@/components/return_button";
import {ref, inject, reactive, watchEffect, computed} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';
import {RolesRepo, SearchRepo} from "@/repositories";

export default {
  name       : "addUserIndex",
  components : {returnButton, preLoader},

  setup(){
    const router         = useRouter();
    const route          = useRoute();

    const notify         = inject('notify');

    const user           = inject('user');

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const loading        = ref(false);

    const type           = ref('individual');
    const typeList       = reactive([{value : 'individual', label : 'Сотрудник'},{value : 'department', label : 'Отдел'}]);


    const newUser        = reactive({
      user_id     : null,
      role_id     : null,
      departments : [],
      individuals : [],
    });
    const errors         = reactive({
      user_id       : null,
      role_id       : null,
      departments   : null,
      individuals   : null,
    });

    const userList       = reactive([]);
    const roleList       = reactive([]);

    const department     = ref(null);
    const departmentList = reactive([]);

    const individual     = ref(null);
    const individualList = reactive([]);

    const tableData      = reactive([]);

    async function search(query, type, role){
      if (!query) return;

      try {
        loading.value = true;
        let result = '';

        if (type === 'user')
          result = await SearchRepo.searchUsers(query);

        if (type === 'department')
          result = await SearchRepo.searchDepartment(query);

        switch (role){
          case 'user' :
            userList.length = 0;
            result.forEach(el => userList.push(el));
            break;
          case 'department' :
            departmentList.length = 0;
            result.forEach(el => departmentList.push(el));
            break;
          case 'individual' :
            individualList.length = 0;
            result.forEach(el => individualList.push(el));
            break;
        }

      } catch (e) {
          notify({title : 'Ошибка при выполнении запроса поиска', message : e.message, type : 'error'});
      } finally {
        loading.value = false;
      }
    };

    async function getData(){
      try {
        loading.value = true;

        let result = await RolesRepo.get({});

        roleList.length = 0;
        result.data.forEach(el => {roleList.push(el)})

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на получение списка ролей', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }
    };
    getData();

    function userAdd(){
      let name = null;
      if(type.value == 'individual'){
        individualList.forEach(el => {
          el.value === individual.value ? name = el.label : '';
        })
      } else {
        departmentList.forEach(el => {
          el.value === department.value ? name = el.label : '';
        })
      }

      let entity_id = type.value == 'individual' ? individual.value : department.value;

      if (!tableData.find(el => (el.entity_id == entity_id && el.type == type.value))) {

        tableData.push({name, type : type.value, entity_id, full_access : false});

        if(type.value == 'individual'){
          individualList.length = 0;
          individual.value = null;
        } else {
          departmentList.length = 0;
          department.value = null;
        }

      } else notify(`Добавление ${type.value == 'individual' ? 'сотрудника' : 'отдела'}`, `Данный ${type.value == 'individual' ? 'сотрудник' : 'отдел'}  был добавлен ранее`, 'error');

    };

    function userDelete(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить ${type.value == 'individual' ? 'сотрудника' : 'отдел'} ${row.name} ?`)
          .then(() => {
            tableData.splice(index,1);
          })
          .catch(() => {})
    };

    function isValid(){
      let valid = true;
      if (!newUser.user_id)                                                           {errors.user_id     = 'Необходимо выбрать пользователя'; valid = false};
      if (!newUser.role_id)                                                           {errors.role_id     = 'Необходимо выбрать роль';         valid = false};
      if (isExtended.value && type.value === 'individual' && tableData.length === 0)  {errors.individuals = 'Необходимо добавить сотрудника';  valid = false};
      if (isExtended.value && type.value === 'department' && tableData.length === 0)  {errors.departments = 'Необходимо добавить отдел';       valid = false};
      return valid
    };

    async function saveUser(){
      if (!isValid()) return;

      try {
        loading.value = true;

        let result = await RolesRepo.add({...newUser});

        if (isExtended.value){
          tableData.forEach(el => el.type === 'individual' ?
            newUser.individuals.push({entity_id: el.entity_id, full_access: el.full_access}) :
            newUser.departments.push({entity_id: el.entity_id, full_access: el.full_access})
          );

          await RolesRepo.additionalSet({
            user_id     : user.id,
            client_id   : newUser.user_id,
            individuals : newUser.individuals,
            departments : newUser.departments,
          });
        }

        let page = null;
        roleList.forEach(el => {
          if (el.value == newUser.role_id) {
            page = el.name
          }
        })

        page === 'additional' ? page = 'extended' : ''

        router.push({name: 'listUsers', params : {page}});

     if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на добавление нового пользователя', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }
    };

    let isExtended = computed(() => {
      let isExtended = false
      roleList.forEach(el => {
        if(el.value === newUser.role_id){ el.name === 'additional' ? isExtended = true : isExtended = false};
      })
      return isExtended;
    });

    watchEffect(() => {
      newUser.user_id  ? errors.user_id     = null : '';
      newUser.role_id  ? errors.role_id     = null : '';
      if (tableData.length) {errors.departments = null; errors.individuals = null};

    });

    return{
      loading, newUser, errors, roleList, userList, type, typeList, department, departmentList,individual,
      individualList, tableData,
      saveUser, isExtended, userAdd, userDelete, search
    }
  }
}
</script>