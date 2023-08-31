<template>
    <el-timeline class="stagesusers">
        <el-timeline-item :timestamp="item.name" v-for="item, key in stages" :key="key" placement="top">
            <div v-for="block in item.blocks" :key="block.id + block.process_stage_id">
                <el-card v-if="stages_user[item.id] && stages_user[item.id][block.id]" class="mb-2">
                    <el-row class="row-bg mt-1" :gutter="20">
                        <el-col :span="24">
                            <el-table :data="stages_user[item.id][block.id]" border class="mb-2" style="width: 100%">
                                <el-table-column width="55">
                                <template #default="scope">
                                    <span class="userPhoto">
                                    <a :href="scope.row.user.link">
                                        <img :src="scope.row.user.photo" alt="фото"/>
                                    </a>
                                    </span>
                                </template>
                                </el-table-column>
                                <el-table-column prop="user_name" label="ФИО" width="350">
                                </el-table-column>
                                <el-table-column prop="result" label="Решение" width="150">
                                </el-table-column>
                                <el-table-column prop="last_comment" label="Последний комментарий">
                                </el-table-column>
                            </el-table>
                        </el-col>
                    </el-row>
                    <span>
                        Тип : {{ passing[block.passing] }}
                    </span>
                </el-card>
            </div>
        </el-timeline-item>
    </el-timeline>

    <el-row class="stop" v-if="process.user && process.user == user && process.stage_current">
        <el-dialog v-model="dialogVisible" title="Анулировать процесс" width="30%" :before-close="handleClose">
            <el-input v-model="stop_comment" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="Причина анулирования" />
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" class="save" @click="stopProcess()">
                        Сохранить
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <el-button @click="dialogVisible = true" v-if="full_access" class="stop-process-button mb-1">Аннулировать процесс</el-button>
    </el-row>
</template>

<script>
import moment from 'moment'
import { inject, ref, defineComponent } from 'vue';
import { req } from "@/process/global/index.js";
import { ElNotification } from 'element-plus'
moment.locale('ru')
export default defineComponent({
    setup() {

        let stages          = inject('stages');
        let passing         = inject('passing');
        let stages_user     = inject('stages_user');
        let process         = inject('process');
        let document_id     = inject('document_id');
        let process_id      = inject('process_id');
        let user            = inject('user');
        let startfn         = inject('startfn');
        let stop_comment    = ref('');
        let dialogVisible   = ref(false);
        let loading         = inject('loading');
        let full_access     = inject('full_access');

        let stopProcess = async () => {
            dialogVisible.value = false
            loading.value       = true;
            if (stop_comment.value && stop_comment.value != '') {

                let res = await req('/process/stop-process', {
                    document_id:    document_id,
                    process_id:     process_id,
                    user:           user,
                    comment:        stop_comment.value
                });

                if (res.status == 'success') {
                    loading.value = false;
                    startfn();
                }

                

            } else {
                loading.value = false;
                ElNotification({
                    title: "Ошибка",
                    message: "Не заполнена причина анулирования",
                    type: 'error',
                    duration: 4000,
                })

            }

        }

        let handleClose = async () => {
            dialogVisible.value = false
        }

        return { stages, stages_user, passing, process, user, stopProcess, stop_comment, dialogVisible, full_access, handleClose }
    }
})
</script>

<style scoped>
.save:hover {
    background: #3fddff !important;
}

ul.el-timeline.stagesusers {
    padding-left: 0;
}
.save {
    background: #3bc8f5 !important;
    border-color: #3bc8f5 !important;
    color: white !important;
    text-transform: uppercase;
}

.stop {
    display: inline-block;
    float: right;
}
</style>
