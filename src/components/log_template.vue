<template>
  <el-table :data="history" stripe  class="logs-table" height="500" :show-header="false">
    <el-table-column prop="date" width="140"
    >
      <template #default="scope">
        {{formatDate(scope.row.date)}}
      </template>
    </el-table-column>
    <el-table-column prop="event">
      <template #default="scope">
        {{(scope.row.event)}}
        <br/> {{scope.row.comment}}
      </template>
    </el-table-column>
    <el-table-column width="70">
      <template #default="scope">
            <span class="userPhoto">
              <a :href="scope.row.user.link">
                <img :src="scope.row.user.photo" alt="фото"/>
              </a>
            </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import moment from "moment";

export default {
  name  : "log_template",
  props : ['history'],
  setup(){

    function formatDate(date){
      return moment(date).format('DD.MM.YYYY  HH:mm');
    }
    return{
      formatDate,

    }
  }
}
</script>

<style scoped>

</style>