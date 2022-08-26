
import { computed, defineComponent, inject, ref } from "vue";
import './editor.css'
import EditorBlock from './editor-block'
import deepcopy from "deepcopy";
import { userMenuDragger } from "./userMenuDragger";
import { userFocus } from "./userFocus";
import { userBlockDragger } from "./userBlockDragger";
import { userCommand } from "./userCommand";
import { $dialog } from "../components/Dialog";
import { $dropdown, DropdownItem } from "../components/Dropdown";
import EditorOperator from "./editor-operator";
import { ElButton } from "element-plus";


export default defineComponent({
    props: {
        modelValue: { type: Object },
    },
    emits: ['update:modelValue'], // 要触发的事件
    setup(props, ctx) {
        // 预览状态，预览的时候 内容不能在操作了 ，可以点击 输入内容 方便看效果
        const previewRef = ref(false);
        //编辑状态
        const editorRef = ref(true);

        const data = computed({
            get() {
                return props.modelValue
            },
            set(newValue) {
                ctx.emit('update:modelValue', deepcopy(newValue))
            }
        });

        //更新容器宽高
        const containerValue = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        //注入组件映射关系
        const config = inject('config');

        const containerRef = ref(null);

        //实现菜单的拖拽功能
        const { dragstart, dragend } = userMenuDragger(containerRef, data);

        // 实现获取焦点 选中后可能直接就进行拖拽了
        let { blockMousedown, focusData, containerMousedown, lastSelectBlock, clearBlockFocus } = userFocus(data, previewRef, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });

        // 实现组件拖拽
        let { mousedown, markLine } = userBlockDragger(focusData, lastSelectBlock, data);

        //top菜单
        const { commands } = userCommand(data, focusData);
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '恢复', icon: 'icon-forward', handler: () => commands.redo() },
            {
                label: '导出', icon: 'icon-export', handler: () => {
                    $dialog({
                        title: '导出json使用',
                        content: JSON.stringify(data.value),
                    })
                }
            },
            {
                label: '导入', icon: 'icon-import', handler: () => {
                    $dialog({
                        title: '导入json使用',
                        content: '',
                        footer: true,
                        onConfirm(text) {
                            commands.updateContainer(JSON.parse(text));
                        }
                    })
                }
            },
            { label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-delete', handler: () => commands.delete() },
            {
                label: '预览', icon: 'icon-browse', handler: () => {
                    editorRef.value = false;
                    clearBlockFocus();
                }
            },
        ];

        //右键菜单
        const onContextMenuBlock = (e, block) => {
            e.preventDefault();

            $dropdown({
                el: e.target, // 以哪个元素为准产生一个dropdown
                content: () => {
                    return <>
                        <DropdownItem label="删除" icon="icon-delete" onClick={() => commands.delete()}></DropdownItem>
                        <DropdownItem label="置顶" icon="icon-place-top" onClick={() => commands.placeTop()}></DropdownItem>
                        <DropdownItem label="置底" icon="icon-place-bottom" onClick={() => commands.placeBottom()}></DropdownItem>
                        <DropdownItem label="查看" icon="icon-browse" onClick={() => {
                            $dialog({
                                title: '查看元素数据',
                                content: JSON.stringify(block),
                                footer: true,
                            })
                        }}></DropdownItem>
                        <DropdownItem label="导入" icon="icon-import" onClick={() => {
                            $dialog({
                                title: '导入元素数据',
                                content: '',
                                footer: true,
                                onConfirm(text) {
                                    text = JSON.parse(text);
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                }
            })
        }


        // 渲染页面
        return () => !editorRef.value ? <>
            {/* 预览状态 */}
            <div
                class="editor-container-content"
                style={containerValue.value}
            // style="margin:0"
            >
                {
                    (data.value.blocks.map((block, index) => (
                        <EditorBlock
                            class='editor-block-preview'
                            block={block}
                        ></EditorBlock>
                    )))
                }
            </div>
            <div >
                <ElButton type="primary" onClick={() => editorRef.value = true
                }>返回继续编辑</ElButton>
            </div>


            {/* 编辑状态 */}
        </> : <div class="editor">
            <div class="editor-left">
                <span class="editor-left-title">组件栏</span>
                <hr style='background-color:#fff; height:2px; border:none'/>
                {config.componentList.map(component => (
                    <div
                        class="editor-left-item"
                        draggable
                        onDragstart={e => dragstart(e, component)}
                        onDragend={dragend}
                    >
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                ))}
            </div>

            <div class="editor-top">
                {buttons.map((btn, index) => {
                    const icon = btn.icon
                    const label = btn.label
                    return <div class="editor-top-button" onClick={btn.handler}>
                        <i class={icon}></i>
                        <span>{label}</span>
                    </div>
                })}
            </div>

            <div class="editor-right">
            <span class="editor-left-title">属性栏</span>
                <hr style='background-color:#fff; height:2px; border:none'/>
                <EditorOperator
                    block={lastSelectBlock.value}
                    data={data.value}
                    updateContainer={commands.updateContainer}
                    updateBlock={commands.updateBlock}
                ></EditorOperator>
            </div>

            <div class="editor-container">
                {/*  负责产生滚动条 */}
                <div class="editor-container-scroll">
                    {/* 产生内容区域 */}
                    <div
                        class="editor-container-content"
                        style={containerValue.value}
                        ref={containerRef}
                        onMousedown={containerMousedown}

                    >
                        {
                            (data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    class={block.focus ? 'editor-block-focus' : ''}
                                    class={previewRef.value ? 'editor-block-preview' : ''}
                                    block={block}
                                    onMousedown={(e) => blockMousedown(e, block, index)}
                                    onContextmenu={(e) => onContextMenuBlock(e, block)}
                                ></EditorBlock>
                            )))
                        }

                        {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                        {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}

                    </div>

                </div>
            </div>
        </div>
    }
})