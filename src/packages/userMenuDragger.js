//实现组件元素的拖拽
import { events } from './events';

export function userMenuDragger(containerRef, data) {
    let currentComponent = null;
    const dragenter = (e) => {
        e.dataTransfer.dropEffect = 'move'; 
    }
    const dragover = (e) => {
        e.preventDefault();
    }
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = 'none';
    }
    const drop = (e) => {

        let blocks = data.value.blocks;
        data.value = {
            ...data.value, blocks: [
                ...blocks,
                {
                    top: e.offsetY,
                    left: e.offsetX,
                    zIndex: blocks.length,
                    key: currentComponent.key,
                    alignCenter: true,
                    props: {},
                    model: {},
                    moveSign: 'move',

                }
            ]
        }
        currentComponent = null;
    }
    const dragstart = (e, component) => {
        // dragenter进入元素中
        // dragover在目标元素经过 
        // dragleave 离开元素
        // drop 拖拽完松手
        containerRef.value.addEventListener('dragenter', dragenter)
        containerRef.value.addEventListener('dragover', dragover)
        containerRef.value.addEventListener('dragleave', dragleave)
        containerRef.value.addEventListener('drop', drop)
        currentComponent = component
        events.emit('start');
    }
    const dragend = (e) => {
        containerRef.value.removeEventListener('dragenter', dragenter)
        containerRef.value.removeEventListener('dragover', dragover)
        containerRef.value.removeEventListener('dragleave', dragleave)
        containerRef.value.removeEventListener('drop', drop)
        events.emit('end'); 
    }
    return {
        dragstart,
        dragend
    }
}