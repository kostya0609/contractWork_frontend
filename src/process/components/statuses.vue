<template>

 <div class="statuses">
    <el-steps class="mb-3" :active="activeStatus"  finish-status="success" simple>        
          <el-step :title="item.name" v-for="item, key in statuses" :key="key"></el-step>
    </el-steps>
 </div>

</template>

<script>
import moment from 'moment'
moment.locale('ru')

import {inject, watch, ref} from 'vue';

export default {
  
    setup() {

      const statuses      = inject('statuses');
      let   process       = inject('process');      
      let   activeStatus  = ref(0);

      watch([process, statuses], () => {
        if(process.id && statuses.length>0 && process.status_current){
          activeStatus.value = statuses.findIndex(item=>item.id == process.status_current);
          if(statuses.length == activeStatus.value+1){
            ++activeStatus.value
          }
        } else {
          activeStatus.value = 0
        }
      })
      return {statuses, process, activeStatus};
    }
}
</script>

<style lang="css" scoped>
.statuses >>> .el-step__icon {
    margin-top: 0px;
}

.statuses >>> .el-step.is-simple .el-step__title {
    font-size: 13px;
    word-break: break-word!important;
}
</style>
