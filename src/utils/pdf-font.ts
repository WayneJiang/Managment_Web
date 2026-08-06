import type jsPDF from "jspdf";

/**
 * jsPDF 的中文字型載入
 *
 * jsPDF 的 addFont() 第一個參數是它自己的虛擬檔案系統（VFS）鍵名，不是網址，
 * 不會替我們去抓 public/fonts 下的檔案；沒先 addFileToVFS 就用中文字，
 * 會在 doc.text() 讀字寬時炸掉。所以流程一定是 fetch → base64 → addFileToVFS → addFont。
 */

export const PDF_FONT_FAMILY = "NotoSansTC";

const FONT_FILES = {
  normal: "NotoSansTC-Regular.ttf",
  bold: "NotoSansTC-Bold.ttf",
} as const;

type FontData = Record<keyof typeof FONT_FILES, string>;

// 兩個字型檔各 7MB，抓一次就留著，同一個分頁的第二次匯出不用重來
let fontDataPromise: Promise<FontData> | null = null;

/**
 * 一次 btoa 整個 7MB 會爆掉呼叫堆疊，分塊組字串
 */
const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

const fetchFontBase64 = async (fileName: string): Promise<string> => {
  const response = await fetch(`/fonts/${fileName}`);
  if (!response.ok) {
    throw new Error(`字型載入失敗：${fileName}（${response.status}）`);
  }
  return toBase64(await response.arrayBuffer());
};

const loadFontData = (): Promise<FontData> => {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all([
      fetchFontBase64(FONT_FILES.normal),
      fetchFontBase64(FONT_FILES.bold),
    ])
      .then(([normal, bold]) => ({ normal, bold }))
      .catch((error) => {
        // 失敗的 promise 留著會讓之後每次匯出都直接拿到同一個錯誤，清掉才有機會重試
        fontDataPromise = null;
        throw error;
      });
  }

  return fontDataPromise;
};

/**
 * 將中文字型註冊進這份文件並設為預設字型
 */
export const applyChineseFont = async (doc: jsPDF): Promise<void> => {
  const fonts = await loadFontData();

  doc.addFileToVFS(FONT_FILES.normal, fonts.normal);
  doc.addFileToVFS(FONT_FILES.bold, fonts.bold);
  doc.addFont(FONT_FILES.normal, PDF_FONT_FAMILY, "normal");
  doc.addFont(FONT_FILES.bold, PDF_FONT_FAMILY, "bold");
  doc.setFont(PDF_FONT_FAMILY);
};
