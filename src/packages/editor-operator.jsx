//右侧栏属性
import { defineComponent, inject, watch, reactive } from "vue";
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElColorPicker, ElSelect, ElOption, ElInput } from 'element-plus'
import deepcopy from "deepcopy";


export default defineComponent({
    props: {
        block: { type: Object }, // 用户最后选中的元素
        data: { type: Object }, // 当前所有的数据
        updateContainer: { type: Function },
        updateBlock: { type: Function }
    },
    setup(props, ctx) {
        const config = inject('config'); // 组件的配置信息

        const state = reactive({
            editData: {}
        })

        //重置
        const reset = () => {
            if (!props.block) {
                state.editData = deepcopy(props.data.container)
            } else {
                state.editData = deepcopy(props.block);
            }
        }

        //应用
        const apply = () => {
            if (!props.block) { // 更改组件容器的大小
                props.updateContainer({ ...props.data, container: state.editData });
            } else { // 更改组件的配置
                props.updateBlock(state.editData, props.block);
            }

        }

        watch(() => props.block, reset, {
            immediate: true
        })


        return () => {
            let content = []
            if (!props.block) {
                content.push(<div>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
               </div> )
            } else {
                let component = config.componentMap[props.block.key];
                if (component && component.props) {
                    content.push(Object.entries(component.props).map(([propName, propConfig]) => {
                        return <ElFormItem label={propConfig.label}>
                            {{
                                input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                                color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                select: () => <ElSelect v-model={state.editData.props[propName]}>
                                    {propConfig.options.map(opt => {
                                        return <ElOption label={opt.label} value={opt.value}></ElOption>
                                    })}
                                </ElSelect>,
                                table: () => <TableEditor propConfig={propConfig} v-model={state.editData.props[propName]} ></TableEditor>
                            }[propConfig.type]()}
                        </ElFormItem>
                    }))
                }

                if (component && component.model) {
                    content.push(Object.entries(component.model).map(([modelName, label]) => {
                        return <ElFormItem label={label}>
                            <ElInput v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }

            }


            return <ElForm labelPosition="top" style="padding:30px">
                {content}
                <ElFormItem>
                    <ElButton type="primary" onClick={() => apply()}>应用</ElButton>
                    <ElButton onClick={() => reset()} >重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})