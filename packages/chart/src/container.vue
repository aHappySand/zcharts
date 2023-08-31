<template>
  <div class="fill">
    <div class="fill touch-container" ref="container"></div>
  </div>
</template>

<script>


  const emitType = {
    MOUSE_MOVE_INFO: 'onMousemoveInfo',
    CLICK: 'onClick',
    AREA_SELECT: 'onSelectArea',
    AREA_SELECT_END: 'onSelectAreaEnd',
    RESIZE: 'onResize',
    SCALE: 'onScale',
    RESET: 'onReset',
    TRANSFORM: 'onTransform',

    ORBIT_CONTROLS: 'onOrbitControls',
    DOM_PROPERTY: 'onDom',
  }
  export default {
    name: 'container',
    mounted() {
      this.addEvent();
    },
    methods: {
      addEvent() {
        const $el = this.$refs.container;
        const pointers = [];

        function addPointer( event ) {
          pointers.push( event );
        }

        function removePointer( event ) {
          for ( let i = 0; i < pointers.length; i ++ ) {
            if ( pointers[ i ].pointerId == event.pointerId ) {
              pointers.splice( i, 1 );
              return;
            }
          }
        }

        this.onContextMenu = (e) => {
          e.preventDefault();
          this.$emit(emitType.ORBIT_CONTROLS, { type: 'contextmenu', event: this.cloneEvent(e) });
        };

        let hasCtrl = false;
        this.onPointerDown = (e) => {
          hasCtrl = e.ctrlKey;
          if (!hasCtrl) {
            this.$emit(emitType.ORBIT_CONTROLS, { type: 'pointerdown', event: this.cloneEvent(e) });
          }
          if ( pointers.length === 0 ) {
            $el.setPointerCapture( e.pointerId );

            $el.addEventListener( 'pointermove', this.onPointerMove );
            $el.addEventListener( 'pointerup', this.onPointerUp );
          }

          addPointer( e );
        };

        this.onPointerMove = (e) => {
          this.$emit(emitType.ORBIT_CONTROLS, { type: 'pointermove', event: this.cloneEvent(e) });
        };

        this.onPointerUp = (e) => {
          if (!hasCtrl) {
            this.$emit(emitType.ORBIT_CONTROLS, { type: 'pointerup', event: this.cloneEvent(e) });
          }
          hasCtrl = false;
          removePointer( e );
          if ( pointers.length === 0 ) {
            $el.releasePointerCapture( e.pointerId );
            $el.removeEventListener( 'pointermove', this.onPointerMove );
            $el.removeEventListener( 'pointerup', this.onPointerUp );
          }
        };

        this.onMouseWheel = (e) => {
          e.preventDefault();

          this.$emit(emitType.ORBIT_CONTROLS, { type: 'wheel', event: this.cloneEvent(e) });
        };

        this.onMouseMove = (e) => {
          if (this.onMouseMove.timeout) {
            clearTimeout(this.onMouseMove.timeout);
          }
          this.onMouseMove.timeout = setTimeout(() => {
            if (pointers.length === 0) {
              const mouse = {}
              const rect = $el.getBoundingClientRect();
              mouse.x = ( (e.x - rect.x) / rect.width ) * 2 - 1;
              mouse.y = - ( (e.y - rect.y) / rect.height ) * 2 + 1;
              this.$emit(emitType.MOUSE_MOVE_INFO, mouse, this.cloneEvent(e));
            }
          }, 100);
        };

        $el.addEventListener( 'contextmenu', this.onContextMenu );
        $el.addEventListener( 'pointerdown', this.onPointerDown );
        $el.addEventListener( 'pointercancel', this.onPointerUp );
        $el.addEventListener( 'pointermove', this.onMouseMove );
        $el.addEventListener( 'wheel', this.onMouseWheel, { passive: false } );
      },
      emitDom() {
        this.$emit(emitType.DOM_PROPERTY, this.cloneDom());
      },
      removeEvent() {
        const $el = this.$refs.container;
        $el.removeEventListener( 'contextmenu', this.onContextMenu );
        $el.removeEventListener( 'pointerdown', this.onPointerDown );
        $el.removeEventListener( 'pointercancel', this.onPointerUp );
        $el.removeEventListener( 'wheel', this.onMouseWheel, { passive: false } );
        $el.removeEventListener( 'pointermove', this.onPointerMove );
        $el.removeEventListener( 'pointerup', this.onPointerUp );
        $el.removeEventListener( 'pointermove', this.onMouseMove );
      },
      getContainerPosition() {
        const {
          width,
          height,
          top,
          right,
          bottom,
          left
        } = $el.getBoundingClientRect();

        return {
          width,
          height,
          top,
          right,
          bottom,
          left,
          offsetLeft: $el.offsetLeft,
          offsetTop: $el.offsetTop,
          dom: $el,
        };
      },

      cloneEvent(e) {
        const propertys = ['isTrusted',
          'altKey',
          'altitudeAngle',
          'azimuthAngle',
          'bubbles',
          'button',
          'buttons',
          'cancelBubble',
          'cancelable',
          'clientX',
          'clientY',
          'composed',
          'ctrlKey',
          'defaultPrevented',
          'detail',
          'eventPhase',
          'height',
          'isPrimary',
          'layerX',
          'layerY',
          'deltaY',
          'deltaX',
          'deltaZ',
          'metaKey',
          'movementX',
          'movementY',
          'offsetX',
          'offsetY',
          'pageX',
          'pageY',
          'pointerId',
          'pointerType',
          'pressure',
          'returnValue',
          'screenX',
          'screenY',
          'shiftKey',
          'tangentialPressure',
          'tiltX',
          'tiltY',
          'timeStamp',
          'twist',
          'type',
          'which',
          'width',
          'x',
          'y',];
        const event = {};
        propertys.forEach(field => {
          event[field] = e[field];
        });
        return event;
      },
      cloneDom() {
        const dom = this.$refs.container;
        const propertys = [
          'clientHeight',
          'clientLeft',
          'clientWidth',
          'clientTop',
        ];

        const { bottom, height, left, top, right, width, x, y } = dom.getBoundingClientRect();

        const elem = {
          rect: { bottom, height, left, top, right, width, x, y, offsetLeft: dom.offsetLeft, offsetTop: dom.offsetTop }
        };
        propertys.forEach(field => {
          elem[field] = dom[field];
        });

        return elem;
      }
    },
    beforeDestroy() {
      this.removeEvent();
    }
  };
</script>

<style lang="less" scoped>
  .touch-container {
    touch-action: none;
  }
</style>
