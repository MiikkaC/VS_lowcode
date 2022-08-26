//实现组件元素获取焦点
import {computed, ref} from 'vue'


export function userFocus(data,previewRef,callback){ 

    const selectIndex = ref(-1); 

    const lastSelectBlock = computed(()=>data.value.blocks[selectIndex.value])

    const focusData = computed(() => {
        let focus = [];
        let unfocused = [];
        data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block));
        return { focus, unfocused }
    });
    const clearBlockFocus = () => {
        data.value.blocks.forEach(block => block.focus = false);
    }
    const containerMousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(previewRef.value) return
        clearBlockFocus(); 
        selectIndex.value = -1;
    }
    const blockMousedown = (e, block,index) => {
        if(previewRef.value) return
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            if(focusData.value.focus.length <=1) {
                block.focus = true; 
            }else{
                block.focus = !block.focus;
            }
        } else {
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true; 
            } 
        }
        selectIndex.value = index;
        callback(e)
    }
    return {
        blockMousedown,
        containerMousedown,
        focusData,
        lastSelectBlock,
        clearBlockFocus
    }
}