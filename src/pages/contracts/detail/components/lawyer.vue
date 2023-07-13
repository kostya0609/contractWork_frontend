<template>
  <pre-loader
      :loading="loading"
  >
    <h4
        v-if="contractStatus === 'lawyer_check'"
        class="text-red-500"
    >
      Обратите внимание. После добавления комментария его невозможно будет изменить или удалить.
    </h4>

    <el-row class="mb-3">
      <el-col :md="24">
        <label class="font-bold block mb-1">Комментарии юриста</label>
        <el-table :data=value.data  border max-height="600" stripe>
          <el-table-column prop="FIO" label="ФИО специалиста" />
          <el-table-column prop="comment" label="Комментарий" />
          <el-table-column prop="files" label="Файлы">
            <template #default="scope">
              <div v-for="item in scope.row.files">
                <span v-html="item"></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="Дата" width="100" />
          <el-table-column v-if="isAdmin" label=""  width="65">
            <template #default="scope">
              <el-button
                  size="small"
                  type="danger"
                  @click="deleteComment(scope.$index, scope.row)"
              >
                <el-icon><CloseBold /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="contractStatus === 'lawyer_check' && (isLawyer || isAdmin)">
      <el-col :md="comment ? 11 : 12" class="lg:pr-5">
        <label class="font-bold block mb-1">Загрузить дополнительные файлы</label>
        <el-upload
            v-model:file-list="value.files.file_exists"
            drag
            ref="upload_lawyer_files"
            action=""
            multiple
            :auto-upload="false"
            :on-change="fileChange"
            :on-remove="fileRemove"
            :on-preview='downLoadFile'
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            При необходимости перенесите файл в эту область или <em>нажмите на иконку загрузки</em>
           </div>
        </el-upload>
      </el-col>

      <el-col :md="comment ? 10 : 12">
        <label class="font-bold block mb-1">Добавить новый комментарий</label>
        <el-input
            v-model="comment"
            type="textarea"
            rows="8"
            placeholder="Введите комментарий, поле обязательно к заполнению!"
        />
      </el-col>

      <el-col
          :md="!comment ? 0 : 3" align="right"
      >
        <label class="block mb-1"><br></label>

        <el-button
            v-if="comment"
            class="uppercase blueButton"
            @click="saveComment"
        >
          Добавить
        </el-button>
      </el-col>

    </el-row>

    <el-row v-if="contractStatus === 'lawyer_check' && (isLawyer || isAdmin)"
      class="justify-between mt-3"
    >

      <el-col :xs="13" :sm="11" :md="10" :lg="8" class="mb-3">
        <el-button
          class="uppercase blueButton w-full"
          @click="$emit('toApprove')"
        >
          Отправить на согласование
        </el-button>
      </el-col>

      <el-col :xs="13" :sm="11" :md="10" :lg="8"  align="right">
        <el-button
            type="danger"
            class="uppercase w-full"
            @click="toCorrect"
        >
          Вернуть на корректировку
        </el-button>
      </el-col>

    </el-row>

    <p v-if="contractStatus === 'lawyer_check'">Если необходимо вернуть договор на корректировку, то обязательно требуется добавить хотя бы один комментарий от текущей даты.</p>

  </pre-loader>
</template>

<script>
import preLoader from "@/components/pre_loader";
import { useRouter, useRoute } from 'vue-router';
import {inject, ref} from "vue";
import moment from 'moment';
import {ContractRepo, LawyerRepo, ProcessRepo} from '@/repositories';
import  {ElMessageBox }  from 'element-plus';

export default {
  name       : "lawyer",
  props      : ['value'],
  emits      : ['toApprove'],
  components : {preLoader},
  setup(props){
    const router         = useRouter();
    const route          = useRoute();

    const notify         = inject('notify');
    const contractStatus = inject('contractStatus');

    const user           = inject('user');
    const downLoadFile   = inject('downLoadFile');

    const loading        = ref(false);

    const comment        = ref('');

    const isAdmin        = user.roles.indexOf('admin') >= 0  ? true : false;

    const isLawyer       = user.roles.indexOf('lawyer') >= 0 ? true : false;

    function fileChange(file){
      let newFilName        = file.name;
      let err_there_is_file = !!props.value.files.file.find(item => newFilName === item.name);

      if (!err_there_is_file){
        props.value.files.file.push(file.raw);
      } else {
        notify({title : 'Ошибка добавления файла', message : 'Файл с таким именем уже существует.', type : 'error'});
        setTimeout(() => {props.value.files.file_exists.splice(props.value.files.file_exists.length - 1 , 1)}, 0);
      };
    };

    function fileRemove(file){
      props.value.files.file        = props.value.files.file.filter(el => el.name !== file.name);
    };

    async function saveComment(){

      let data = new FormData();
      data.append('user_id', user.id);
      data.append('contract_id', route.params.id);
      data.append('comment', comment.value);


      for(let i = 0; i < props.value.files.file.length; i++){
        data.append('files['+i+']', props.value.files.file[i]);
      }

      try {
        loading.value = true;

        let result = await LawyerRepo.addComment(data);

        props.value.data.push(
            {
              id      : result.data.comment_id,
              FIO     : user.FIO,
              comment : comment.value,
              date    : moment().format('DD.MM.YYYY'),
              files   : result.data.files,
            }
        );
        comment.value = '';

        props.value.files.file        = [];
        props.value.files.file_exists = [];

        if(result.notify) notify(result.notify);

      } catch (e) {
        notify({title : 'Ошибка при выполнении запроса на добавление комментария юриста', message :e.message, type : 'error', duration : 5000});
      }
      finally {
        loading.value = false;
      }

    };

    async function deleteComment(index, row){
      await ElMessageBox.confirm(`Вы уверены, что хотите удалить комментарий?`);
        try {
          loading.value = true;

          let result = await LawyerRepo.deleteComment({
            user_id     : user.id,
            comment_id  : row.id,
            contract_id : route.params.id
          });

          props.value.data.splice(index, 1);

          if(result.notify) notify(result.notify);

        } catch (e) {
            if(e !== 'cancel')
              notify({title : 'Ошибка при выполнении запроса на удаление комментария юриста', message :e.message, type : 'error', duration : 5000})

        } finally {
              loading.value = false;
        }
    }

    async function toCorrect(){

      let date = moment().format('DD.MM.YYYY');

      let fresh_comment = props.value.data.find(el => {return el.date == date});

      if(!fresh_comment){
        notify({title : 'Возврат на корректитровку', message : `Необходимо добавить хотя бы один комментарий с текущей датой ${date}`, type : 'error', duration : 5000});
        return;
      }
      await ElMessageBox.confirm(`Вы уверены, что хотите вернуть договор на корректировку?`)

      try {
        loading.value = true;

        let result = await ProcessRepo.deleteProcessDoc({
          process_document_id : route.params.id,
          module_name         : 'ContractWork',
          process_id          : [8],
        });

        result = await ContractRepo.changeStatus({
          user_id     : user.id,
          contract_id : route.params.id,
          status      : 'correction_primary_data',
        });

        contractStatus.value = 'correction_primary_data';

        if(result.notify) notify(result.notify);

      } catch (e) {
        if (e !== 'cancel')
          notify({title : 'Ошибка при выполнении запроса на возврат договора на коррестировку', message :e.message, type : 'error', duration : 5000});
      } finally {
        loading.value = false;
      }
    }

    return{
      loading, contractStatus, comment, isAdmin, isLawyer,
      fileChange, fileRemove, downLoadFile, saveComment,  deleteComment, toCorrect,
    }
  },
}
</script>

<style scoped>

</style>