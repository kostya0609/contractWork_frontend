<template>
  <el-row class="mb-3">
    <el-col>

      <label :class="{'text-red-500' : element.errors}">
        {{element.label}}
      </label>

      <div v-if="element.multiple" class="mt-1">
        <el-upload
            v-model:file-list="element.list"
            drag
            ref="upload"
            action=""
            multiple
            :auto-upload="false"
            :on-change="changeFile"
            :on-remove="deleteBth"
            :on-preview = 'downLoadFile'
            :disabled="isDisable"
        >
          <div
              v-if="!isDisable"
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
              Изменять дополнительные файлы разрешается если договор имеет статус "На подготовке", "На корректировке первичных данных" или "На корректировке после согласования"
            </p>
          </div>
        </el-upload>
      </div>

      <div v-else class="mt-1">
        <div v-if="element.list.length === 0">
          <el-upload
              v-model:file-list="element.list"
              action=""
              ref="upload"
              :auto-upload="false"
              :limit = "1"
              :on-exceed="uploadBtn"
              :on-change="changeFile"
              :show-file-list="false"
              :disabled="isDisable"
          >
            <el-button
                class="uppercase blueButton w-full"
                :disabled="isDisable"
            >
              Загрузить
            </el-button>
          </el-upload>
          <small class="text-red-500" v-if="element.errors">{{element.errors}}</small>
        </div>
        <div class="grid lg:grid-cols-[90%_10%] md:grid-cols-[70%_10%] sm:grid-cols-[40%_10%] gap-1 mt-1" v-else>
          <el-button
              class="w-full"
              @click="downLoadFile(element.list[0])"
          >
            {{element.list[0].name}}
          </el-button>
          <el-button
              v-if="!isDisable"
              @click="deleteBth('', 'contract')"
              type="danger"
          >
            X
          </el-button>
        </div>
      </div>

    </el-col>
  </el-row>

</template>

<script>


import {inject, ref} from "vue";

export default {
  name  : "upload_file",
  props : ['isDisable', 'element'],

  setup(props){
    const downLoadFile = inject('downLoadFile');
    const notify       = inject('notify');

    const upload       = ref();

    const uploadBtn        = (files) => {
      upload.value.clearFiles();
      const new_file = files[0];
      new_file.uid = genFileId();
      upload.value.handleStart(new_file);
    };

    const deleteBth        = (file) => {
      if (props.element.multiple){
        props.element.id   = props.element.id.filter(el => el.id !== file.id);
        props.element.file = props.element.file.filter(el => el.name !== file.name);
      } else {
        props.element.list.length = 0;
        props.element.file.length = 0;
        props.element.id.length = 0;
      }
    };

    const changeFile       = (file) => {
      if (props.element.multiple){
        let newFilName = file.name;

        let err_there_is_file      = !!props.element.file.find(item =>
            newFilName === item.name
        );

        let err_there_is_file_save = !!props.element.id.find(item =>
            newFilName === `${item.name}.${item.type}`
        );

        if (!err_there_is_file && !err_there_is_file_save ){
          props.element.file.push(file);
        } else {
          notify({title : 'Ошибка добавления дополнительного файла', message : 'Файл с таким именем уже существует.', type : 'error', duration : 5000});
          setTimeout(() => {props.element.list.splice(props.element.list.length - 1 , 1)}, 0);
        };

      } else {
        props.element.file.push(file);
      }

    };

    return{
      upload,
      downLoadFile, uploadBtn, deleteBth, changeFile,
    }
  },

}
</script>

<style scoped>

</style>