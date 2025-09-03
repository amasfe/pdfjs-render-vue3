<script setup>
import { ref } from 'vue'
import PdfViewer from '@/components/PdfViewer.vue'

// 測試用的 PDF 檔案路徑
const testPdfUrl = '/file-sample_150kB.pdf'

// 響應式資料
const pdfLoaded = ref(false)
const pdfPages = ref(0)
const currentPage = ref(0)
const error = ref('')
const pdfViewerRef = ref()

// 事件處理
const onPdfLoaded = ({ pages, pdf }) => {
  pdfLoaded.value = true
  pdfPages.value = pages
  error.value = ''
  console.log(`PDF 載入完成，總頁數: ${pages}`)
}

const onPdfError = (err) => {
  pdfLoaded.value = false
  error.value = err.message || 'PDF 載入失敗'
  console.error('PDF 載入失敗:', err)
}

const onPageRendered = ({ pageNum, viewport }) => {
  currentPage.value = pageNum
  console.log(`第 ${pageNum} 頁渲染完成`)
}
</script>

<template>
  <div class="example-container">
    <h1>PDF.js Render Vue3 測試</h1>

    <!-- 測試資訊 -->
    <div class="test-info">
      <p>正在測試專案內的 test-pdf-file.pdf 檔案渲染</p>
      <p>檔案路徑: /test-pdf-file.pdf</p>
      <p>所有控制功能（縮放、換頁等）都已整合在 PdfViewer 組件中</p>
    </div>

    <!-- PDF 檢視器 -->
    <div class="pdf-container">
      <PdfViewer
        :pdf-url="testPdfUrl"
        :scale="1.5"
        :auto-load="true"
        :show-controls="true"
        @pdf-loaded="onPdfLoaded"
        @pdf-error="onPdfError"
        @page-rendered="onPageRendered"
        ref="pdfViewerRef"
        class="pdf-viewer"
      />
    </div>

    <!-- 狀態資訊 -->
    <div class="status-info">
      <p v-if="pdfLoaded">PDF 已載入，總頁數: {{ pdfPages }}</p>
      <p v-if="currentPage">目前頁面: {{ currentPage }}</p>
      <p v-if="error" class="error">錯誤: {{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.test-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.test-info p {
  margin: 5px 0;
  color: #1976d2;
}

.pdf-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.pdf-viewer {
  max-width: 100%;
}

.status-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  text-align: center;
}

.status-info p {
  margin: 5px 0;
}

.error {
  color: #dc3545;
  font-weight: bold;
}
</style>
