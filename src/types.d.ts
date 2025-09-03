declare module 'pdfjs-render-vue3' {
  import { ComponentPublicInstance } from 'vue'

  export interface PdfViewerProps {
    pdfUrl: string
    scale?: number
    autoLoad?: boolean
    showControls?: boolean
  }

  export interface PdfViewerEmits {
    'pdf-loaded': { pages: number; pdf: any }
    'pdf-error': any
    'page-rendered': { pageNum: number; viewport: any }
  }

  export interface PdfViewerExpose {
    reload: () => void
    changePage: (pageNum: number) => void
    changeScale: (scale: number) => void
    nextPage: () => void
    prevPage: () => void
    pdfPages: number
    pdfDoc: any
    currentPage: number
  }

  export const PdfViewer: ComponentPublicInstance<PdfViewerProps, PdfViewerExpose, PdfViewerEmits>

  export default PdfViewer
  export const PdfViewerName: string
}
