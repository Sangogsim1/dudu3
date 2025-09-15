import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateDressUpImage } from './geminiService';
import { ImageData } from './types';

const LoadingSpinner: React.FC<{ message?: string, subMessage?: string }> = ({ 
    message = "Generating image...",
    subMessage = "This may take a moment. Please wait." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-slate-400">
      <svg className="animate-spin h-10 w-10 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="font-semibold text-lg">{message}</p>
      <p className="text-sm">{subMessage}</p>
    </div>
  );
};

interface ImageUploaderProps {
  title: string;
  onImageUpload: (base64: string, mimeType: string) => void;
  uploadedImage: string | null;
  translations: {
    fileTypeError: string;
    fileSizeError: string;
    uploadClick: string;
    uploadHint: string;
  }
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, uploadedImage, translations }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(translations.fileTypeError);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError(translations.fileSizeError);
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onImageUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-slate-300 mb-2">{title}</label>
      <div
        className="relative flex-1 flex flex-col justify-center items-center p-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-colors duration-300 min-h-[200px]"
        onClick={handleBoxClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {uploadedImage ? (
          <img src={uploadedImage} alt={title} className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center text-slate-500">
            <Icon />
            <p className="font-semibold">{translations.uploadClick}</p>
            <p className="text-xs">{translations.uploadHint}</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

const translations = {
  ko: {
    appTitle: "AI 캐릭터 옷 입히기",
    appSubtitle: "여여부동산",
    appDescription: "Gemini AI의 힘으로 캐릭터와 의상을 결합하세요",
    step1Title: "1. 이미지 업로드",
    characterImageTitle: "캐릭터 이미지",
    clothingImageTitle: "의상 이미지",
    step2Title: "2. 조합 설명",
    promptPlaceholder: "예: '이 셔츠를 캐릭터에게 자연스럽게 입혀주세요. 스타일은 모던하고 세련되게 해주세요.' 사이즈 조절에 대한 지시도 가능합니다.",
    moderationWarning: "참고: 부적절하거나 노출이 심한 의상(속옷, 비키니 등)에 대한 요청은 제한됩니다.",
    generateButton: "조합 생성하기",
    generatingButton: "생성 중...",
    resultTitle: "결과",
    resultPlaceholder: "생성된 이미지가 여기에 표시됩니다.",
    errorTitle: "생성 실패",
    errorGeneric: "알 수 없는 오류가 발생했습니다.",
    errorNoImage: "AI가 이미지를 반환하지 않았습니다. 더 명확한 프롬프트로 다시 시도해주세요.",
    errorGenerationFailed: "이미지 생성 실패: {message}",
    fileTypeError: "잘못된 파일 형식입니다. PNG, JPG, WEBP 파일을 사용해주세요.",
    fileSizeError: "파일이 너무 큽니다. 최대 크기는 4MB입니다.",
    uploadClick: "클릭하여 업로드",
    uploadHint: "PNG, JPG, WEBP, 최대 4MB",
    loadingMessage: "이미지 생성 중...",
    loadingSubMessage: "시간이 걸릴 수 있습니다. 잠시만 기다려주세요.",
    lang_ko: "한국어",
    lang_en: "English",
    downloadButton: "이미지 다운로드",
  },
  en: {
    appTitle: "AI Character Dress-Up",
    appSubtitle: "Yeoyeo Real Estate",
    appDescription: "Combine characters and outfits with the power of Gemini AI",
    step1Title: "1. Upload Images",
    characterImageTitle: "Character Image",
    clothingImageTitle: "Clothing Image",
    step2Title: "2. Describe Combination",
    promptPlaceholder: "e.g., 'Put this shirt on the character naturally. Make the style modern and chic.' You can also give instructions on size adjustment.",
    moderationWarning: "Note: Requests for inappropriate or revealing clothing (e.g., underwear, bikinis) are restricted.",
    generateButton: "Generate Combination",
    generatingButton: "Generating...",
    resultTitle: "Result",
    resultPlaceholder: "The generated image will be displayed here.",
    errorTitle: "Generation Failed",
    errorGeneric: "An unknown error occurred.",
    errorNoImage: "The AI did not return an image. It might have returned text instead. Please try again with a clearer prompt.",
    errorGenerationFailed: "Image generation failed: {message}",
    fileTypeError: "Invalid file type. Please use PNG, JPG, or WEBP files.",
    fileSizeError: "File is too large. The maximum size is 4MB.",
    uploadClick: "Click to upload",
    uploadHint: "PNG, JPG, WEBP, Max 4MB",
    loadingMessage: "Generating image...",
    loadingSubMessage: "This may take a moment. Please wait.",
    lang_ko: "한국어",
    lang_en: "English",
    downloadButton: "Download Image",
  }
};

type Language = 'ko' | 'en';
type TranslationKey = keyof typeof translations.ko;

const App: React.FC = () => {
  const [characterImage, setCharacterImage] = useState<ImageData | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('ko');
  const [apiBase, setApiBase] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('API_BASE') || ''
  });

  const t = useCallback((key: TranslationKey) => {
    return (translations as any)[language][key] || (translations as any)['en'][key];
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('API_BASE', apiBase || '');
    }
  }, [apiBase]);

  const handleCharacterUpload = (base64: string, mimeType: string) => {
    setCharacterImage({ base64, mimeType });
  };

  const handleClothingUpload = (base64: string, mimeType: string) => {
    setClothingImage({ base64, mimeType });
  };
  
  const canGenerate = !!(characterImage && clothingImage && prompt.trim() && !isLoading);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateDressUpImage(characterImage!, clothingImage!, prompt);
      setGeneratedImage(result);
    } catch (err) {
      let errorMessage = t('errorGeneric');
      if (err instanceof Error) {
        if (err.message === 'NO_IMAGE_RETURNED') {
          errorMessage = t('errorNoImage');
        } else if (err.message.startsWith('GENERATION_FAILED:')) {
          const specificError = err.message.replace('GENERATION_FAILED:', '');
          errorMessage = t('errorGenerationFailed').replace('{message}', specificError);
        } else {
            errorMessage = t('errorGeneric');
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [characterImage, clothingImage, prompt, canGenerate, t]);
  
  const imageUploaderTranslations = {
    fileTypeError: t('fileTypeError'),
    fileSizeError: t('fileSizeError'),
    uploadClick: t('uploadClick'),
    uploadHint: t('uploadHint'),
  };

  const LanguageSwitcher = () => {
    const activeLangClass = "bg-indigo-600 text-white font-semibold";
    const inactiveLangClass = "bg-slate-700 hover:bg-slate-600 text-slate-300";
    return (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
            <div className="flex space-x-1 rounded-lg p-1 bg-slate-800 border border-slate-700">
                <button onClick={() => setLanguage('ko')} className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${language === 'ko' ? activeLangClass : inactiveLangClass}`}>
                    {t('lang_ko')}
                </button>
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${language === 'en' ? activeLangClass : inactiveLangClass}`}>
                    {t('lang_en')}
                </button>
            </div>
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto relative">
        <LanguageSwitcher />
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            {t('appTitle')}
          </h1>
          <p className="text-xl text-slate-300 mt-2">{t('appSubtitle')}</p>
          <p className="text-lg text-slate-400 mt-4">
            {t('appDescription')}
          </p>
          <div className="mt-4 max-w-3xl mx-auto">
            <label className="block text-sm text-slate-400 mb-1">API Base URL (예: https://your-vercel-app.vercel.app)</label>
            <input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="https://your-vercel-app.vercel.app"
              className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">변경 시 자동 저장됩니다. GitHub Pages 사용 시 필수로 설정하세요.</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col gap-8">
            <section>
              <h2 className="text-xl font-bold mb-4 text-white">{t('step1Title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader 
                  title={t('characterImageTitle')} 
                  onImageUpload={handleCharacterUpload}
                  uploadedImage={characterImage ? `data:${characterImage.mimeType};base64,${characterImage.base64}` : null}
                  translations={imageUploaderTranslations}
                />
                <ImageUploader 
                  title={t('clothingImageTitle')} 
                  onImageUpload={handleClothingUpload}
                  uploadedImage={clothingImage ? `data:${clothingImage.mimeType};base64,${clothingImage.base64}` : null}
                  translations={imageUploaderTranslations}
                />
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4 text-white">{t('step2Title')}</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-28 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder={t('promptPlaceholder')}
              />
              <p className="text-xs text-slate-500 mt-2">{t('moderationWarning')}</p>
            </section>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                canGenerate
                  ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-600 cursor-not-allowed'
              }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 7.45l-4.24 1.22c-1.56.45-2.1 2.4-1.04 3.46L5.45 15 4.22 19.24c-.45 1.56 1.38 2.83 2.82 2.18L12 19.35l4.24-1.22c1.56-.45 2.1-2.4 1.04-3.46L14.55 15l1.22-4.24c.45-1.56-1.38-2.83-2.82-2.18L8 7.45z" clipRule="evenodd" />
                </svg>
                {isLoading ? t('generatingButton') : t('generateButton')}
            </button>
             {error && (
              <div className="mt-4 text-center bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg">
                <p className="font-semibold">{t('errorTitle')}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col">
             <h2 className="text-xl font-bold mb-4 text-white">{t('resultTitle')}</h2>
             <div className="flex-1 flex justify-center items-center bg-slate-900/50 rounded-lg min-h-[400px]">
                {isLoading && <LoadingSpinner message={t('loadingMessage')} subMessage={t('loadingSubMessage')} />}
                {!isLoading && generatedImage && (
                  <img src={generatedImage} alt="Generated combination" className="max-h-full max-w-full object-contain rounded-md" />
                )}
                {!isLoading && !generatedImage && (
                    <p className="text-slate-500">{t('resultPlaceholder')}</p>
                )}
             </div>
             {!isLoading && generatedImage && (
                <div className="mt-4">
                    <a
                        href={generatedImage}
                        download="generated-character.png"
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 cursor-pointer transition-all duration-300"
                        aria-label={t('downloadButton')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {t('downloadButton')}
                    </a>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

