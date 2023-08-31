<template>
  <el-row>
    <el-col
      v-for="(side, idx) in Object.keys($attrs.files)"
      :key="idx+side"
      :md="12"
      class="lg:pr-10 md:pr-20 sm:pr-20"
    >
      <div class="lg:pr-5">
        <upload_file
          v-for="(name, idx) in Object.keys($attrs.files[side])"
          :key="idx+name"
          :element="$attrs.files[side][name]"
          :isDisable="isDisable"
        />
      </div>
    </el-col>
  </el-row>
</template>

<script>
import {computed, inject} from "vue";
import upload_file from '@/components/upload_file.vue'

export default {
  name       : "filesAddEdit",
  props      : ['waiting_edit'],
  components : {upload_file},
  setup(props){
    const contractStatus   = inject('contractStatus');
    const user             = inject('user')
    const isAdmin          = user.roles.indexOf('admin') >= 0  ? true : false;

    const isDisable        = computed(() => {
      return !['contract_created', 'correction_primary_data'].includes(contractStatus.value) && (contractStatus.value !== 'correction_after_approval' && !props.waiting_edit) && !isAdmin;
    });

    return {
      Object, isDisable
    }
  },
}
</script>

<style scoped>

</style>