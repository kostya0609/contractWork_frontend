<template>
  <pre-loader
      :loading="loading"
  >
    <br/>
    <Grid
        :name="name"
        @gridReady="getData"
    />

<!--                <el-button @click="sendDefaultFilterData">-->
<!--                  Загрузить дефолтовый фильтр-->
<!--                </el-button>-->

  </pre-loader>
</template>

<script>
import preLoader from "@/components/pre_loader";
import {ref, inject, reactive, computed, provide} from "vue";
import initGrid from '@/vdg3/use/initGrid';
import Grid from '@/vdg3/components/grid.n.vue';
import  {ElMessageBox }  from 'element-plus';
import { useRouter } from 'vue-router';
import {ContractRepo, GridRepo} from "@/repositories";

export default {
  name       : "listNeedActionIndex",
  components : {Grid, preLoader},
  setup(){
    const notify       = inject('notify');

    const user         = inject('user');

    const router       = useRouter();

    const loading      = computed(() => { return dataGrid.loading });

    let gridsData      = inject('gridsData');

    const name         = ref('contractWorkNeedActionList');

    const content      = reactive({
      setting         : true,
      header          : {
        id                  : {
          name: 'Номер',
          width: 100,
          show: true,
          sort: 100,
          contentSort: 'desc'
        },
        status              : {
          name: 'Статус',
          width: 300,
          show: true,
          sort: 200,
          contentSort: 'asc'
        },
        contract_type       : {
          name: 'Тип договора',
          width: 300,
          show: true,
          sort: 300,
          contentSort: 'asc'
        },
        organization        : {
          name: 'Организация',
          width: 300,
          show: true,
          sort: 400,
          //contentSort: 'asc'
        },
        contract_direction  : {
          name: 'Направление',
          width: 300,
          show: true,
          sort: 500,
          //contentSort: 'asc'
        },
        contragent          : {
          name: 'Контрагент',
          width: 300,
          show: true,
          sort: 600,
          // contentSort: 'asc'
        },
        company_type        : {
          name: 'Вид правовой собственности',
          width: 300,
          show: true,
          sort: 700,
          contentSort: 'asc'
        },
        responsible         : {
          name: 'Инициатор',
          width: 300,
          show: true,
          sort: 800,
          // contentSort: 'asc'
        },
        recording           : {
          name: 'Регистратор',
          width: 300,
          show: true,
          sort: 900,
          // contentSort: 'asc'
        },
        lookers             : {
          name: 'Наблюдатели',
          width: 300,
          show: true,
          sort: 1000,
          //  contentSort: 'asc'
        },
        signatory           : {
          name: 'Подписант',
          width: 300,
          show: true,
          sort: 1100,
          //contentSort: 'asc'
        },
        date_created        : {
          name: 'Дата создания',
          width: 300,
          show: true,
          sort: 1200,
        },
      },
      context         : [
        {
          text: 'Перейти в договор',
          function: (e, row) => {
            router.push({name:'detailContract', params: { id: row.row.id[0].value}});
          }
        },
      ],
      pagination      : {
        show        : 'full',
        defaultSize : gridsData[name.value].paginationData.count,
        page        : gridsData[name.value].paginationData.page,
        changeSize  : function(value){
          gridsData[name.value].paginationData.count = value;
          getData();
        },
        changePage : function(value){
          gridsData[name.value].paginationData.page = value;
          getData();
        }
      },
      filter          : {
        profiles: [],
        show: true,
        showProfiles: true,
        showValue : gridsData[name.value].showValueFilter,
        activeProfile : gridsData[name.value].activeProfile,
        filter : function(filterData_new, showValueFilter_new, activeProfile_new){
          for (let prop of Object.getOwnPropertyNames(gridsData[name.value].filterData)) {
            delete gridsData[name.value].filterData[prop];
          }
          let normalFilter = {};
          for (let key in filterData_new){
            if ((filterData_new[key].type === 'number' || filterData_new[key].type === 'date')         && filterData_new[key].min)                normalFilter[key] = filterData_new[key];
            if ((filterData_new[key].type === 'list'   || filterData_new[key].type === 'searchList')   && filterData_new[key].value.length > 0 )  normalFilter[key] = filterData_new[key];
          };

          gridsData[name.value].showValueFilter = showValueFilter_new;

          Object.assign(gridsData[name.value].filterData, normalFilter);
          gridsData[name.value].activeProfile = activeProfile_new.value
          getData()
        },
        clear : function(data){
          for (let prop of Object.getOwnPropertyNames(gridsData[name.value].filterData)) {
            delete gridsData[name.value].filterData[prop];
          }
          gridsData[name.value].activeProfile.value =  null;
          getData();
        },
      },
      gridId          : null,
      networkSetting  : {
        domain: process.env.NODE_ENV == 'production' ? `${window.location.origin}/api` : 'http://localhost:8000',
        //domain: 'https://bitrix.bsi.local/api',
        module: 'contractWork',
        userId: user.id,
      },
      loading         : false,
      loadJson        : function (url, data) {
        return fetch(
            content.networkSetting.domain + url,
            {
              method: 'post',
              headers: {
                'Content-Type': 'application/json;charset=utf-8'
              },
              body: JSON.stringify(data, function (key, val) {
                return (typeof val === 'function') ? '' + val : val;
              })
            }
        ).then(res => {
          return new Promise((resolve, reject) => {
            if (!res.ok)
              throw new Error('Response server - status code ' + res.status);
            else {
              res.json().then(json => {
                resolve(json)
              }).catch(err => {
                reject(err);
              })
            }
          })
        }).catch(err => {
          return new Promise((resolve, reject) => {
            reject({status: 'error', message: 'Некорректный ответ сервера', system: err.message})
          })
        });
      },
      sortContent     : function (sortData_new) {
        Object.assign(gridsData[name.value].sortData, sortData_new);
        getData();
      },
    });
    const dataGrid     = initGrid(content);
    provide(name.value, dataGrid);

    async function getData(filter = gridsData[name.value].filterData, sort = gridsData[name.value].sortData){
      let gridElements = [];

      try {
        dataGrid.loading = true;
        let result = await ContractRepo.needActionList({
          count   : dataGrid.pagination.defaultSize,
          page    : dataGrid.pagination.page,
          filter  : filter,
          sort    : sort.name ? sort : {name : 'id', order : 'asc'} ,
          user_id : user.id,
        });

        gridElements              = result.data.grid_list;
        dataGrid.pagination.total = result.data.total;

        if(result.notify) notify(result.notify);

        dataGrid.methods.addElements(gridElements);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на полученние данных для таблицы договоров', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        dataGrid.loading = false;
      }

    };

    //ниже чтоб на бэк залить дефолтовый фильтр... надо выше раскоментить нужную кнопку
    async function sendDefaultFilterData() {
      //создаст моковый дефолтный фильтр. запустить один раз при разработке, чтоб он записался на бэк
      let defaultFilterData = {
        id                    : {
          show: true,
          type: 'number',
          name: 'Номер',
          min: '',
          max: '',
          operation: '=',
        },
        status                : {
          show: true,
          type: 'list',
          name: 'Статус',
          multiple: true,
          value: [],
          option: [
            {value: 'contract_created', label: 'На подготовке'},
            {value: 'manager_approval', label: 'На согласовании у руководителя'},
            {value: 'lawyer_check', label: 'На юридической проверке'},
            {value: 'correction_primary_data', label: 'На корректировке первичных данных'},
            {value: 'correction_after_approval', label: 'На корректировке после согласования'},
            {value: 'contract_internal_approval', label: 'На внутреннем согласовании условий договора'},
            {value: 'protocol_contragent_approval', label: 'На согласовании протокола с контрагентом'},
            {value: 'wait_contragent_answer', label: 'На ожидании обратной связи от контрагента'},
            {value: 'transfer_originals_to_lawyer', label: 'На передаче оригиналов юристу'},
            {value: 'contract_signing', label: 'На подписании договора'},
            {value: 'contract_active', label: 'Договор в действии'},
            {value: 'contract_cancel', label: 'Договор отменен'},
          ],
        },
        contract_type_id      : {
          show: true,
          type: 'list',
          name: 'Тип договора',
          multiple: true,
          value: [],
          option: [],
          focus : async function (){
            let result = await grid.loadJson('/contract-work/v1/contracts/get-contract-type', {});
            if (result.success === true && result.data) return result.data;
          },
        },
        organization_id       : {
          show: true,
          type: 'searchList',
          name: 'Организация',
          multiple: true,
          value: [],
          option: [],
          query: async function (data) {
            let result = await grid.loadJson('/contract-work/v1/search/organization', {
              q: data,
            });
            if (result.success == true) return result.data
          },
        },
        contract_direction_id : {
          show: true,
          type: 'list',
          name: 'Направление',
          multiple: true,
          value: [],
          option: [],
          focus : async function (){
            let result = await grid.loadJson('/contract-work/v1/contracts/get-contract-direction', {});
            if (result.success === true && result.data) return result.data;
          },
        },
        contragent_id         : {
          show: true,
          type: 'searchList',
          name: 'Контрагент',
          multiple: true,
          value: [],
          option: [],
          query: async function (data) {
            let result = await grid.loadJson('/contract-work/v1/search/contragent', {
              q: data,
            });
            if (result.success == true) return result.data
          },
        },
        company_type_id       : {
          show: true,
          type: 'list',
          name: 'Вид правовой собственности',
          multiple: true,
          value: [],
          option: [],
          focus : async function (){
            let result = await grid.loadJson('/contract-work/v1/contracts/get-company-type', {});
            if (result.success === true && result.data) return result.data;
          },
        },
        responsible_id        : {
          show: true,
          type: 'searchList',
          name: 'Инициатор',
          multiple: true,
          value: [],
          option: [],
          query: async function (data) {
            let result = await grid.loadJson('/contract-work/v1/search/user', {
              q: data,
            });
            if (result.success == true) return result.data
          },
        },
        signatory_id          : {
          show: true,
          type: 'searchList',
          name: 'Подписант',
          multiple: true,
          value: [],
          option: [],
          query: async function (data) {
            let result = await grid.loadJson('/contract-work/v1/search/user', {
              q: data,
            });
            if (result.success == true) return result.data
          },
        },
        created_at            : {
          show: true,
          type: 'date',
          name: 'Дата создания',
          min: '',
          max: '',
          operation: '=',
        },
      };

      try {
        loading.value = true;

        let result = await GridRepo.loadFilter({
          grid_name: name.value,
          module: dataGrid.networkSetting.module,
          data: {...defaultFilterData},
        });

        notify({title : 'Загрузка дефолтового фильтра', message : result.message, type : result.status});

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на загрузку дефолтового фильтра', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }
    }

    return{
      loading, name, router,
      getData, sendDefaultFilterData
    }
  },
}
</script>

<style scoped>

</style>