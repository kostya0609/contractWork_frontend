<template>
  <div class="w-full">

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
          <el-icon class="el-icon--upload"><upload-filled/></el-icon>
          <div class="el-upload__text">
            Перенесите файл в эту область
          </div>
        </div>
        <div
            v-else
        >
          <p>
            Изменить нельзя"
          </p>
        </div>
      </el-upload>
    </div>

    <div v-else>

      <div v-if="element.list.length === 0" class="flex justify-end">
        <small class="text-red-500 mr-2" v-if="element.errors">{{element.errors}}</small>
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
              size="small"
              :disabled="isDisable"
          >
            <el-icon><Paperclip /></el-icon>
          </el-button>

        </el-upload>

      </div>

      <div v-else class="grid grid-cols-[14px_1fr_35.8px] gap-x-2 items-center mmm-class">
        <el-icon
          class="cursor-pointer"
          @click="downLoadFile(element.list[0])"
        ><Document /></el-icon>
        <span
          class="w-full !m-0 cursor-pointer text-sm text-slate-600"
          @click="downLoadFile(element.list[0])"
          style="overflow: hidden; text-overflow: ellipsis"
          :title="element.list[0].name"
        >
            {{element.list[0].name}}
          </span>
        <el-icon
          class="mmm-button"
          v-if="!isDisable"
          @click="deleteBth('', 'contract')"
        >
          <Close/>
        </el-icon>
      </div>
    </div>

  </div>

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