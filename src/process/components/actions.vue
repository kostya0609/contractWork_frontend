<template>
    <div v-if="showAction">
        <el-row class="ml-2 mb-2">
            <el-col :span="8">
                <el-card class="ml-1">
                    <template #header>
                        <div class="card-header">
                            Действие
                            <el-button class="button save" @click="action()">Сохранить</el-button>
                        </div>  
                    </template>  

                    <el-form :model="form" ref="elForm" :rules="rules">
                        <el-form-item label="" prop="value">
                            <el-select v-model="form.value" class="mb-0 fw" placeholder="Решение" size="large">
                                <el-option v-for="item in actions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    
                        <el-form-item label="" prop="textarea">
                            <el-input v-model="form.textarea" :autosize="{ minRows: 4, maxRows: 4 }" type="textarea" placeholder="Комментарий" />
                        </el-form-item>
                    </el-form>
                 
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import moment from 'moment'
moment.locale('ru')
import {
    req
} from "@/process/global/index.js";
import {
    inject,
    watchEffect,
    ref
} from 'vue';

export default {

    setup() {

        const form = ref({
            value: '',
            textarea: ''
        });

        const rules = ref({
            textarea: [
                { required: true, message: 'Комментарий обязателен', trigger: 'blur' },
            ],
            value: [
                { required: true, message: 'Выберите действие', trigger: 'blur' },
            ],
        });

        const elForm = ref(null);

        let current_id_stage_user = 0;
        let actions         = inject('actions');
        let document_id     = inject('document_id');
        let startfn         = inject('startfn');
        let data            = inject('data_notify');
        let process_id      = inject('process_id');
        var process         = inject('process');
        var user            = inject('user');
        let stages_user     = inject('stages_user');
        let textarea        = ref('');
        let showAction      = ref(false);
        let loading         = inject('loading');

        watchEffect(() => {
            let current_user;
            if(process.stage_current_users)
            if(current_user = process.stage_current_users.find(item=>item.user == user)){
                current_id_stage_user = current_user.id
                showAction.value = true
            }          
        })      
      
        const action = async () => {

            let item = actions.find(item=>item.key == form.value.value)
            
            if(item && item.comment){
                rules.value.textarea[0].required = 1;    
            } else if(!item) {
                rules.value.textarea[0].required = 1;
            } else {
                rules.value.textarea[0].required = 0;
            }
            

            elForm.value.validate(async (valid) => {

                if (valid) {

                    loading.value = true;

                    var res = await req('/process/action', {
                        user:                   user,
                        result:                 form.value.value,
                        comment:                form.value.textarea,
                        current_user_id:        current_id_stage_user,
                        process_document_id:    process.id,
                        process_id:             process_id,
                        document_id:            document_id,
                        data:                   data
                    });

                    if(res && res.status == 'success'){
                        form.value.value         = '';
                        form.value.textarea      = '';
                        showAction.value    = false
                        loading.value       = false;
                        startfn();
                    }

                    loading.value = false;

                } else {                    
                    return false;
                }

            });        

        }
         

        return {
            form, 
            elForm,
            rules,
            action,
            actions,
            process,
            textarea,
            stages_user,
            showAction
        };

     }
}
</script>
   
   
<style lang="css" scoped>
.save {
    background: #3bc8f5 !important;
    border-color: #3bc8f5 !important;
    color: white !important;
    text-transform: uppercase;
}
.save:hover {
    background: #3fddff !important;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* .statuses>>>.el-step__icon {
    margin-top: 0px;
}

.statuses>>>.el-step.is-simple .el-step__title {
    font-size: 13px;
    word-break: break-word !important;
} */
</style>
