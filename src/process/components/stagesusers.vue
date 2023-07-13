<template>
    <el-timeline class="stagesusers">
        <el-timeline-item :timestamp="item.name" v-for="item, key in stages" :key="key" placement="top">
     
            <el-card>
                <div v-for="block in item.blocks" :key="block.id+block.process_stage_id"> 
                    
                    <el-row class="row-bg mt-1" :gutter="20">
                        <el-col :span="10">          
                            <el-select v-model="item['ubp'+block.id]" class="fw" size="large" @change="addUserStage(item, item['ubp'+block.id], user_options, block)"  empty="12" filterable collapse-tags remote :filter-method="query" reserve-keyword placeholder="Выбрать пользователя">
                                <el-option v-for="item in user_options" :key="item.value" :label="item.label" :value="item.value"></el-option>
         
                            </el-select>
                            <div v-if="stages_user[item.id] == 1">
                                {{stages_user[item.id].length}}
                                {{item}} 
                            </div> 
                            <!-- <el-row  type="flex" class="row-bg mt-1 ml-0" :gutter="20">
                                <el-button size="large"  @click="addUserStage(item, item['ubp'+block.id], user_options, block)">Добавить в процесс</el-button>
                            </el-row> -->
                        </el-col>
                        <el-col :span="14">
                            <el-card class="box-card custom"  shadow="never">
                                <template #header>
                                <div class="card-header">
                                    <span>{{nameRoleUsers(item.role_user_name)}}</span>    
                                    <span class="float-right">
                                        Тип : {{passing[block.passing] }}
                                    </span>
                                </div>
                                </template>                            
                                <div v-if="stages_user[item.id] && stages_user[item.id][block.id]"  v-for="(ubp,i) in stages_user[item.id][block.id]" :key="i" class="text item box-user mb-1">
                           
                                    <span class="userPhotoBp mr-1">
                                        <a :href="ubp.user.link">
                                            <img :src="ubp.user.photo" alt="фото"/>
                                        </a>
                                    </span>
                                    <span>
                                        {{ ubp.user_name }}
                                    </span>                
                                     <span class="close" @click="deleteUserStage(ubp)">x</span>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                
                
                </div>
            </el-card>

        </el-timeline-item>
    </el-timeline>

    <el-row class="fw" v-if="full_access">
        <el-button @click="startProcess" class="start-process-button mb-1">Запустить процесс</el-button>
    </el-row>    
  
</template>

<script>
import moment from 'moment'
import RussianNouns from 'russian-nouns-js'
import { domain, req,  svg } from "@/process/global/index.js";
import {defineComponent, reactive, inject} from 'vue';
import { ElNotification } from 'element-plus'
moment.locale('ru');

