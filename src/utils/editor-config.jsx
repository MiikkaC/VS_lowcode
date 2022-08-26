import { ElButton, ElInput } from 'element-plus';


function createEditorConfig() {
    //存放左侧所有的组件，渲染左侧组件区
    const componentList = [];
    //反映映射关系，渲染画布区
    const componentMap = {};


    return {
        componentList,
        componentMap,
        //注册组件
        register: (component) => {
            //将传入的组件都放到组件列表componentList里
            componentList.push(component);
            //放入组件的名(key)和组件
            componentMap[component.key] = component;
        }
    }
}

export let registerConfig = createEditorConfig();

//生成一个构造函数，用于右侧栏的渲染，是用于实现功能的函数
//修改文本
const createInputProp = (label) => ({ type: 'input', label });
//修改颜色
const createColorProp = (label) => ({ type: 'color', label });
//修改字体大小
const createSelectProp = (label, options) => ({ type: 'select', label, options });


//左侧栏组件
//文本框
registerConfig.register({
    label: "文本",
    key: "text",
    resize: {
        width: true,
        height: true,
    },
    preview: () => <ElInput placeholder="文本" ></ElInput>,
    render: ({ props, size }) =>
        <div style={{ color: props.color, fontSize: props.size, height: size.height + 'px', width: size.width + 'px'}}
            type={props.type}
            size={props.size}>{props.text || "文本"}
        </div>,
    props: {
        text: createInputProp('文本内容'),
        color: createColorProp('字体颜色'),
        size: createSelectProp('字体大小', [
            { label: '10px', value: '10px' },
            { label: '15px', value: '15px' },
            { label: '20px', value: '20px' },
            { label: '25px', value: '25px' },
            { label: '30px', value: '30px' },
            { label: '35px', value: '35px' },
            { label: '40px', value: '40px' },
        ],
        ),
    },
})
//按钮
registerConfig.register({
    label: "按钮",
    key: "button",
    resize: {
        width: true,
        height: true
    },
    preview: () => <ElButton>按钮</ElButton>,
    render: ({ props, size }) => <ElButton style={{ height: size.height + 'px', width: size.width + 'px' }}
        type={props.type}
        size={props.size}>{props.text || '按钮'}</ElButton>,

    props: {
        text: createInputProp('按钮内容'),
        color: createColorProp('字体颜色'),
        type: createSelectProp('按钮类型', [
            { label: "默认", value: "primary" },
            { label: "成功", value: "success" },
            { label: "警告", value: "warning" },
            { label: "危险", value: "danger" },
            { label: "消息", value: "info" },
        ]),
        size: createSelectProp('按钮尺寸', [
            { label: "默认", value: "" },
            { label: "中等", value: "medium" },
            { label: "小", value: "mini" },

        ]),
    },
});


