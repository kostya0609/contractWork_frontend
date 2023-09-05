<template>
  <pre-loader
    :loading="loading"
    class="mx-auto"
  >
    <el-row>
      <el-col
       v-for="(side, idx) in Object.keys($attrs.files)"
       :key="idx+side"
       :xl="12"
       class="lg:pr-10 md:pr-20 sm:pr-20"
      >
        <h3 class="font-bold text-base mb-3">{{!idx ? 'Основные' : 'Дополнительные'}} файлы</h3>

        <div class="lg:2xl-5 border-b !p-0">
          <div
            v-for="(name, idx) in Object.keys($attrs.files[side])"
            class="p-2 border-x border-t !m-0 !p-0"
            :key="idx+name"
          >
            <div class="grid grid-cols-2">
              <div class="border-r p-2 bg-slate-100">
                <label :class="[{'text-red-500' : $attrs.files[side][name].errors}, 'text-slate-600']">
                  {{$attrs.files[side][name].label}}
                </label>
              </div>
              <div class="flex items-center p-2">
                <upload_file
                  :element="$attrs.files[side][name]"
                  :isDisable="isDisable"
                />
              </div>
            </div>
          </div>
          <div
            v-if="idx"
            class="p-2 border-x border-t !m-0 !p-0"
          >
            <div class="grid grid-cols-2">
              <div class="border-r p-2 bg-slate-100">
                <label :class="['text-slate-600']">
                  Анкета оптового покупателя
                </label>
              </div>
              <div class="block p-2">
                <div
                    class="grid grid-cols-[1fr_35.8px] gap-x-2 items-center"
                    v-if="!credit_link && !isDisable"
                >
                  <el-input
                    v-model="credit_id"
                    v-on:keydown.enter="getCreditLink"
                    type="number"
                    placeholder="Введите ID"
                    class="w-full"
                  >
                  </el-input>

                  <div class="flex justify-center mmm-class">
                    <el-icon
                      class="mmm-search-button"
                      @click="getCreditLink"
                    >
                      <Search />
                    </el-icon>
                  </div>

                </div>

                <div
                  v-else
                  class="grid grid-cols-[1fr_35.8px] gap-x-2 items-center mmm-class"
                >
                  <el-link
                    v-if="credit_link"
                    class="mt-1 credit-link"
                    :underline="false"
                    :href="credit_link"
                    target="_blank"
                  >
                    Ссылка на кредитную заявку
                  </el-link>
                  <span v-else class="mt-1">
                    Нет ссылки
                  </span>

                  <el-icon
                    class="mmm-button"
                    v-if="!isDisable && credit_link"
                    @click="emit('set_link', '');"
                  >
                    <Close/>
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

  </pre-loader>

</template>

<script>
import {computed, inject, ref, watch} from "vue";
import preLoader from "@/components/pre_loader";
import {CreditRepo} from '@/repositories';
import upload_file from '@/components/upload_file.vue'

export default {
  name       : "filesAddEdit",
  props      : ['waiting_edit', 'credit_link'],
  emits      : ['set_link'],
  components : {upload_file, preLoader},
  setup(props, {emit}){
    const notify           = inject('notify');
    const contractStatus   = inject('contractStatus');
    const user             = inject('user')
    const isAdmin          = user.roles.indexOf('admin') >= 0  ? true : false;

    const loading          = ref(false);

    const credit_id        = ref('');

    const isDisable        = computed(() => {
      return !['contract_created', 'correction_primary_data'].includes(contractStatus.value) && (contractStatus.value !== 'correction_after_approval' && !props.waiting_edit) && !isAdmin;
    });

    const getCreditLink = async() => {
      if(!credit_id.value) return;
      try{
        loading.value = true;
        let result = await CreditRepo.get({id  :credit_id.value});

        if (result.data && result.data.link)
          emit('set_link', result.data.link)
            else emit('set_link', '')

        credit_id.value = '';

      } catch (e) {
         notify({title : `Ошибка в получение данных о кредитной заявке`, message : e.message, type : 'error', duration : 5000})
      } finally {
        loading.value = false;
      }
    }

    return {
      Object, isDisable, loading, credit_id, emit,
      getCreditLink
    }
  },
}
</script>

<style scoped>

</style>