export default {

    setup(){

        let loading             = inject('loading');
        let process_id          = inject('process_id');
        let document_id         = inject('document_id');
        let user                = inject('user');
        let passing             = inject('passing');
        let data                = inject('data_notify');
        let stages              = inject('stages');
        let stages_user         = inject('stages_user');
        let user_options        = reactive([]);
        let startfn             = inject('startfn');
        let stages_all_users    = inject('stages_all_users');
        let full_access         = inject('full_access');
        
        let getStagesUsers = async () => {

            let res = await req('/process/get-stages-user', {
                document_id:document_id,
                process_id:process_id  
            });

            if (res.status == 'success') {

                for (let prop of Object.getOwnPropertyNames(stages_user)){
                    delete stages_user[prop];
                }

                for (let prop of Object.getOwnPropertyNames(stages_all_users)){
                        delete stages_all_users[prop];
                }
                
                res.data.forEach(element => {

                    if(!stages_all_users[element.stage_id]){
                        stages_all_users[element.stage_id] = [];
                    }

                    stages_all_users[element.stage_id].push(element.user)

                    if (!stages_user[element.stage_id]){
                        stages_user[element.stage_id] = {};
                        stages_user[element.stage_id][element.block_id] = [element];
                    } else if(!stages_user[element.stage_id][element.block_id]) {
                        stages_user[element.stage_id][element.block_id] = [element];
                    } else {
                        stages_user[element.stage_id][element.block_id].push(element);
                    }
                });    
            }
        }

        const startProcess = async () => {

            loading.value = true;

            let error = 0;

            await stages.forEach(stage => {
                if(stage.blocks)
                    stage.blocks.forEach(block => {
                        if(+block.required){
                            if(
                                !stages_user[stage.id] || 
                                !stages_user[stage.id][block.id] || 
                                stages_user[stage.id][block.id].length == 0
                            ){
                              loading.value = false;
                                ElNotification({
                                    title: "Ошибка",
                                    message: `Не указан сотрудник для этапа <br> '${stage.name}'`,
                                    type: 'error',
                                    dangerouslyUseHTMLString: true,
                                    duration: 4000,
                                })
                                error++;
                            }
                        }                        
                    });
                    
            });
            
            if(error == 0){

                let id = await req('/process/start-process', {
                    document_id : document_id,
                    process_id  : process_id,
                    user        : user,
                    data        : data
                });

                if(id){
                    loading.value       = false;
                    startfn();
                }
            }

            // if(stages[1] && stages_user[stages[1].id] || !stages[1] && stages_user[stages[0].id]){

            //     let id = await req('/process/start-process', {
            //         document_id : document_id,
            //         process_id  : process_id,
            //         user        : user,
            //         data        : data
            //     });

            //     if(id){
            //         startfn();
            //     }

            // } else {

            //     if(stages[1] && stages_user[stages[1].id]){

            //         ElNotification({
            //             title: "Ошибка",
            //             message: `Этап '${stages[1].name}' не заполнен`,
            //             type: 'error',
            //             duration: 4000,
            //         })

            //     }

            //     if(!stages[1] && stages_user[stages[0].id]){

            //         ElNotification({
            //             title: "Ошибка",
            //             message: `Этап '${stages[0].name}' не заполнен`,
            //             type: 'error',
            //             duration: 4000,
            //         })
                    
            //     }                

            // }


        }

        return { stages , user_options, document_id, stages_user, passing, getStagesUsers, startProcess, full_access, stages_all_users}
    },
    methods: {

        nameRoleUsers(name) {
            const rne = new RussianNouns.Engine();
            const Gender = RussianNouns.Gender;
            let word = RussianNouns.createLemma({
                text: name,
                gender: Gender.MASCULINE
            });
            return rne.pluralize(word)[0];
        },
        async addUserStage(item, user, userOptions, block) {
            
            if (user && !this.stages_all_users[item.id] || user && !this.stages_all_users[item.id].find(item => item.user == user)) {

                let nameUser = userOptions.find(item => item.value == user);
                // item.id

                let data = {
                    user: user,
                    user_name: nameUser.label,
                    stage_id: item.id,
                    block_id: block.id,
                    process_id: item.process_id,
                    document_id: this.document_id,
                }

                let id = await req('/process/add-stages-user', data);

                if (id){
                  this.user_options.length = 0;
                  await this.getStagesUsers();
                  item['ubp'+block.id] = ''
                }
            } else {
                ElNotification({
                    title: "Ошибка",
                    message: "Пользователь уже был добавлен ранее",
                    type: 'error',
                    duration: 4000,
                })
                item['ubp'+block.id] = ''
            }

        },
        async deleteUserStage(ubp) {

           let id = await req('/process/delete-stages-user', {
                id: ubp.id
            });

            if (id)
                await this.getStagesUsers();

        },
        async query(data) {


            if(data){

                var result = await req('/process/user/search', {
                    q: data
                });

                this.user_options.length = 0;

                result.data.forEach(element => {
                    this.user_options.push(element)
                });

            }
          
        },
        // async getStages() {

        //     let stages = await this.$store.dispatch('queryProcess', {
        //         url: 'get-stages',
        //         data: {
        //             id: this.id,
        //             module: this.module
        //         }
        //     });

        //     this.stages = stages.data;
        // },
        // async getStagesUsers() {

        //     let stagesUsers = await this.$store.dispatch('queryProcess', {
        //         url: 'get-stages-user',
        //         data: {
        //             filter: [
        //                 ['document_id', this.document_id],
        //                 ['process_id', this.process.process_id]
        //             ]
        //         }
        //     });

        //     if (stagesUsers.status == 'success') {

        //         stagesUsers.data.forEach(element => {
        //             if (!stageU[element.stage_id]){
        //                 stageU[element.stage_id] = {};
        //                 stageU[element.stage_id][element.block_id] = [element];
        //             } else if(!stageU[element.stage_id][element.block_id]) {
        //                 stageU[element.stage_id][element.block_id] = [element];
        //             } else {
        //                 stageU[element.stage_id][element.block_id].push(element);
        //             }                        
        //         });
        //         this.$store.commit('set_stages_user', stageU);
        //     }

        // },

    },
    components: {

    },
    watch: {

    },
}
</script>


<style lang="css" scoped>
.float-right {
    float: right;
}
.text.item.box-user {
    display: flex;
    align-items: center;
}
.fw {
    width: 100%;
    display: inline-block;
}
.userPhotoBp {
    border-radius: 50%;
    overflow: hidden;
    display: block;
    width: 25px;
    height: 25px;
}
.userPhotoBp img {
    width: 25px;
}


.start-process-button, 
.stop-process-button {
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}
.start-process-button:hover,
.stop-process-button:hover {
  background: #3fddff !important;
}

.start-process-button,
.stop-process-button {

    float: right;
    display: block;
    width: 200px;
    height: 40px;
}
.stagesusers .close {
    cursor: pointer;
    padding: 0 10px;
}


.stagesusers >>> .box-card.custom .el-card__header {
    padding: 15px 20px;
}

.stagesusers >>> .el-step.is-simple .el-step__icon {
    margin-top: 7px;
}

.stagesusers >>> .el-step.is-simple .el-step__title {
    font-size: 13px;
    word-break: break-word !important;
}
</style>
