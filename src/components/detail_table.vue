<template>
  <el-table
    :data="value"
    border
    max-height="600"
    stripe
    scrollbar-always-on
    :show-header="false"
  >
    <el-table-column prop="name" />
    <el-table-column>
      <template #default="scope">
        <div v-for="item in scope.row.value">
          <span v-html="item"></span>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name  : "detail_table",
  props : ['value'],
}
</script>

<style scoped>

</style>