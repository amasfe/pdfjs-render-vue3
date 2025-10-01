<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import * as PDFJS from 'pdfjs-dist'
import * as PdfWorker from 'pdfjs-dist/build/pdf.worker.js'

// 定義 props
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
    default: '',
  },
  scale: {
    type: Number,
    default: 1.5,
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  showControls: {
    type: Boolean,
    default: true,
  },
})

// 定義 emits
const emit = defineEmits(['pdf-loaded', 'pdf-error', 'page-rendered'])

onMounted(() => {
  if (props.autoLoad && props.pdfUrl) {
    loadFile(props.pdfUrl)
  }
})

// 監聽 pdfUrl 變化
watch(
  () => props.pdfUrl,
  (newUrl) => {
    if (newUrl && props.autoLoad) {
      loadFile(newUrl)
    }
  },
)

window.pdfjsWorker = PdfWorker
let pdfDoc = null
const pdfPages = ref(0)
const pdfScale = ref(props.scale)
const currentPage = ref(1)

const loadFile = (url) => {
  if (!url) {
    console.warn('[PdfViewer] PDF URL is required')
    return
  }

  // 設定pdfjs的 workerSrc 參數
  PDFJS.GlobalWorkerOptions.workerSrc = PdfWorker
  const loadingTask = PDFJS.getDocument(url)
  loadingTask.promise
    .then(async (pdf) => {
      pdf.loadingParams.disableAutoFetch = true
      pdf.loadingParams.disableStream = true
      pdfDoc = pdf // 保存載入的pdf檔案流
      pdfPages.value = pdfDoc.numPages // 獲取pdf檔案的總頁數
      currentPage.value = 1
      emit('pdf-loaded', { pages: pdfPages.value, pdf })
      await nextTick(() => {
        renderPage(1) // 將pdf檔案內容渲染到canvas
      })
    })
    .catch((error) => {
      console.warn(`[PdfViewer] PDF load error: ${error}`)
      emit('pdf-error', error)
    })
}

const renderPage = (num) => {
  if (!pdfDoc) {
    console.warn('[PdfViewer] PDF document not loaded')
    return
  }

  pdfDoc.getPage(num).then((page) => {
    page.cleanup()
    const canvas = document.getElementById('pdf-canvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      const bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1
      const ratio = dpr / bsr
      const viewport = page.getViewport({ scale: pdfScale.value })
      canvas.width = viewport.width * ratio
      canvas.height = viewport.height * ratio
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const renderContext = {
        canvasContext: ctx,
        viewport,
      }
      page.render(renderContext)
      currentPage.value = num
      emit('page-rendered', { pageNum: num, viewport })
    }
  })
}

// 控制 pdf 的縮放、翻頁、旋轉
const reload = () => {
  if (props.pdfUrl) {
    loadFile(props.pdfUrl)
  }
}

const changePage = (pageNum) => {
  if (pageNum >= 1 && pageNum <= pdfPages.value) {
    currentPage.value = pageNum
    renderPage(pageNum)
  }
}

const changeScale = (newScale) => {
  pdfScale.value = newScale
  if (pdfDoc) {
    renderPage(currentPage.value) // 重新渲染目前頁面
  }
}

const rotatePage = () => {
  rotation.value = (rotation.value + 90) % 360
  if (rotation.value < 0) rotation.value += 360
  if (pdfDoc) {
    renderPage(currentPage.value) // 重新渲染目前頁面
  }
}

const nextPage = () => {
  if (currentPage.value < pdfPages.value) {
    changePage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1)
  }
}

// 暴露方法
defineExpose({
  reload,
  changePage,
  changeScale,
  nextPage,
  prevPage,
  rotatePage,
  pdfPages,
  pdfDoc,
  currentPage,
})
</script>

<template>
  <div class="pdf-viewer">
    <!-- 控制面板 -->
    <div v-if="showControls && pdfPages > 0" class="pdf-controls">
      <div class="control-group">
        <button @click="changeScale(0.5)" :class="['control-btn', { active: pdfScale === 0.5 }]">
          50%
        </button>
        <button @click="changeScale(1.0)" :class="['control-btn', { active: pdfScale === 1.0 }]">
          100%
        </button>
        <button @click="changeScale(1.5)" :class="['control-btn', { active: pdfScale === 1.5 }]">
          150%
        </button>
        <button @click="changeScale(2.0)" :class="['control-btn', { active: pdfScale === 2.0 }]">
          200%
        </button>
        <button @click="changeScale(2.5)" :class="['control-btn', { active: pdfScale === 2.5 }]">
          250%
        </button>
        <button @click="rotatePage()" class="control-btn rotate-btn">
          <i class="icon-ccw"></i>
          旋轉
        </button>
      </div>
      <div class="control-group">
        <button @click="changePage(1)" class="control-btn" :disabled="currentPage === 1">
          第一頁
        </button>
        <button @click="prevPage" class="control-btn" :disabled="currentPage === 1">上一頁</button>
        <span class="page-info">{{ currentPage }} / {{ pdfPages }}</span>
        <button @click="nextPage" class="control-btn" :disabled="currentPage === pdfPages">
          下一頁
        </button>
        <button
          @click="changePage(pdfPages)"
          class="control-btn"
          :disabled="currentPage === pdfPages"
        >
          最後一頁
        </button>
      </div>
    </div>

    <!-- PDF 資訊 -->
    <div v-if="pdfPages > 0" class="pdf-info">
      <span>總頁數: {{ pdfPages }}</span>
    </div>

    <!-- PDF Canvas -->
    <div class="pdf-canvas-wrapper" style="width: 100vw; height: 100vh">
      <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  position: relative;

  .pdf-controls {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;

    label {
      font-weight: bold;
      color: #495057;
      margin-right: 0.5rem;
    }
  }

  .control-btn {
    padding: 0.5rem 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    &.active {
      background: #004085;
    }

    // 旋轉按鈕特殊樣式
    &.rotate-btn {
      background: #28a745;

      &:hover {
        background: #1e7e34;
      }
    }

    &.reset-btn {
      background: #ffc107;
      color: #212529;

      &:hover {
        background: #e0a800;
      }
    }
  }

  .scale-info,
  .page-info,
  .rotation-info {
    font-weight: bold;
    color: #495057;
    margin-left: 0.5rem;
    min-width: 80px;
    text-align: center;
  }

  .rotation-info {
    background: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
    min-width: 100px;
  }

  .pdf-info {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .pdf-canvas {
    &-wrapper {
      width: 100vw;
      height: 100%;
      margin-top: 85px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;
    }
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: none;
    max-height: none;
  }
}
</style>
