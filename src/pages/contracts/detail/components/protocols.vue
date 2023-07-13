<template>
  <pre-loader
      :loading="loading"
  >

    <el-row class="mb-3">
      <el-col :md="24">
        <label class="font-bold block mb-1">Протоколы разногласий</label>
        <el-table :data=value.data  border max-height="600" stripe>
          <el-table-column prop="version" label="Версия протокола" width="175"/>
          <el-table-column prop="FIO" label="ФИО специалиста" />
          <el-table-column prop="comment" label="Комментарий"/>
          <el-table-column prop="files" label="Файл">
            <template #default="scope">
              <div v-for="item in scope.row.files">
                <span v-html="item"></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="Дата" width="100"/>
          <el-table-column v-if="isAdmin" label=""  width="65">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteProtocol(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="contractStatus === 'correction_after_approval' && !waiting_edit && (isLawyer || isAdmin)">
      <el-col :md="value.files.file.length > 0 ? 10 : 12" class="lg:pr-5">
        <label class="font-bold block mb-1">Загрузить протокол разногласий</label>
        <el-upload
            v-model:file-list="value.files.file_exists"
            drag
            ref="upload_protocol_files"
            action=""
            multiple
            :auto-upload="false"
            :limit="1"
            :on-exceed="fileExceed"

            :on-change="fileChange"
            :on-remove="fileRemove"
            :on-preview='downLoadFile'
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Обязательное поле! Перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
          </div>
        </el-upload>
      </el-col>

      <el-col :md="value.files.file.length > 0 ? 11 : 12">
        <label class="font-bold block mb-1">Добавить комментарий</label>
        <el-input
            v-model="comment"
            type="textarea"
            rows="8"
            placeholder="Введите комментарий, если необходимо"
        />
      </el-col>

      <el-col
          :md="!value.files.file.length > 0 ? 0 : 3" align="right"
      >
        <label class="block mb-1"><br></label>

        <el-button
            v-if="value.files.file.length > 0"
            class="uppercase blueButton"
            @click="saveProtocol"
        >
          Добавить
        </el-button>
      </el-col>

    </el-row>

    <el-row v-if="contractStatus === 'correction_after_approval' && !waiting_edit && (isLawyer || isAdmin)"
      class="justify-between mt-3"
    >

      <el-col :xs="13" :sm="11" :md="10" :lg="8" class="mb-3">
        <el-button
            class="uppercase blueButton w-full"
            @click="toApprove"
        >
          Отправить на согласование
        </el-button>
      </el-col>

    </el-row>

    <el-row v-if="contractStatus === 'protocol_contragent_approval' && !isLawyer"
      class="justify-between mt-3"
    >

      <el-col :xs="13" :sm="11" :md="10" :lg="8" class="mb-3">
        <el-button
            class="uppercase blueButton w-full"
            @click="toContragent"
        >
          Отправить контрагенту
        </el-button>
      </el-col>

    </el-row>

    <el-row v-if="contractStatus === 'wait_contragent_answer' && !isLawyer"
      class="justify-between mt-3"
    >

      <el-col :xs="13" :sm="11" :md="10" :lg="8" class="mb-3">
        <el-button
            class="uppercase blueButton w-full"
            @click="transferDocumentLawyer"
        >
          Контрагент согласовал
        </el-button>
      </el-col>

      <el-col :xs="13" :sm="11" :md="10" :lg="8"  align="right">
        <el-button
            type="danger"
            class="uppercase w-full"
            @click="toCorrect"
        >
          Контрагент не согласовал
        </el-button>
      </el-col>

    </el-row>

    <p v-if="contractStatus === 'correction_after_approval'">Если необходимо отправить на согласование, то обязательно требуется добавить хотя бы один протокол разногласий от текущей даты.</p>
  </pre-loader>
</template>

<script>
import preLoader from "@/components/pre_loader";
import { useRouter, useRoute } from 'vue-router';
import {inject, ref} from "vue";
import  {ElMessageBox }  from 'element-plus';
import {ContractRepo, ProcessRepo, ProtocolsRepo} from "@/repositories";
import moment from "moment";
import { genFileId } from 'element-plus'

export default {
  name       : "protocols",
  props      : ['value'],
  emits      : ['toApprove'],
  components : {preLoader},
  setup(props, {emit}){
    const router         = useRouter();
    const route          = useRoute();

    const notify         = inject('notify');
    const contractStatus = inject('contractStatus');
    const full_access    = inject('full_access');

    const user           = inject('user');
    const downLoadFile   = inject('downLoadFile');
    const count_protocols= inject('count_protocols');
    const waiting_edit   = inject('waiting_edit');

    const loading        = ref(false);

    const comment        = ref('');

    const upload_protocol_files = ref();

    const isAdmin        = user.roles.indexOf('admin') >= 0  ? true : false;

    const isLawyer       = user.roles.indexOf('lawyer') >= 0 ? true : false;

    const fileExceed = (files) => {
      upload_protocol_files.value.clearFiles();
      const file = files[0];
      file.uid   = genFileId();
      upload_protocol_files.value.handleStart(file);

    };

    function fileChange(file){
      props.value.files.file.length = 0;
      props.value.files.file.push(file.raw);
    };

    function fileRemove(file){
      props.value.files.file = props.value.files.file.filter(el => el.name !== file.name);
    };

    async function saveProtocol(){

      let data = new FormData();
      data.append('user_id', user.id);
      data.append('contract_id', route.params.id);
      data.append('comment', comment.value);

      for(let i = 0; i < props.value.files.file.length; i++){
        data.append('files['+i+']', props.value.files.file[i]);
      }

      try {
        loading.value = true;

        let result = await ProtocolsRepo.addProtocol(data);

        props.value.data.push(
            {
              id      : result.data.comment_id,
              version : result.data.version,
              FIO     : user.FIO,
              comment : comment.value,
              date    : moment().format('DD.MM.YYYY'),
              files   : result.data.files,
            }
        );

        count_protocols.value = props.value.data.length;

        comment.value = '';

        props.value.files.file        = [];
        props.value.files.file_exists = [];

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на добавление протокола разногласий', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }

    };

    async function deleteProtocol(index, row){
      await ElMessageBox.confirm(`Вы уверены, что хотите удалить протокол разногласий номер - ${row.version}?`)

      try {
        loading.value = true;
        let result = await ProtocolsRepo.deleteProtocol({
          user_id     : user.id,
          protocol_id : row.id,
          contract_id : route.params.id
        });


        props.value.data.splice(index, 1);

        count_protocols.value = props.value.data.length;

        if(result.notify) notify(result.notify);

      } catch (e) {
          if (e !== 'cancel')
            notify({title : 'Ошибка при выполнении запроса на удаление протокола разногласий', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }

    }

    async function toContragent(){
      await ElMessageBox.confirm(`Вы уверены, что хотите отправить документ контрагенту?`)
      try {
        loading.value = true;

        let result = await ContractRepo.changeStatus({
          user_id     : user.id,
          contract_id : route.params.id,
          status      : 'wait_contragent_answer',
        });

        contractStatus.value = 'wait_contragent_answer';

        if(result.notify) notify(result.notify);

      } catch (e) {
        if (e !== 'cancel')
          notify({title : 'Ошибка при выполнении запроса на отправку документа контрагенту', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    }

    async function transferDocumentLawyer(){
      await ElMessageBox.confirm(`Вы уверены, что хотите передать оригиналы документов юристу?`)
      try {
        loading.value = true;

        let result = await ContractRepo.changeStatus({
          user_id     : user.id,
          contract_id : route.params.id,
          status      : 'transfer_originals_to_lawyer',
        });

        contractStatus.value = 'transfer_originals_to_lawyer';

        if(result.notify) notify(result.notify);

      } catch (e) {
        if (e !== 'cancel')
          notify({title : 'Ошибка при выполнении запроса на передачу оригиналов документов юристу', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    }

    function toApprove(){
      let date = moment().format('DD.MM.YYYY');

      let fresh_protocol = props.value.data.find(el => {return el.date == date});

      if(!fresh_protocol){
        notify({title : 'Возврат на корректитровку', message : `Необходимо добавить хотя бы один протокол разногласий с текущей датой ${date}`, type : 'error', duration : 5000});
        return;
      }

      ElMessageBox.confirm(`Вы уверены, что хотите отправить договор на согласование?`)
          .then(() => {
            full_access.value = 1;
            emit('toApprove');
          })
          .catch(() => {})

    };

    async function toCorrect(){

      await ElMessageBox.confirm(`Вы уверены, что хотите вернуть договор на корректировку, так как контрагент его не согласовал?`)

      try {
        loading.value = true;

        let result = await ProcessRepo.deleteProcessDoc({
          process_document_id : route.params.id,
          module_name         : 'ContractWork',
          process_id          : [9],
        });

        result = await ContractRepo.changeStatus({
          user_id      : user.id,
          contract_id  : route.params.id,
          status       : 'correction_after_approval',
          waiting_edit : 1,
        });

        contractStatus.value = 'correction_after_approval';

        waiting_edit.value = 1;

        if(result.notify) notify(result.notify);

      } catch (e) {
        if (e !== 'cancel')
          notify({title : 'Ошибка при выполнении запроса на возврат договора на коррестировку', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    }

    return{
      loading, contractStatus, comment, upload_protocol_files, isLawyer, isAdmin, waiting_edit,
      fileRemove, fileChange, fileExceed, downLoadFile, saveProtocol, deleteProtocol, toContragent,
      transferDocumentLawyer, toApprove, toCorrect,
    }
  },
}
</script>

<style scoped>

</style>