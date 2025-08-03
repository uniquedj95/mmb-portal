<template>
  <div class="datatable-wrapper">
    <div class="title">
      <h3 v-if="title">{{ title }}</h3>
      <h6 v-if="subTitle">{{ subTitle }}</h6>
    </div>
    <div class="justify-between padding-bottom">
      <el-input
        v-model="filter"
        placeholder="search here..."
        debounce-rate="500"
        style="max-width: 250px"
        :suffix-icon="SearchIcon"
        @input="handleFilter"
      />
      <div class="action-buttons">
        <el-button
          v-for="btn of actionButtons"
          :key="btn.label"
          :type="btn.type"
          @click="btn.onClick"
        >
          {{ btn.label }}
        </el-button>
      </div>
    </div>
    <el-table
      fit
      stripe
      width="100%"
      height="95%"
      table-layout="auto"
      :data="tableData"
      :preserve-expanded-content="expandable"
      :border="true"
    >
      <el-table-column type="expand" fixed="left" v-if="expandable">
        <template #default="props">
          <div class="ml-4">
            <slot name="expand-content" v-bind="props"></slot>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="#"
        type="index"
        fixed="left"
        :index="getRowIndex"
        v-if="indexed"
      />
      <el-table-column
        v-for="(column, index) of columns"
        :key="column.label"
        v-bind="column"
      >
        <template #default="scope">
          <!-- Check if there's a custom template for this column -->
          <slot :name="`column-${column.prop}`" :row="scope.row" :column="column" v-if="$slots[`column-${column.prop}`]">
          </slot>
          <!-- Otherwise, render the default content -->
          <template v-else>
            <span v-if="column.formatter && column.prop">{{ column.formatter(scope.row, column as TableColumnCtx<any>, scope.row[column.prop], index) }}</span>
            <span v-else-if="column.prop">{{ scope.row[column.prop] }}</span>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="rowActionsButtons.length"
        label="Actions"
        fixed="right"
        width="200"
      >
        <template #default="prop">
          <template v-for="btn in rowActionsButtons">
            <el-tooltip
              class="box-item"
              effect="light"
              :content="btn.label"
              placement="top"
              v-if="canShowButton(btn, prop.row)"
            >
              <el-button
                :type="(btn.type as any)"
                size="small"
                @click.prevent="btn.onClick(prop)"
              >
                <el-icon v-if="btn.icon">
                  <component :is="btn.icon" />
                </el-icon>
                <span v-else>{{ btn.label }}</span>
              </el-button>
            </el-tooltip>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="paginated"
      background
      size="small"
      hide-on-single-page
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      style="margin-top: 1rem"
      @size-change="handleFilter"
      @current-change="paginate"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, watch, ref } from "vue";
import api from "../api";
import {
  ElTable,
  ElButton,
  ElTableColumn,
  TableColumnCtx,
  ElPagination,
  ElInput,
  ElIcon,
  ElTooltip,
} from "element-plus";
import { Search as SearchIcon } from "@element-plus/icons-vue";

type BtnType =
  | "default"
  | "text"
  | "warning"
  | "danger"
  | "success"
  | "info"
  | "primary";

export interface ActionButton {
  type?: BtnType;
  label: string;
  icon?: any;
  onClick: (e: MouseEvent) => any;
  condition?: (row: any) => boolean;
}

interface ApiDataResponse {
  data: Array<any>;
  current_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  last_page: number;
  first_page_url: string;
  next_page_url: string;
  last_page_url: string | null;
  links: Array<any>;
  prev_page_url: string | null;
}

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subTitle: {
    type: String,
    default: "",
  },
  columns: {
    type: Array as PropType<Array<Partial<TableColumnCtx<any>>>>,
    required: true,
  },
  ajaxUri: {
    type: String,
    default: "",
  },
  data: {
    type: Array as PropType<Array<any>>,
    default: () => [],
  },
  actionButtons: {
    type: Array as PropType<Array<ActionButton>>,
    default: () => [],
  },
  rowActionsButtons: {
    type: Array as PropType<Array<ActionButton>>,
    default: () => [],
  },
  paginated: {
    type: Boolean,
    default: true,
  },
  itemsPerPage: {
    type: Number,
    default: 20,
  },
  indexed: {
    type: Boolean,
    default: true,
  },
  expandable: {
    type: Boolean,
    default: false,
  },
});

const filter = ref("");
const tableData = ref<Array<any>>([]);
const currentPage = ref(1);
const total = ref(0);
const pageSize = ref(props.itemsPerPage);
const isServerMode = computed(() => !!props.ajaxUri);

function canShowButton(btn: ActionButton, row: any) {
  return typeof btn.condition === "function"
    ? btn.condition(row)
    : true;
}

function getRowIndex(i: number) {
  return (currentPage.value - 1) * pageSize.value + i + 1;
}

function handleFilter() {
  currentPage.value = 1;
  paginate();
}

function paginate() {
  if (isServerMode.value) return loadApiData();
  return paginateLocally();
}

async function loadApiData() {
  const res = await api.getJson<ApiDataResponse>(props.ajaxUri, {
    page: currentPage.value,
    per_page: pageSize.value,
    filter: filter.value,
  });
  tableData.value = res.data;
  total.value = res.total;
}

function paginateLocally() {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const filteredData = filter.value
    ? props.data.filter((row) => JSON.stringify(row).includes(filter.value))
    : props.data;
  tableData.value = filteredData.slice(start, end);
  total.value = props.data.length;
}

watch([() => props.data, () => props.ajaxUri], () => paginate(), {
  immediate: true,
  deep: true,
});
</script>
