//实现右键下拉菜单
import { provide, inject, computed, createVNode, defineComponent, reactive, render, onMounted, onBeforeUnmount, ref } from 'vue';

export const DropdownItem = defineComponent({
    props: {
        label: String,
        icon: String,
    },
    setup(props) {
        let { label, icon } = props;
        let hide = inject('hide');
        return () => <div class="dropdown-item" onClick={hide}>
            <i class={icon}></i>
            <span>{label}</span>
        </div>
    }
});

const DropdownComponent = defineComponent({
    props: {
        option: { type: Object },
    },
    setup(props, ctx) {
        const state = reactive({
            option: props.option,
            isShow: false,
            top: 0,
            left: 0,
        });

        ctx.expose({
            showDropdown(option) {
                state.option = option;
                state.isShow = true;
                //定位菜单
                let { top, left, height } = option.el.getBoundingClientRect();
                state.top = top + height;
                state.left = left;
            }
        });

        //实现组件点击下拉菜单后菜单消失
        provide('hide', () => state.isShow = false);

        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ]);

        const styles = computed(() => ({
            top: state.top + 'px',
            left: state.left + 'px',
            zIndex: 10000

        }))

        const el = ref(null);
        const onMousedownDocument = (e) => {
            //如果点击的是dropdown内部，什么都不做
            if (!el.value.contains(e.target)) {
                state.isShow = false;
            }
        };

        onMounted(() => {
            document.body.addEventListener('mousedown', onMousedownDocument, true)
        })

        //事件解绑
        onBeforeUnmount(() => {
            document.body.removeEventListener('mousedown', onMousedownDocument)
        })

        return () => {
            return <div class={classes.value} style={styles.value} ref={el}>
                {state.option.content()}
            </div>
        };
    }
})



let vm;
export function $dropdown(option) {
    if (!vm) {
        let el = document.createElement('div');
        vm = createVNode(DropdownComponent, { option });
        document.body.appendChild((render(vm, el), el));
    };

    let { showDropdown } = vm.component.exposed;
    showDropdown(option);
};