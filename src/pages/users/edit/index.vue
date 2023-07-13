<template>
  <pre-loader
      :loading="loading"
  >
    <div class="flex justify-between pb-2">
      <h3>Редактирование пользователя</h3>
      <returnButton class="no-print"/>
    </div>

    <p class="mt-0">ФИО - {{editUserName}}, роль - {{roleName}}</p>

    <el-row>
      <el-col :md="12" class="pr-4">
        <label class="font-bold block mb-1">Тип</label>
        <el-select
            v-model="type"
            :class="['w-full']"
            placeholder="Отдел"
            @change="individualList.length = 0; individual = null; departmentList.length = 0; department = null"
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
    </el-row>
    <br/>

    <el-row>
      <el-col :md="12" class="pr-4">
        <template v-if="type === 'individual'">
          <label class="font-bold block mb-1">Сотрудник</label>
          <el-select
              v-model="individual"
              class="w-full"
              filterable
              remote
              reserve-keyword
              :remote-method="(file) => search(file, 'user')"
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
        </template>
        <template v-else>
          <label class="font-bold block mb-1">Отдел</label>
          <el-select
              v-model="department"
              class="w-full"
              filterable
              remote
              reserve-keyword
              :remote-method="(file) => search(file, 'department')"
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
        </template>
        <label class="font-bold block mb-1"><br/></label>
        <el-table
            :data="tableData"
        >
          <el-table-column  prop="name" label="Название отдела"/>
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
                  class="ml-1"
                  size="small"
                  active-text="full"
                  inactive-text="read"
                  :active-value="1"
                  :inactive-value="0"

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
        >
          +
        </el-button>
      </el-col>
    </el-row>
    <br/>

    <el-row>
      <el-col :md="5">
        <el-button
            class="uppercase blueButton w-full"
            @click="saveUser"
            :disabled="tableData.length == 0"
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
import {useRoute, useRouter} from "vue-router";
import {inject, reactive, ref} from "vue";
import {ElMessageBox} from "element-plus";
import {RolesRepo, SearchRepo} from "@/repositories";

export default {
  name       : "userEditIndex",
  components : {returnButton, preLoader},
  setup(){
    const notify          = inject('notify');
    const user            = inject('user');

    const router          = useRouter();
    const loading         = ref(false);

    const tableData       = reactive([]);

    const type            = ref('individual');
    const typeList        = reactive([{value : 'individual', label : 'Сотрудник'},{value : 'department', label : 'Отдел'}]);

    const department     = ref(null) //выбранное значение в select
    const departments    = reactive([]);// актуальный сохраненный список отделов с которым работаем
    const departmentList = reactive([]);// список после поиска для select

    const individual     = ref(null);
    const individuals    = reactive([]);
    const individualList = reactive([]);

    const roleName       = ref(null);
    const editUserName   = ref(null);

    const route          = useRoute();

    async function search(query, type){
      if (!query) return;

      try {
        loading.value = true;
        let result = '';

        if (type === 'user'){
          result = await SearchRepo.searchUsers(query);
          individualList.length = 0;
          result.forEach(el => individualList.push(el));
        }

        if (type === 'department'){
          result = await SearchRepo.searchDepartment(query);
          departmentList.length = 0;
          result.forEach(el => departmentList.push(el));
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
        result.data.forEach(el => {
          el.value == route.params.role_id ? roleName.value = el.label : '';
        });

        result = await RolesRepo.additionalGet({
          user_id   : user.id,
          client_id : route.params.id,
        });

        if (result.data){
          result.data.name ? editUserName.value = result.data.name : '';

          result.data.departments ? result.data.departments.forEach(el => tableData.push({
            name        : el.name,
            entity_id   : el.id,
            full_access : el.full_access,
            type        : 'department'
          })) : '';

          result.data.individuals ? result.data.individuals.forEach(el => tableData.push({
            name        : el.name,
            entity_id   : el.id,
            full_access : el.full_access,
            type        : 'individual'
          })) : '';
        }

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

      } else notify({title : `Добавление ${type.value == 'individual' ? 'сотрудника' : 'отдела'}`, message : `Данный ${type.value == 'individual' ? 'сотрудник' : 'отдел'}  был добавлен ранее`, type : 'error'});

    };

    function userDelete(index, row){
      ElMessageBox.confirm(`Вы уверены, что хотите удалить ${type.value == 'individual' ? 'сотрудника' : 'отдел'} ${row.name} ?`)
          .then(() => {
            tableData.splice(index,1);
          })
          .catch(() => {})
    };

    async function saveUser(){
      try {
        loading.value = true;
        let individuals = [], departments = [];

        tableData.forEach(el => el.type == 'individual' ?
            individuals.push({entity_id : el.entity_id, full_access : el.full_access}) :
            departments.push({entity_id : el.entity_id, full_access : el.full_access})
        );

        let result = await RolesRepo.additionalSet({
          user_id   : user.id,
          client_id : route.params.id,
          role_id   : route.params.role_id,
          individuals,
          departments
        });

        router.push({name: 'listUsers', params : {page : 'extended'}});

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на изменение прав пользователя', message :e.message, type : 'error', duration : 5000})
      }
      finally {
        loading.value = false;
      }
    };

    return{
      route, roleName, type, typeList, individual, individuals, individualList, department, departments, departmentList,
      tableData, loading, editUserName,
      search, saveUser, userAdd, userDelete,
    }
  },
}
</script>

<style scoped>

</style>