<script>
import {h, inject, nextTick, resolveComponent} from 'vue'

export default {
  name : 'Column',
  props : ['name'],
  setup(props){
    let grid = inject(props.name);
    return {grid}
  },
  methods : {
    hideContext : function(e){
      if(e.target.closest('.context-menu-wrapper.' + this.name) == null)
        this.grid.system.context.show = false;
    },
    showContext : async function($event,element){
      this.grid.system.context.show = true;
      this.grid.system.context.row = element;
      await nextTick();
      let rect = document.querySelector('.vdg_contextMenuWrapper.' + this.name).getBoundingClientRect();

      if(($event.clientY + rect.height) > window.innerHeight)
        this.grid.system.context.top = window.innerHeight - rect.height - 10;
      else
        this.grid.system.context.top = $event.clientY;

      if(($event.clientX + rect.width) > window.innerWidth)
        this.grid.system.context.left = window.innerWidth - rect.width - 20;
      else
        this.grid.system.context.left = $event.clientX;

      document.addEventListener('click',this.hideContext);
    },
    // Рекурсивно отсоовываем вложенности пришедшей колони
    getContentGrid : function(column, columnName, element){
      if (column instanceof Object) {

        if (!("tag" in column))
          column.tag = 'span';

        if (!("params" in column))
          column.params = {};

        return h(
            column.tag === 'el-input' ? resolveComponent(column.tag) : column.tag,
            column.tag === 'el-input' ? {
              ...column.params,
              modelValue : column.value,
              'onUpdate:modelValue': value => columnName !== 'fact' ? column.value = (String(value).replace(/[^\d.]/ig, '')) : column.value = value,
              onChange : $event => {
                columnName != 'fact' ? column.value = parseFloat(column.value) : '';

                if (columnName == 'threshold_min' || columnName == 'weight') column.value > 100 ? column.value = 100 : '';

                if (columnName === 'threshold_max' && element.threshold_max[0].value.value.value < element.threshold_min[0].value.value.value)
                  column.value = element.threshold_min[0].value.value.value;

                if (columnName === 'threshold_min' && element.threshold_min[0].value.value.value > element.threshold_max[0].value.value.value)
                  column.value = element.threshold_max[0].value.value.value;

                this.grid.changing.push({newValue : column.value, name : columnName, id : element.id[0].value ? element.id[0].value : '' })},
            } : column.params,
            column.tag === 'el-input' ? null : [this.getContentGrid(column.value)],
        );
      } else {
        return h(
            'span',
            {},
            column
        );
      }
    },
  },
  watch : {
    // Наблюдаем за переменной для удаления события скрытия контекстного меню
    'grid.system.context.show' : function(val) {
      if(!val)
        document.removeEventListener('click',this.hideContext)
    }
  },
  render(){
    let row = [];
    this.grid.elements.forEach((element, index) => {

      let max = 0;
      for (const [key, resultElement] of Object.entries(element)) {
        if(max < resultElement[resultElement.length - 1].end)
          max = resultElement[resultElement.length - 1].end
      }

      let columnElement = [];
      this.grid.system.columnKey.forEach(columnName => {
        element[columnName].forEach((column, index) => {

          let endRow = column.end;

          //Оставить на случай если на большой вложенности возникнут глюки
          //Отвечает за высоту колонки
          //if(this.grid.header[columnName].child.length == 0)
          if (element[columnName].length <= 1)
            endRow = (element[columnName].length - 1 == index ? max : column.end);

          let columnValues;

          let defaultParentParams = {
            class: ['vdg_contentWrapper_columnContent', columnName],
            style: {
              'grid-row': column.start + '/' + endRow
            }
          };

          // Если value обьект то генерируем версту переданую в нем
          if (column.value instanceof Object) {

            if (!("tag" in column))
              column.tag = 'span';

            if (!("params" in column))
              column.params = {};

            // Дальше рекурсивно генерируем всю вложеность

            columnValues = h(
                column.value.tag,
                column.value.params,
                [this.getContentGrid(column.value.value, columnName, element)]
            );

            // Возможность передать параметры ячейке родителю
            if (!("parentParams" in column.value))
              column.value.parentParams = {};

            // Возможность передать Событие клика ячейке родителю
            if ("onClick" in column.value.parentParams)
              defaultParentParams.onClick = eval(column.value.parentParams.onClick)

            if ("style" in column.value.parentParams) {
              defaultParentParams.style = {
                ...defaultParentParams.style,
                ...column.value.parentParams.style
              }
            }

            if ("class" in column.value.parentParams) {
              defaultParentParams.class.concat(column.value.parentParams.class)
            }

          } else {
            columnValues = h(
                'span',
                {},
                column.value
            );
          }

          // Иконка для контекстного меню
          if(columnName == 'icon' && ('context' in element || this.grid.context.length)){
            columnValues = [h(
                resolveComponent('el-icon'),
                {
                  onClick : async $event => {
                    $event.stopPropagation();
                    this.showContext($event,element);
                  }
                },
                () => [h(
                    resolveComponent('expand'),
                    {},
                    ''
                )]
            )]
          }


          columnElement.push(h(
              'div',
              defaultParentParams,
              columnValues
          ));
          if (element[columnName][index + 1] && endRow < element[columnName][index + 1].start) {
            columnElement.push(h(
                'div',
                {
                  class: 'vdg_contentWrapper_columnContent',
                  style: {
                    'grid-row': endRow + '/' + element[columnName][index + 1].start
                  }
                },
                ''
            ));
          }
          if (!element[columnName][index + 1] && endRow < max) {
            columnElement.push(h(
                'div',
                {
                  class: 'vdg_contentWrapper_columnContent',
                  style: {
                    'grid-row': endRow + '/' + max
                  }
                },
                ''
            ));
          }

        });
      })

      row.push(h(
          'div',
          {
            class : 'vdg_contentWrapper_rowContent',
            style : {
              'grid-template-columns' : this.grid.system.gtc,
            },
            onContextmenu : $event => {
              if('context' in element || this.grid.context.length) {
                $event.preventDefault();
                this.showContext($event, element);
              }
            },
          },
          columnElement
          )
      )

    });

    return h(
        'div',
        {
            class : ['vdg_contentWrapper', this.name],
            style : {
              width : this.grid.system.scrollWidth+'px',
              'clip-path' : 'inset(0px)',
            }
        },
        row
    );
  }
}
</script>