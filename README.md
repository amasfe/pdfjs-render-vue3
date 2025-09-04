# PDF.js Render Vue3

一個基於 PDF.js 的 Vue 3 組件，用於在 Vue 3 專案中檢視和渲染 PDF 檔案。

master更新後，會自動build:lib到release分支，請使用release安裝。

## 安裝

```bash
npm install git+https://github.com/amasfe/pdfjs-render-vue3.git#release
# 或
yarn add git+https://github.com/amasfe/pdfjs-render-vue3.git#release
```

## 使用方法

### 基本用法

```vue
<template>
  <div>
    <PdfViewer :pdf-url="pdfUrl" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PdfViewer } from 'pdfjs-render-vue3'

const pdfUrl = ref('https://example.com/sample.pdf')
</script>
```

### 進階用法

```vue
<template>
  <div>
    <PdfViewer
      :pdf-url="pdfUrl"
      :scale="scale"
      :auto-load="true"
      @pdf-loaded="onPdfLoaded"
      @pdf-error="onPdfError"
      @page-rendered="onPageRendered"
      ref="pdfViewerRef"
    />

    <!-- 控制按鈕 -->
    <div class="controls">
      <button @click="changeScale(2.0)">放大</button>
      <button @click="changeScale(1.0)">正常</button>
      <button @click="changeScale(0.5)">縮小</button>
      <button @click="reload">重新載入</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PdfViewer } from 'pdfjs-render-vue3'

const pdfUrl = ref('https://example.com/sample.pdf')
const scale = ref(1.5)
const pdfViewerRef = ref()

// 事件處理
const onPdfLoaded = ({ pages, pdf }) => {
  console.log(`PDF 載入完成，總頁數: ${pages}`)
}

const onPdfError = (error) => {
  console.error('PDF 載入失敗:', error)
}

const onPageRendered = ({ pageNum, viewport }) => {
  console.log(`第 ${pageNum} 頁渲染完成`)
}

// 控制方法
const changeScale = (newScale) => {
  scale.value = newScale
  pdfViewerRef.value?.changeScale(newScale)
}

const reload = () => {
  pdfViewerRef.value?.reload()
}
</script>
```

## Props

| 屬性名稱        | 類型    | 預設值 | 說明                   |
| --------------- | ------- | ------ | ---------------------- |
| `pdf-url`       | String  | -      | PDF 檔案的 URL（必填） |
| `scale`         | Number  | 1.5    | PDF 渲染的縮放比例     |
| `auto-load`     | Boolean | true   | 是否自動載入 PDF       |
| `show-controls` | Boolean | true   | 是否顯示控制面板       |

## Events

| 事件名稱        | 參數                    | 說明               |
| --------------- | ----------------------- | ------------------ |
| `pdf-loaded`    | `{ pages, pdf }`        | PDF 載入完成時觸發 |
| `pdf-error`     | `error`                 | PDF 載入失敗時觸發 |
| `page-rendered` | `{ pageNum, viewport }` | 頁面渲染完成時觸發 |

## 暴露的方法

通過 `ref` 可以呼叫以下方法：

| 方法名稱              | 參數              | 說明           |
| --------------------- | ----------------- | -------------- |
| `reload()`            | -                 | 重新載入 PDF   |
| `changePage(pageNum)` | `pageNum: Number` | 切換到指定頁面 |
| `changeScale(scale)`  | `scale: Number`   | 改變縮放比例   |
| `nextPage()`          | -                 | 下一頁         |
| `prevPage()`          | -                 | 上一頁         |

## 全域註冊

```javascript
import { createApp } from 'vue'
import { PdfViewer } from 'pdfjs-render-vue3'
import App from './App.vue'

const app = createApp(App)
app.component('PdfViewer', PdfViewer)
app.mount('#app')
```

## 開發

```bash
# 安裝依賴
yarn install

# 開發模式
yarn dev

# 建置套件
yarn build:lib

# 執行測試
yarn test:unit
```

## 依賴

- Vue 3.3+
- PDF.js 3.11.174

## 授權

MIT
