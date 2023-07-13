<template>
    <div class="bp">
        <div class="title mb-2">
            {{name}} <span v-if="process && process.user_name">({{ process.user_name }} - {{ process.user_department }})</span>
            <template v-for="title, index in subtitle" :key="index">
                <div class="subtitle">{{title}}</div>
            </template>
        </div>
        <Status />
        <StagesUsers v-if="!process.id" />
        <StagesUserStatus v-if="process.id" />
        <Actions v-if="process.id" />
    </div>
</template>
  
<script>

import {
    reactive,
    provide,
    onMounted,
    inject,
    ref
} from 'vue';

import {
    req
} from "@/process/global/index.js";

import Status from './components/statuses.vue'
import StagesUsers from './components/stagesusers.vue'
import StagesUserStatus from './components/stagesusersstatus.vue'
import Actions from './components/actions.vue'

export default {
    props: [
        'config',
        'process_id',
        'document_id',
        'user',
        'data'
    ],
    setup(props, {
        emit
    }) {

        provide('data_notify',  props.config.data_notify);
        provide('process_id',   props.config.process_id);
        provide('document_id',  props.config.document_id);
        provide('user',         props.config.user);
        provide('subtitle',     props.config.subtitle);
        provide('full_access',  props.config.full_access);
        let subtitle            = props.config.subtitle;
        let process             = reactive({});
        let stages_user         = reactive({});
        let statuses            = reactive([]);
        let stages              = reactive([]);
        let actions             = reactive([]);
        let stages_all_users    = reactive({});
        let name                = ref('');
        let passing = {
            consistent: "Последовательный",
            parallel: "Паралельный",
            custom: "Свой",
            once:"Один из"
        };

        provide('stages_all_users', stages_all_users);
        provide('passing',          passing);
        provide('process',          process);
        provide('statuses',         statuses);
        provide('actions',          actions);
        provide('stages',           stages);
        provide('stages_user',      stages_user);
        
        const loading = inject('loading');

        async function startfn() {

            var res = await req('/process/get-process-doc', {
                document_id: props.config.document_id,
                process_id: props.config.process_id
            });

            if (res.status == 'success') {

                for (let prop of Object.getOwnPropertyNames(process)) {
                    delete process[prop];
                }

                Object.assign(process, res.data);

                if(res.name)
                name.value = res.name

                emit("process", process);
                
                if (process.id) {

                    var res = await req('/process/get-stages-actions', {
                        stage_id: process.stage_current
                    });

                    if (res.status == 'success') { 
                        
                        actions.length = 0;

                        res.data.forEach(el => {
                            actions.push({
                                key:el.id,
                                label:el.name,
                                value:el.id,
                                comment:el.comment
                            })
                        })
                    }
                }

            }

            var res1 = await req('/process/get-statuses', {
                id: props.id,
                process_id: props.config.process_id
            });

            if (res1.status == 'success') {
                statuses.length = 0;
                res1.data.forEach(el => {
                    statuses.push(el)
                })
                
            }

            var res2 = await req('/process/get-stages', {
                id: props.id,
                process_id: props.config.process_id
            });

            if (res2.status == 'success') {
                stages.length = 0;
                res2.data.forEach(el => {
                    stages.push(el)
                })
            }

            var res3 = await req('/process/get-stages-user', {
                document_id:props.config.document_id,
                process_id:props.config.process_id
            });

            if (res3.status == 'success') {

                for (let prop of Object.getOwnPropertyNames(stages_user)) {
                    delete stages_user[prop];
                }

                for (let prop of Object.getOwnPropertyNames(stages_all_users)){
                        delete stages_all_users[prop];
                }

                res3.data.forEach(element => {                  
                    
                    if(!stages_all_users[element.stage_id]){
                        stages_all_users[element.stage_id] = [];
                    }

                    stages_all_users[element.stage_id].push(element.user);


                    if (!stages_user[element.stage_id]) {
                        stages_user[element.stage_id] = {};
                        stages_user[element.stage_id][element.block_id] = [element];
                    } else if (!stages_user[element.stage_id][element.block_id]) {
                        stages_user[element.stage_id][element.block_id] = [element];
                    } else {
                        stages_user[element.stage_id][element.block_id].push(element);
                    }
                });
            }

            loading.value = false

        }

        startfn();

        provide('startfn', startfn);

        return {            
            process,
            statuses,
            stages,
            stages_user,
            name,
            subtitle
        }

    },
    components: {
        Status,
        StagesUsers,
        StagesUserStatus,
        Actions
    },
}
</script>
  
  
<style lang="scss">
@import './spacing.scss';
.fw {
    width: 100%;
    display: inline-block;
}
</style>
