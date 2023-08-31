<template>
  <detail_table :value="$attrs.value"/>
</template>

<script>
import detail_table from "@/components/detail_table";
export default {
  name       : "filesDetail",
  components : {detail_table}
}
</script>

<style scoped>

</style>