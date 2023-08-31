<template>
  <pre-loader
      :loading="loading"
  >
    <br/>
    <el-tabs type="border-card" v-model="page">
      <el-tab-pane label="Администраторы" name="admin">
        <el-row>
          <el-col :span="8">
            <el-table
                :data="tableData_admin"
            >
              <el-table-column  prop="name" label="ФИО"/>
              <el-table-column  label=""  width="60">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='admin' )"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Юристы" name="lawyer">
        <el-row>
          <el-col :span="8">
            <el-table
                :data="tableData_lawyer"
            >
              <el-table-column  prop="name" label="ФИО"/>
              <el-table-column  label=""  width="60">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='lawyer' )"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Расширенные права" name="extended">
        <el-row>
          <el-col :span="20">
            <el-table
                :data="tableData_extended"
                border
            >
              <el-table-column  prop="name" label="ФИО" />
              <el-table-column  label="Сотрудники/Отделы" >
                <template #default="scope">
                  <p  v-for="item in scope.row.individuals" class="m-0">
                    <span>{{item.name}} - {{item.full_access == 1 ? 'полный доступ' : 'только чтение'}}</span>
                  </p>
                  <p  v-for="item in scope.row.departments" class="m-0">
                    <span>{{item.name}} - {{item.full_access == 1 ? 'полный доступ' : 'только чтение'}}</span>
                  </p>

                </template>
              </el-table-column>
              <el-table-column  label="Действие" width="110">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="info"
                      @click="userEdit(scope.$index, scope.row)"
                  >
                    <el-icon><Tools /></el-icon>
                  </el-button>
                  <el-button
                      size="small"
                      type="danger"
                      @click="userDelete(scope.$index, scope.row, userType='extended')"
                  >
                    <el-icon><CloseBold /></el-icon>
                  </el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </pre-loader>
</template>
<script>

import preLoader from "@/components/pre_loader";
import {ref, inject, reactive} from "vue";
import { useRouter, useRoute } from 'vue-router';
import  {ElMessageBox }  from 'element-plus';
import {RolesRepo} from "@/repositories";

export default {
  name       : "listUsersIndex",
  components : {preLoader},

  setup(props){
    const router           = useRouter();
    const route            = useRoute();

    const notify           = inject('notify');

    const user             = inject('user');

    user.roles.indexOf('admin') >= 0 ? '' : router.push({name : 'listTasks'});

    const loading          = ref(false);
    const page             = ref(route.params.page ? route.params.page : 'admin');

    let userType           = null;

    const tableData_admin    = reactive([]);
    const tableData_lawyer   = reactive([]);
    const tableData_extended = reactive([]);

    function userEdit(index, row){
      router.push({name:'userEdit', params: {id: row.user_id, role_id : row.role_id}});
    };

    async function userDelete(index, row, userType){
      let map = {admin : 'администратора', extended : 'расширнные права', lawyer : 'юриста'};

      await ElMessageBox.confirm(`Вы уверены, что хотите удалить ${map[userType]} ${row.name} ?`)

      try {
        loading.value = true;

        let result = await RolesRepo.delete({user_id : row.user_id, role_id : row.role_id});

        userType === 'admin'    ?  tableData_admin.splice(index,1)    : '';
        userType === 'lawyer'   ?  tableData_lawyer.splice(index,1)   : '';
        userType === 'extended' ?  tableData_extended.splice(index,1) : '';

        if(result.notify) notify(result.notify);

      } catch (e) {
          if (e !== 'cancel')
            notify({title : 'Ошибка при выполнении запроса на удаление пользователя', message :e.message, type : 'error', duration : 5000});
      } finally {
          loading.value = false;
      }
    };

    async function getData(){
      try {
        loading.value = true;

        let result = await RolesRepo.list({});

        tableData_admin.length = 0;
        result.data.admin.forEach(el => {tableData_admin.push(el)});

        tableData_extended.length = 0;
        result.data.additional.forEach(el => {tableData_extended.push(el)});

        tableData_lawyer.length = 0;
        result.data.lawyer.forEach(el => {tableData_lawyer.push(el)});

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на получение списка пользователей', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }
    };
    getData()

    return{
      loading, page, tableData_admin, tableData_lawyer, userType, tableData_extended,
      userDelete, userEdit
    }
  }
}
</script>